const express = require("express")
const router = express.Router()
const Product = require("../model/product-model")
const User = require("../model/userModel")
const Order = require("../model/order-model")
const Settings = require("../model/settings-model")
const Sale = require("../model/sale-model")
const { authMiddleware } = require("../middleware/auth-middleware")
const { adminMiddleware } = require("../middleware/adminMiddleware")
const { checkPermission } = require("../middleware/permission-middleware")
const { cloudinary } = require("../config/cloudinary")
const PDFDocument = require("pdfkit")
const fetch = require("node-fetch")
const { generateAndUploadInvoice } = require("../utils/invoice")
const AuditLog = require("../model/audit-log-model")
const PaymentTransaction = require("../model/payment-transaction-model")

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

router.post("/products", checkPermission("products", "create"), async (req, res) => {
  try {
    const body = { ...req.body }

    // Normalize images
    body.images = normalizeImages(body.images)

    // Validate that each image contains both cloudinary url and public_id
    const invalid = (body.images || []).filter((img) => !img || !img.url || !img.public_id)
    if (invalid.length) {
      return res.status(400).json({ message: "All images must include 'url' and 'public_id' from Cloudinary. Upload images via /api/upload/image or /api/upload/images first." })
    }

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
    // Ensure saved images contain cloudinary url and public_id
    const bad = (product.images || []).filter((img) => !img || !img.url || !img.public_id)
    if (bad.length) {
      return res.status(400).json({ message: "Some images are missing 'url' or 'public_id' (use the upload endpoint to obtain proper values)." })
    }
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
        console.log("Cloudinary delete error:", err?.message || err)
      }
    }

    await product.deleteOne()
    logAction(req, "product.delete", { productId: req.params.id, imagesDeleted: publicIds.length })
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
      const uploadRes = await generateAndUploadInvoice(order)
      // persist useful metadata for later signed-url generation / proxy
      order.invoiceUrl = uploadRes?.secure_url || uploadRes?.url || uploadRes?.secureUrl
      order.invoicePublicId = uploadRes?.public_id || uploadRes?.publicId
      order.invoiceResourceType = uploadRes?.resource_type || "raw"
      await order.save()
      const resp = await fetch(order.invoiceUrl)
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
    const { status, reason } = req.body
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }
    order.status = status
    if (status === "cancelled") {
      if (!reason || String(reason).trim().length < 3) {
        return res.status(400).json({ message: "Cancel reason is required for cancelling an order" })
      }
      order.cancelReason = String(reason).slice(0, 500)
    }
    const saved = await order.save()

    logAction(req, "order.status.update", { orderId: order._id, status, reason: order.cancelReason || undefined })

    res.json({ message: "Order status updated successfully", order: saved })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.get("/orders/:id/payment", checkPermission("orders", "view"), async (req, res) => {
  try {
    const { id } = req.params
    const txns = await PaymentTransaction.find({ orderId: id }).sort({ createdAt: -1 })
    return res.json({ transactions: txns })
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch payment details", error: error.message })
  }
})

