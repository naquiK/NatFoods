const express = require("express")
const router = express.Router()
const axios = require("axios")
const crypto = require("crypto")
const { authMiddleware } = require("../middleware/auth-middleware")
const PaymentTxn = require("../model/payment-transaction-model")
const Order = require("../model/order-model")

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

router.post("/razorpay/transactions", async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      amount,
      currency = "INR",
      orderId,
      method,
      bank,
      wallet,
      vpa,
      cardLast4,
    } = req.body || {}
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment fields" })
    }
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) return res.status(500).json({ message: "Razorpay keys not configured" })

    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSig = crypto.createHmac("sha256", keySecret).update(body).digest("hex")
    const verified = expectedSig === razorpay_signature

    const txn = await PaymentTxn.create({
      userId: req.user?._id,
      gateway: "razorpay",
      status: verified ? "verified" : "failed",
      amount: Number(amount || 0),
      currency,
      razorpay: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        signature: razorpay_signature,
        method: method || "",
        bank: bank || "",
        wallet: wallet || "",
        vpa: vpa || "",
        cardLast4: cardLast4 || "",
      },
      orderId: orderId || null,
      raw: req.body,
    })

    // Attach to order if provided and verification passed
    if (orderId && verified) {
      const order = await Order.findById(orderId)
      if (order) {
        order.paymentStatus = "paid"
        order.paymentInfo = {
          gateway: "razorpay",
          paymentId: razorpay_payment_id,
          gatewayOrderId: razorpay_order_id,
          signature: razorpay_signature,
          method: method || "",
          bank: bank || "",
          wallet: wallet || "",
          vpa: vpa || "",
          cardLast4: cardLast4 || "",
          capturedAt: new Date(),
          amount: Number(amount || 0) / 100,
          currency,
        }
        await order.save()
      }
    }

    return res.json({ message: "Payment recorded", verified, transactionId: txn._id })
  } catch (error) {
    console.error("Txn store error:", error?.message)
    return res.status(500).json({ message: "Failed to record transaction", error: error.message })
  }
})

module.exports = router
