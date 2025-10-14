const mongoose = require("mongoose")

const razorpaySchema = new mongoose.Schema(
  {
    paymentId: String,
    orderId: String,
    signature: String,
    method: String, // card/netbanking/wallet/upi
    bank: String,
    wallet: String,
    vpa: String,
    cardLast4: String,
  },
  { _id: false },
)

const paymentTxnSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    gateway: { type: String, enum: ["razorpay", "paypal", "stripe"], required: true },
    status: { type: String, enum: ["created", "verified", "failed"], default: "created" },
    amount: { type: Number, default: 0 }, // in paise for razorpay
    currency: { type: String, default: "INR" },
    razorpay: razorpaySchema,
    raw: { type: Object }, // full payload snapshot
  },
  { timestamps: true },
)

module.exports = mongoose.model("PaymentTransaction", paymentTxnSchema)
