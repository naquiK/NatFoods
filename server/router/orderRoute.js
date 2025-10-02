const express = require("express")
const router = express.Router()
const Order = require("../model/order-model")
const Cart = require("../model/cart-model")
const Product = require("../model/product-model")
const { authMiddleware } = require("../middleware/auth-middleware")

// Apply auth middleware to all routes
router.use(authMiddleware)

// Create new order
router.post("/", async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, items } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" })
    }

    // Validate stock for all items
    for (const item of items) {
      const product = await Product.findById(item.productId)
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` })
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` })
      }
    }

    // Calculate prices
    let itemsPrice = 0
    const orderItems = []

    for (const item of items) {
      const product = await Product.findById(item.productId)
      const price = product.effectivePrice
      itemsPrice += price * item.quantity

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: price,
        name: product.name,
        image: product.images[0]?.url || "",
      })

      // Reduce stock
      await product.reduceStock(item.quantity)
    }

    const shippingPrice = itemsPrice > 500 ? 0 : 50 // Free shipping over rs500
    const taxPrice = itemsPrice * 0.1 // 10% tax
    const totalAmount = itemsPrice + shippingPrice + taxPrice

    const order = new Order({
      userId: req.user.userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalAmount,
      paymentStatus: paymentMethod === "razorpay" ? "paid" : "pending",
    })

    await order.save()

    // Clear user's cart
    await Cart.findOneAndUpdate({ userId: req.user.userId }, { items: [], totalAmount: 0 })

    res.status(201).json({ message: "Order created successfully", order })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get user's orders
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query

    const orders = await Order.find({ userId: req.user.userId })
      .populate("items.productId", "name images")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Order.countDocuments({ userId: req.user.userId })

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get single order
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    }).populate("items.productId", "name images")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Cancel order
router.put("/:id/cancel", async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    if (order.status !== "pending") {
      return res.status(400).json({ message: "Order cannot be cancelled" })
    }

    order.status = "cancelled"
    await order.save()

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } })
    }

    res.json({ message: "Order cancelled successfully", order })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
