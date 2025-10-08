const express = require("express")
const router = express.Router()
const Order = require("../model/order-model")
const Cart = require("../model/cart-model")
const Product = require("../model/product-model")
const { authMiddleware } = require("../middleware/auth-middleware")
const PDFDocument = require("pdfkit")
const { generateAndUploadInvoice } = require("../utils/invoice")
const fetch = require("node-fetch")

// helper to consistently derive userId across middleware shapes
function getUserId(req) {
  return (
    req.user?._id?.toString?.() ||
    req.user?.id ||
    req.userInfo?.id ||
    req.user?.userId || // last resort if any earlier code set this
    null
  )
}

router.use(authMiddleware)

// Create new order
router.post("/", async (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please login to place an order." })
    }

    const { shippingAddress: rawShippingAddress, paymentMethod, items } = req.body

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items in order" })
    }
    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method is required" })
    }

    // normalize shippingAddress shape to avoid undefined property access
    const shippingAddress = rawShippingAddress || {}
    const normalizedShipping = {
      fullName: shippingAddress.fullName || shippingAddress.name || "",
      address: shippingAddress.address || shippingAddress.address1 || "",
      city: shippingAddress.city || "",
      postalCode: shippingAddress.postalCode || shippingAddress.zipCode || shippingAddress.pinCode || "",
      country: shippingAddress.country || "",
      phone: shippingAddress.phone || shippingAddress.contact || "",
    }

    // collect missing fields for clearer error messages
    const missing = Object.entries({
      fullName: normalizedShipping.fullName,
      address: normalizedShipping.address,
      city: normalizedShipping.city,
      postalCode: normalizedShipping.postalCode,
      country: normalizedShipping.country,
    })
      .filter(([, v]) => !v)
      .map(([k]) => k)

    if (missing.length) {
      return res.status(400).json({
        message: `Shipping address is incomplete: missing ${missing.join(", ")}`,
        missing,
      })
    }

    // Validate stock for all items
    for (const item of items) {
      const pid = item.productId
      if (!pid) {
        return res.status(400).json({ message: "Each item must include productId" })
      }
      const product = await Product.findById(pid)
      if (!product) {
        return res.status(404).json({ message: `Product ${pid} not found` })
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` })
      }
    }

    // Calculate prices and prepare orderItems
    let itemsPrice = 0
    let taxPrice = 0
    let extraCharges = 0
    const orderItems = []

    for (const item of items) {
      const product = await Product.findById(item.productId)
      const quantity = Number(item.quantity) || 1
      const unitPrice = Number(product.effectivePrice) || 0
      const lineSubtotal = unitPrice * quantity

      const lineTaxRate = typeof product.taxRate === "number" ? product.taxRate : 10
      const lineTax = (lineSubtotal * lineTaxRate) / 100

      const lineExtra = (Number(product.extraCharge) || 0) * quantity

      itemsPrice += lineSubtotal
      taxPrice += lineTax
      extraCharges += lineExtra

      orderItems.push({
        productId: item.productId,
        quantity,
        price: unitPrice,
        name: product.name,
        image: product.images?.[0]?.url || "",
      })

      // reduce stock
      await product.reduceStock(quantity)
    }

    const shippingPrice = itemsPrice > 500 ? 0 : 50
    const totalAmount = itemsPrice + shippingPrice + taxPrice + extraCharges

    const expectedDeliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)

    const order = await Order.create({
      userId,
      items: orderItems,
      shippingAddress: normalizedShipping,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalAmount,
      paymentStatus: paymentMethod === "razorpay" ? "paid" : "pending",
      expectedDeliveryDate,
    })

    // clear user's cart, non-blocking if cart not found
    await Cart.findOneAndUpdate({ userId }, { items: [], totalAmount: 0 }).catch(() => {})

    // generate Cloudinary invoice asynchronously (don't block order creation)
    ;(async () => {
      try {
        const url = await generateAndUploadInvoice(order)
        await Order.findByIdAndUpdate(order._id, { invoiceUrl: url })
      } catch (e) {
        console.log("[v0] invoice generation error:", e?.message || e)
      }
    })()

    return res.status(201).json({ message: "Order created successfully", order })
  } catch (error) {
    console.log("[v0] OrderCreateError:", {
      message: error?.message,
      stack: error?.stack,
      body: req?.body ? { keys: Object.keys(req.body) } : null,
    })
    return res.status(500).json({ message: "Server error creating order", error: error.message })
  }
})

// Get user's orders
router.get("/", async (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.status(401).json({ message: "Unauthorized" })
    const page = Number(req.query.page || 1)
    const limit = Number(req.query.limit || 10)

    const orders = await Order.find({ userId })
      .populate("items.productId", "name images")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    const total = await Order.countDocuments({ userId })

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.log("[v0] OrderListError:", error?.message)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get single order
router.get("/:id", async (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.status(401).json({ message: "Unauthorized" })
    const order = await Order.findOne({ _id: req.params.id, userId }).populate("items.productId", "name images")
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }
    res.json(order)
  } catch (error) {
    console.log("[v0] OrderGetError:", error?.message)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Cancel order
router.put("/:id/cancel", async (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    const order = await Order.findOne({ _id: req.params.id, userId })

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

// Generate invoice PDF
router.get("/:id/invoice.pdf", async (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.status(401).json({ message: "Unauthorized" })
    const order = await Order.findOne({ _id: req.params.id, userId }).populate("items.productId", "name images")
    if (!order) return res.status(404).json({ message: "Order not found" })

    // If we already uploaded an invoice to Cloudinary, proxy it so Download works (same-origin attachment)
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
        // If fetch is unavailable or fails, gracefully redirect to Cloudinary (view-only)
        console.log("[v0] invoice proxy failed, redirecting:", err?.message)
        return res.redirect(order.invoiceUrl)
      }
    }

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="invoice-${order._id}.pdf"`)

    const doc = new PDFDocument({ margin: 40 })
    doc.pipe(res)

    doc.fontSize(18).text("Order Invoice", { align: "center" })
    doc.moveDown()
    doc.fontSize(12).text(`Order ID: ${order._id}`)
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`)
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
      doc.text(`- ${it.name} x ${it.quantity} @ ₹${it.price.toFixed(2)} = ₹${(it.price * it.quantity).toFixed(2)}`)
    })
    doc.moveDown()
    doc.text(`Items: ₹${order.itemsPrice.toFixed(2)}`)
    doc.text(`Shipping: ₹${order.shippingPrice.toFixed(2)}`)
    doc.text(`Tax: ₹${order.taxPrice.toFixed(2)}`)
    doc.text(`Total: ₹${order.totalAmount.toFixed(2)}`, { align: "right" })

    doc.end()
  } catch (error) {
    res.status(500).json({ message: "Failed to generate invoice", error: error.message })
  }
})

// New endpoint to generate and attach Cloudinary invoice if missing
router.post("/:id/invoice", async (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.status(401).json({ message: "Unauthorized" })
    const order = await Order.findOne({ _id: req.params.id, userId })
    if (!order) return res.status(404).json({ message: "Order not found" })

    if (order.invoiceUrl) {
      return res.json({ invoiceUrl: order.invoiceUrl })
    }

    const invoiceUrl = await generateAndUploadInvoice(order)
    order.invoiceUrl = invoiceUrl
    await order.save()
    res.json({ invoiceUrl })
  } catch (error) {
    res.status(500).json({ message: "Failed to create invoice", error: error.message })
  }
})

module.exports = router
