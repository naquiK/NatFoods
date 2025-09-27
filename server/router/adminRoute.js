const express = require("express")
const router = express.Router()
const Product = require("../model/product-model")
const User = require("../model/userModel")
const Order = require("../model/order-model")
const Settings = require("../model/settings-model")
const { authMiddleware } = require("../middleware/auth-middleware")
const { adminMiddleware } = require("../middleware/adminMiddleware")
const upload = require("../middleware/multer-middleware")

// Apply auth and admin middleware to all routes
router.use(authMiddleware, adminMiddleware)

// Dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true })
    const totalUsers = await User.countDocuments({ role: "user" })
    const totalOrders = await Order.countDocuments()
    const totalRevenue = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ])

    const recentOrders = await Order.find().populate("userId", "name email").sort({ createdAt: -1 }).limit(5)

    const lowStockProducts = await Product.find({
      $expr: { $lte: ["$stock", "$lowStockThreshold"] },
      isActive: true,
    }).limit(10)

    res.json({
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders,
      lowStockProducts,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Product management
router.post("/products", upload.array("images", 5), async (req, res) => {
  try {
    const productData = { ...req.body }

    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }))
    }

    const product = new Product(productData)
    await product.save()

    res.status(201).json({ message: "Product created successfully", product })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.put("/products/:id", upload.array("images", 5), async (req, res) => {
  try {
    const productData = { ...req.body }

    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }))
    }

    const product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true })

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({ message: "Product updated successfully", product })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({ message: "Product deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// User management
router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments({ role: "user" })

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Order management
router.get("/orders", async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query
    const query = status ? { status } : {}

    const orders = await Order.find(query)
      .populate("userId", "name email")
      .populate("items.productId", "name price images")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Order.countDocuments(query)

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

router.put("/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.json({ message: "Order status updated successfully", order })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
