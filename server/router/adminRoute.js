const express = require("express")
const router = express.Router()
const Product = require("../model/product-model")
const User = require("../model/userModel")
const Order = require("../model/order-model")
const Settings = require("../model/settings-model")
const { authMiddleware } = require("../middleware/auth-middleware")
const { adminMiddleware } = require("../middleware/adminMiddleware")
const { checkPermission } = require("../middleware/permission-middleware")
const { cloudinary } = require("../config/cloudinary")
const PDFDocument = require("pdfkit")
const fetch = require("node-fetch")
const { generateAndUploadInvoice } = require("../utils/invoice")

// Apply auth and admin middleware to all routes
router.use(authMiddleware, adminMiddleware)

// Dashboard stats
router.get("/stats", checkPermission("dashboard", "view"), async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true })
    const totalUsers = await User.countDocuments({ isAdmin: false }) // fix invalid query that caused cast errors; count non-admin users instead of role: "user"
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
router.get("/products", checkPermission("products", "view"), async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query
    const query = {}

    if (category) {
      query.category = category
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ]
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Product.countDocuments(query)

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Helper to normalize images input (array or JSON string)
const normalizeImages = (input) => {
  if (!input) return []
  let arr = input
  if (typeof input === "string") {
    try {
      arr = JSON.parse(input)
    } catch {
      return []
    }
  }
  if (!Array.isArray(arr)) arr = [arr]
  return arr
    .filter(Boolean)
    .map((img) => ({
      url: img?.url || img?.path || img?.secure_url || null,
      public_id: img?.public_id || img?.publicId || img?.filename || null,
    }))
    .filter((i) => i.url && i.public_id)
}

router.post("/products", checkPermission("products", "create"), async (req, res) => {
  try {
    const body = { ...req.body }

    // Normalize images
    body.images = normalizeImages(body.images)

    const product = await Product.create(body)
    return res.status(201).json({ message: "Product created successfully", product })
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.put("/products/:id", checkPermission("products", "update"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Normalize incoming images
    const incomingImages = normalizeImages(req.body.images)

    // replaceImages can be true/"true" to fully replace existing images
    const replaceImages =
      req.body.replaceImages === true || req.body.replaceImages === "true" || req.query.replaceImages === "true"

    // removeImageIds can be array or JSON string; all matching public_ids will be deleted and removed
    let removeImageIds = req.body.removeImageIds
    if (typeof removeImageIds === "string") {
      try {
        removeImageIds = JSON.parse(removeImageIds)
      } catch {
        removeImageIds = []
      }
    }
    if (!Array.isArray(removeImageIds)) removeImageIds = []

    // Build new images list
    let newImages
    if (replaceImages) {
      newImages = incomingImages
    } else {
      // merge existing + incoming by public_id
      const byId = new Map()
      ;(Array.isArray(product.images) ? product.images : []).forEach((img) => {
        if (img?.public_id) byId.set(img.public_id, { url: img.url, public_id: img.public_id })
      })
      incomingImages.forEach((img) => {
        if (img?.public_id) byId.set(img.public_id, { url: img.url, public_id: img.public_id })
      })
      newImages = Array.from(byId.values())
    }

    // Remove explicitly requested image public_ids
    if (removeImageIds.length) {
      const setToRemove = new Set(removeImageIds)
      const toDelete = (Array.isArray(product.images) ? product.images : []).filter(
        (img) => img?.public_id && setToRemove.has(img.public_id),
      )
      // Fire-and-forget deletion; don't block update if a deletion fails
      Promise.allSettled(
        toDelete.map((img) =>
          cloudinary.uploader.destroy(img.public_id, {
            resource_type: "image",
          }),
        ),
      ).catch(() => {})

      newImages = newImages.filter((img) => !setToRemove.has(img.public_id))
    }

    // Apply other fields (excluding images-related control fields)
    const updatable = { ...req.body }
    delete updatable.images
    delete updatable.replaceImages
    delete updatable.removeImageIds

    product.set({ ...updatable, images: newImages })
    const saved = await product.save()

    return res.json({ message: "Product updated successfully", product: saved })
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.delete("/products/:id", checkPermission("products", "delete"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    const images = Array.isArray(product.images) ? product.images : []
    const publicIds = images.map((img) => img?.public_id || img?.publicId || img?.filename).filter(Boolean)

    if (publicIds.length) {
      try {
        await Promise.all(
          publicIds.map((pid) =>
            cloudinary.uploader.destroy(pid, {
              resource_type: "image",
            }),
          ),
        )
      } catch (err) {
        // log but do not block deletion if some images fail to delete
        console.log("Cloudinary delete error:", err?.message || err)
      }
    }

    await product.deleteOne()
    return res.json({ message: "Product and images deleted successfully" })
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message })
  }
})

// User management
router.get("/users", checkPermission("users", "view"), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const users = await User.find()
      .populate("role", "name description")
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments()

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
router.get("/orders", checkPermission("orders", "view"), async (req, res) => {
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

// Admin get single order details
router.get("/orders/:id", checkPermission("orders", "view"), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate("items.productId", "name images price")
    if (!order) return res.status(404).json({ message: "Order not found" })
    res.json(order)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Admin invoice download (stream or redirect; generate if missing)
router.get("/orders/:id/invoice.pdf", checkPermission("orders", "view"), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.productId", "name images")
    if (!order) return res.status(404).json({ message: "Order not found" })

    if (order.invoiceUrl) {
      try {
        const resp = await fetch(order.invoiceUrl)
        if (!resp.ok) {
          return res.status(502).json({ message: "Could not fetch invoice from storage" })
        }
        const ct = resp.headers.get("content-type") || "application/pdf"
        const buf = Buffer.from(await resp.arrayBuffer())
        res.setHeader("Content-Type", ct)
        res.setHeader("Content-Disposition", `attachment; filename="invoice-${order._id}.pdf"`)
        return res.status(200).send(buf)
      } catch (err) {
        return res.redirect(order.invoiceUrl)
      }
    }

    // If missing, build and upload then stream
    try {
      const url = await generateAndUploadInvoice(order)
      order.invoiceUrl = url
      await order.save()
      const resp = await fetch(url)
      const ct = resp.headers.get("content-type") || "application/pdf"
      const buf = Buffer.from(await resp.arrayBuffer())
      res.setHeader("Content-Type", ct)
      res.setHeader("Content-Disposition", `attachment; filename="invoice-${order._id}.pdf"`)
      return res.status(200).send(buf)
    } catch (e) {
      // fallback to inline pdf generation
      res.setHeader("Content-Type", "application/pdf")
      res.setHeader("Content-Disposition", `attachment; filename="invoice-${order._id}.pdf"`)
      const doc = new PDFDocument({ margin: 40 })
      doc.pipe(res)
      doc.fontSize(18).text("Order Invoice", { align: "center" }).moveDown()
      doc
        .fontSize(12)
        .text(`Order ID: ${order._id}`)
        .text(`Date: ${new Date(order.createdAt).toLocaleString()}`)
      if (order.expectedDeliveryDate) {
        doc.text(`Expected Delivery: ${new Date(order.expectedDeliveryDate).toDateString()}`)
      }
      doc.moveDown()
      doc.text("Ship To:")
      doc.text(`${order.shippingAddress.fullName}`)
      doc.text(`${order.shippingAddress.address}`)
      doc.text(`${order.shippingAddress.city} ${order.shippingAddress.postalCode}`)
      doc.text(`${order.shippingAddress.country}`)
      doc.moveDown()
      doc.text("Items:")
      order.items.forEach((it) => {
        doc.text(
          `- ${it.name} x ${it.quantity} @ ₹${Number(it.price).toFixed(2)} = ₹${(
            Number(it.price) * Number(it.quantity)
          ).toFixed(2)}`,
        )
      })
      doc.moveDown()
      doc.text(`Items: ₹${Number(order.itemsPrice).toFixed(2)}`)
      doc.text(`Shipping: ₹${Number(order.shippingPrice).toFixed(2)}`)
      doc.text(`Tax: ₹${Number(order.taxPrice).toFixed(2)}`)
      doc.text(`Total: ₹${Number(order.totalAmount).toFixed(2)}`, { align: "right" })
      doc.end()
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to generate invoice", error: error.message })
  }
})

router.put("/orders/:id/status", checkPermission("orders", "update"), async (req, res) => {
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
