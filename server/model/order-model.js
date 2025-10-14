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
      enum: ["card", "paypal", "cod", "razorpay"], // Updated to allow razorpay
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
    expectedDeliveryDate: Date, // Added expectedDeliveryDate
    invoiceUrl: { type: String }, // Added invoiceUrl to store Cloudinary PDF URL
    invoicePublicId: { type: String },
    invoiceResourceType: { type: String, default: "raw" },
    cancelReason: { type: String, default: "" },
    paymentInfo: {
      gateway: { type: String, enum: ["razorpay", "paypal", "card", "cod"] },
      paymentId: { type: String, default: "" }, // e.g., razorpay_payment_id
      gatewayOrderId: { type: String, default: "" }, // e.g., razorpay_order_id
      signature: { type: String, default: "" }, // e.g., razorpay_signature
      method: { type: String, default: "" }, // card/netbanking/wallet/upi
      bank: { type: String, default: "" },
      wallet: { type: String, default: "" },
      vpa: { type: String, default: "" }, // upi id
      cardLast4: { type: String, default: "" },
      capturedAt: { type: Date },
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "INR" },
    },
    returnRequested: {
      type: Boolean,
      default: false,
    },
    returnReason: { type: String, default: "" },
    returnStatus: {
      type: String,
      enum: ["none", "pending", "accepted", "declined"],
      default: "none",
    },
    returnResolvedAt: { type: Date },

    exchangeRequested: {
      type: Boolean,
      default: false,
    },
    exchangeReason: { type: String, default: "" },
    exchangeStatus: {
      type: String,
      enum: ["none", "pending", "accepted", "declined"],
      default: "none",
    },
    exchangeResolvedAt: { type: Date },
  },
  {
    timestamps: true,
  },
)

const Order = mongoose.model("Order", orderSchema)

module.exports = Order
