const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const { authMiddleware } = require("../middleware/auth-middleware")
const { adminMiddleware } = require("../middleware/adminMiddleware")

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    banner: { url: String, public_id: String },
    startsAt: Date,
    endsAt: Date,
    active: { type: Boolean, default: true },
    ctaText: { type: String, default: "" },
    ctaHref: { type: String, default: "" },
  },
  { timestamps: true },
)
const Event = mongoose.model("Event", eventSchema)

// Public: list active events (for home)
router.get("/", async (req, res) => {
  const now = new Date()
  const events = await Event.find({
    active: true,
    $or: [{ startsAt: { $lte: now } }, { startsAt: { $exists: false } }],
  })
    .sort({ createdAt: -1 })
    .limit(5)
  res.json(events)
})

// Admin: create/update
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  const ev = await Event.create(req.body)
  res.status(201).json({ message: "Event created", event: ev })
})

router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const ev = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!ev) return res.status(404).json({ message: "Event not found" })
  res.json({ message: "Event updated", event: ev })
})

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  await Event.findByIdAndDelete(req.params.id)
  res.json({ message: "Event deleted" })
})

module.exports = router
