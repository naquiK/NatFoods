const mongoose = require("mongoose")

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  name: String,
  image: String,
})

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: String,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["card", "paypal", "cod"],
    },
    paymentStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "paid", "failed", "refunded"],
    },
    itemsPrice: {
      type: Number,
      required: true,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    },
    deliveredAt: Date,
    notes: String,
  },
  {
    timestamps: true,
  },
)

const Order = mongoose.model("Order", orderSchema)

module.exports = Order
