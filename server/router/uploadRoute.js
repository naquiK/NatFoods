const express = require("express")
const router = express.Router()
const { upload, cloudinary } = require("../middleware/upload")
const Product = require("../model/product-model")
const { authMiddleware } = require("../middleware/auth-middleware")
const { adminMiddleware } = require("../middleware/adminMiddleware")

// Upload single image
router.post("/image", authMiddleware, adminMiddleware, async (req, res) => {
  // run multer single upload and handle errors from multer explicitly
  upload.single("image")(req, res, async (err) => {
    if (err) {
      console.error("Multer upload error (single):", err.stack || err)
      return res.status(400).json({ success: false, message: err.message || "File upload error" })
    }

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" })
      }

      // Some storage engines use different properties; accept common fallbacks
      let url = req.file.path || req.file.secure_url || req.file.location || req.file.url
      let public_id = req.file.filename || req.file.public_id || req.file.key || req.file.originalname || req.file.publicId

      // If storage returned a URL but not a public_id, try to extract it from the URL path
      if (url && !public_id) {
        try {
          const u = new URL(url)
          let pathname = u.pathname || ""
          const uploadIndex = pathname.indexOf("/upload/")
          if (uploadIndex >= 0) {
            let after = pathname.slice(uploadIndex + "/upload/".length)
            // remove possible version prefix like v123/
            after = after.replace(/^v\d+\//, "")
            // strip file extension
            after = after.replace(/\.[^/.]+$/, "")
            // remove leading slash if present
            after = after.replace(/^\//, "")
            public_id = after || public_id
          }
        } catch (parseErr) {
          console.warn("Could not parse URL to extract public_id", parseErr && (parseErr.message || parseErr))
        }
      }

      if (!url || !public_id) {
        console.error("Upload provider missing returned identifiers", { file: req.file })
        return res.status(500).json({ success: false, message: "Upload provider did not return URL/public_id", file: req.file })
      }

      const payload = { url, public_id }

      return res.json({
        success: true,
        url: payload.url,
        public_id: payload.public_id,
        files: [payload],
      })
    } catch (error) {
      console.error("Upload error (single):", error.stack || error)
      return res.status(500).json({ success: false, message: "Upload failed", error: error.message })
    }
  })
})

// Upload multiple images
router.post("/images", authMiddleware, adminMiddleware, async (req, res) => {
  upload.array("images", 10)(req, res, async (err) => {
    if (err) {
      console.error("Multer upload error (array):", err.stack || err)
      return res.status(400).json({ success: false, message: err.message || "File upload error" })
    }

    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: "No files uploaded" })
      }

      const uploadedFiles = req.files
        .map((file) => {
          let url = file?.path || file?.secure_url || file?.location || file?.url
          let public_id = file?.filename || file?.public_id || file?.key || file?.originalname || file?.publicId

          if (url && !public_id) {
            try {
              const u = new URL(url)
              let pathname = u.pathname || ""
              const uploadIndex = pathname.indexOf("/upload/")
              if (uploadIndex >= 0) {
                let after = pathname.slice(uploadIndex + "/upload/".length)
                after = after.replace(/^v\d+\//, "")
                after = after.replace(/\.[^/.]+$/, "")
                after = after.replace(/^\//, "")
                public_id = after || public_id
              }
            } catch (parseErr) {
              console.warn("Could not parse URL to extract public_id for file", parseErr && (parseErr.message || parseErr))
            }
          }

          return { url, public_id }
        }) 
        .filter((f) => f.url && f.public_id)
 
      if (uploadedFiles.length === 0) {
        console.error("Upload provider did not return URL/public_id for any files", { files: req.files })
        return res.status(500).json({ success: false, message: "Upload provider did not return URL/public_id" })
      }

      return res.json({ success: true, files: uploadedFiles })
    } catch (error) {
      console.error("Upload error (array):", error.stack || error)
      return res.status(500).json({ success: false, message: "Upload failed", error: error.message })
    }
  })
})

// Delete image
router.delete("/image/:public_id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { public_id } = req.params
    if (!public_id) {
      return res.status(400).json({ success: false, message: "public_id is required" })
    }
    // Try deletion with default resource_type and with 'image' explicitly
    let result
    try {
      result = await cloudinary.uploader.destroy(public_id)
    } catch (firstErr) {
      console.warn("Cloudinary destroy failed (default attempt), retrying with resource_type='image'", firstErr && (firstErr.message || firstErr))
      try {
        result = await cloudinary.uploader.destroy(public_id, { resource_type: "image" })
      } catch (secondErr) {
        console.error("Cloudinary destroy failed on both attempts", { public_id, firstErr: firstErr && firstErr.message, secondErr: secondErr && secondErr.message })
        return res.status(500).json({ success: false, message: "Cloudinary deletion failed", error: (secondErr && secondErr.message) || (firstErr && firstErr.message) })
      }
    }

    console.debug("Cloudinary delete result", { public_id, result })
    if (result?.result === "ok" || result?.result === "not found") {
      // Also remove any DB references to this public_id in products.images
      try {
        const removed = { matched: 0, modified: 0 }
        const pullRes = await Product.updateMany(
          { 'images.public_id': public_id },
          { $pull: { images: { public_id } } }
        )
        removed.matched += pullRes.matchedCount || pullRes.n || 0
        removed.modified += pullRes.modifiedCount || pullRes.nModified || 0

        // If public_id contained folders (e.g. 'ekart/abc'), also try removing trailing segment matches
        const lastSegment = public_id.includes('/') ? public_id.split('/').pop() : null
        if (lastSegment && lastSegment !== public_id) {
          const pullRes2 = await Product.updateMany(
            { 'images.public_id': lastSegment }, 
            { $pull: { images: { public_id: lastSegment } } }
          )
          removed.matched += pullRes2.matchedCount || pullRes2.n || 0
          removed.modified += pullRes2.modifiedCount || pullRes2.nModified || 0
        }

        return res.json({ success: true, message: "Image deleted (or already removed)", result, dbRemoved: removed })
      } catch (dbErr) {
        console.error('Failed to remove DB references for', public_id, dbErr)
        return res.json({ success: true, message: 'Image deleted but DB cleanup failed', result, dbError: dbErr.message })
      }
    }

    // If Cloudinary returned a different response, surface it to the client for debugging
    return res.status(400).json({ success: false, message: "Failed to delete image", result })
  } catch (error) {
    console.error("Delete error:", error)
    return res.status(500).json({ success: false, message: "Delete failed", error: error.message })
  }
})

module.exports = router
