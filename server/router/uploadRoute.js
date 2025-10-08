const express = require("express")
const router = express.Router()
const { upload, cloudinary } = require("../middleware/upload")
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
      const url = req.file.path || req.file.secure_url || req.file.location
      const public_id = req.file.filename || req.file.public_id || req.file.key || req.file.originalname

      if (!url || !public_id) {
        console.error("Upload provider missing returned identifiers", { file: req.file })
        return res.status(500).json({ success: false, message: "Upload provider did not return URL/public_id" })
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
        .map((file) => ({
          url: file?.path || file?.secure_url || file?.location,
          public_id: file?.filename || file?.public_id || file?.key || file?.originalname,
        }))
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

    const result = await cloudinary.uploader.destroy(public_id)
    if (result?.result === "ok" || result?.result === "not found") {
      return res.json({ success: true, message: "Image deleted (or already removed)" })
    }
    return res.status(400).json({ success: false, message: "Failed to delete image" })
  } catch (error) {
    console.error("Delete error:", error)
    return res.status(500).json({ success: false, message: "Delete failed", error: error.message })
  }
})

module.exports = router
