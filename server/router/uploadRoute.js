const express = require("express")
const router = express.Router()
const { upload, cloudinary } = require("../middleware/upload")
const { verifyToken, admin } = require("../middleware/auth-middleware")


// Upload single image
router.post("/image", verifyToken, admin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    res.json({
      success: true,
      url: req.file.path,
      public_id: req.file.filename,
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ message: "Upload failed", error: error.message })
  }
})

// Upload multiple images
router.post("/images", verifyToken, admin, upload.array("images", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" })
    }

    const uploadedFiles = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }))

    res.json({
      success: true,
      files: uploadedFiles,
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ message: "Upload failed", error: error.message })
  }
})

// Delete image
router.delete("/image/:public_id", verifyToken, admin, async (req, res) => {
  try {
    const { public_id } = req.params

    const result = await cloudinary.uploader.destroy(public_id)

    if (result.result === "ok") {
      res.json({ success: true, message: "Image deleted successfully" })
    } else {
      res.status(400).json({ success: false, message: "Failed to delete image" })
    }
  } catch (error) {
    console.error("Delete error:", error)
    res.status(500).json({ message: "Delete failed", error: error.message })
  }
})

module.exports = router
