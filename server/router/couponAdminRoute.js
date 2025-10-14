const express = require("express")
const router = express.Router()
const { authMiddleware } = require("../middleware/auth-middleware")
const { adminMiddleware } = require("../middleware/adminMiddleware")
const { checkPermission } = require("../middleware/permission-middleware")
const Coupon = require("../model/coupon-model")

router.use(authMiddleware, adminMiddleware)

// List coupons
router.get("/", checkPermission("coupons", "view"), async (req, res) => {
  try {
    const list = await Coupon.find().sort({ createdAt: -1 })
    res.json({ coupons: list })
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch coupons", error: e.message })
  }
})

// Create coupon
router.post("/", checkPermission("coupons", "create"), async (req, res) => {
  try {
    const payload = { ...req.body, code: String(req.body.code || "").toUpperCase(), createdBy: req.user._id }
    const c = await Coupon.create(payload)
    res.status(201).json({ message: "Coupon created", coupon: c })
  } catch (e) {
    res.status(500).json({ message: "Failed to create coupon", error: e.message })
  }
})

// Update coupon
router.put("/:id", checkPermission("coupons", "update"), async (req, res) => {
  try {
    const { id } = req.params
    const payload = { ...req.body }
    if (payload.code) payload.code = String(payload.code).toUpperCase()
    const c = await Coupon.findByIdAndUpdate(id, payload, { new: true })
    if (!c) return res.status(404).json({ message: "Coupon not found" })
    res.json({ message: "Coupon updated", coupon: c })
  } catch (e) {
    res.status(500).json({ message: "Failed to update coupon", error: e.message })
  }
})

// Delete coupon
router.delete("/:id", checkPermission("coupons", "delete"), async (req, res) => {
  try {
    const { id } = req.params
    const c = await Coupon.findByIdAndDelete(id)
    if (!c) return res.status(404).json({ message: "Coupon not found" })
    res.json({ message: "Coupon deleted" })
  } catch (e) {
    res.status(500).json({ message: "Failed to delete coupon", error: e.message })
  }
})

module.exports = router
