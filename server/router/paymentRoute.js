const express = require("express")
const router = express.Router()
const axios = require("axios")
const { authMiddleware } = require("../middleware/auth-middleware")

router.use(authMiddleware)

router.post("/razorpay/order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" })
    }
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret) {
      return res.status(500).json({ message: "Razorpay keys not configured" })
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64")
    const { data } = await axios.post(
      "https://api.razorpay.com/v1/orders",
      { amount, currency, receipt },
      { headers: { Authorization: `Basic ${auth}` } },
    )

    res.json(data)
  } catch (error) {
    console.error("Razorpay order error:", error?.response?.data || error.message)
    res.status(500).json({ message: "Failed to create Razorpay order" })
  }
})

module.exports = router
