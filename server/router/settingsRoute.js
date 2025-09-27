const express = require("express")
const router = express.Router()
const Settings = require("../model/settings-model")
const { authMiddleware } = require("../middleware/auth-middleware")
const { adminMiddleware } = require("../middleware/adminMiddleware")
const upload = require("../middleware/multer-middleware")

// Get site settings (public)
router.get("/", async (req, res) => {
  try {
    const settings = await Settings.getSiteSettings()
    res.json(settings)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update site settings (admin only)
router.put("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const settings = await Settings.getSiteSettings()
    Object.assign(settings, req.body)
    await settings.save()

    res.json({ message: "Settings updated successfully", settings })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Upload logo
router.post("/logo", authMiddleware, adminMiddleware, upload.single("logo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const settings = await Settings.getSiteSettings()
    settings.logo = {
      url: req.file.path,
      public_id: req.file.filename,
    }
    await settings.save()

    res.json({ message: "Logo updated successfully", settings })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