router.get("/orders/requests", checkPermission("orders", "view"), async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ returnRequested: true }, { exchangeRequested: true }],
    })
      .populate("userId", "name email")
      .populate("items.productId", "name images price")
      .sort({ createdAt: -1 })

    res.json({ orders })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.put("/orders/:id/return-request", checkPermission("orders", "update"), async (req, res) => {
  try {
    const { action, adminNote } = req.body || {}
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: "Order not found" })
    if (!order.returnRequested) return res.status(400).json({ message: "No return request on this order" })

    if (action === "accept") {
      // cancel order and restock
      order.status = "cancelled"
      order.returnStatus = "accepted"
      order.returnResolvedAt = new Date()
      order.cancelReason = adminNote ? String(adminNote).slice(0, 500) : order.cancelReason
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } })
      }
    } else if (action === "decline") {
      order.returnStatus = "declined"
      order.returnResolvedAt = new Date()
    } else {
      return res.status(400).json({ message: "Invalid action. Use 'accept' or 'decline'." })
    }

    // keep the audit trail that user requested once
    order.returnRequested = false
    await order.save()
    logAction(req, "order.return.update", { orderId: order._id, action, adminNote })
    res.json({ message: "Return request updated", order })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.put("/orders/:id/exchange-request", checkPermission("orders", "update"), async (req, res) => {
  try {
    const { action, adminNote } = req.body || {}
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: "Order not found" })
    if (!order.exchangeRequested) return res.status(400).json({ message: "No exchange request on this order" })

    if (action === "accept") {
      order.status = "cancelled"
      order.exchangeStatus = "accepted"
      order.exchangeResolvedAt = new Date()
      order.cancelReason = adminNote ? String(adminNote).slice(0, 500) : order.cancelReason
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } })
      }
    } else if (action === "decline") {
      order.exchangeStatus = "declined"
      order.exchangeResolvedAt = new Date()
    } else {
      return res.status(400).json({ message: "Invalid action. Use 'accept' or 'decline'." })
    }

    order.exchangeRequested = false
    await order.save()
    logAction(req, "order.exchange.update", { orderId: order._id, action, adminNote })
    res.json({ message: "Exchange request updated", order })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.post("/sales", checkPermission("products", "update"), async (req, res) => {
  try {
    const { name, description, image, startAt, endAt, productIds = [], percentOff, salePrice } = req.body || {}
    if (!name || !startAt || !endAt || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: "name, startAt, endAt, and productIds[] are required to create a sale." })
    }

    // Apply sale to products
    const products = await Product.find({ _id: { $in: productIds } })
    const ops = []
    for (const p of products) {
      const next = { isOnSale: true }
      if (typeof salePrice === "number") {
        next.salePrice = salePrice
      } else if (typeof percentOff === "number") {
        const computed = Math.max(0, Math.round(p.price * (1 - percentOff / 100)))
        next.salePrice = computed
      }
      ops.push(Product.updateOne({ _id: p._id }, { $set: next }))
    }
    await Promise.all(ops)

    const saleDoc = await Sale.create({
      name,
      description,
      image: image?.url || image?.public_id ? image : undefined,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      productIds,
      percentOff,
      salePrice,
      isActive: true,
    })

    return res.status(201).json({ message: "Sale created and applied", sale: saleDoc, count: ops.length })
  } catch (error) {
    return res.status(500).json({ message: "Failed to create sale", error: error.message })
  }
})

router.get("/sales", checkPermission("products", "view"), async (req, res) => {
  try {
    const now = new Date()
    const sales = await Sale.find().sort({ createdAt: -1 })

    // Auto-expire: if sale ended but still active, revert product flags
    const expired = sales.filter((s) => s.isActive && s.endAt < now)
    for (const s of expired) {
      await Product.updateMany({ _id: { $in: s.productIds } }, { $set: { isOnSale: false }, $unset: { salePrice: "" } })
      s.isActive = false
      await s.save()
    }

    res.json({ sales })
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sales", error: error.message })
  }
})

router.put("/sales/bulk", checkPermission("products", "update"), async (req, res) => {
  try {
    const { productIds = [], salePrice, percentOff, onSale } = req.body || {}
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: "productIds array is required" })
    }

    const products = await Product.find({ _id: { $in: productIds } })
    const ops = []

    for (const p of products) {
      const next = { isOnSale: !!onSale }
      if (onSale === false) {
        next.salePrice = undefined
      } else if (onSale === true) {
        if (typeof salePrice === "number") {
          next.salePrice = salePrice
        } else if (typeof percentOff === "number") {
          const computed = Math.max(0, Math.round(p.price * (1 - percentOff / 100)))
          next.salePrice = computed
        }
      }
      ops.push(Product.updateOne({ _id: p._id }, { $set: next }))
    }

    await Promise.all(ops)
    return res.json({ message: "Sale settings updated", count: ops.length })
  } catch (error) {
    return res.status(500).json({ message: "Failed to update sales", error: error.message })
  }
})

// helper to log actions
function logAction(req, action, meta = {}) {
  try {
    const user = req.user || {}
    AuditLog.create({
      userId: user._id,
      role: user.role?.name || (user.isAdmin ? "admin" : undefined),
      action,
      meta,
      ip: req.ip,
      path: req.originalUrl,
    }).catch(() => {})
  } catch {}
}

router.get("/logs", checkPermission("logs", "view"), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const logs = await AuditLog.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
    const total = await AuditLog.countDocuments()
    res.json({ logs, total, totalPages: Math.ceil(total / limit), currentPage: Number(page) })
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

module.exports = router
