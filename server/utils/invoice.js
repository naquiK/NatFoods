const PDFDocument = require("pdfkit")
const { cloudinary } = require("../config/cloudinary")

// Helper: graceful accessors for common order shapes
function getItems(order) {
  return order.items || order.orderItems || []
}
function getAddress(order) {
  return order.shippingAddress || order.address || {}
}
function getTotals(order) {
  // Try multiple field names; fallback to compute from items
  const items = getItems(order)
  const sub =
    order.subtotal ??
    order.itemsPrice ??
    items.reduce((sum, it) => sum + (it.price || it.unitPrice || 0) * (it.quantity || 1), 0)
  const tax =
    order.taxAmount ??
    order.tax ??
    items.reduce((sum, it) => {
      const rate = it.taxRate ?? 0
      const line = (it.price || it.unitPrice || 0) * (it.quantity || 1)
      return sum + (line * rate) / 100
    }, 0)
  const shipping = order.shippingPrice ?? order.shipping ?? 0
  const extra = order.extraCharges ?? items.reduce((sum, it) => sum + (it.extraCharge || 0) * (it.quantity || 1), 0)
  const total = order.total ?? order.totalPrice ?? sub + tax + shipping + extra
  return { sub, tax, shipping, extra, total }
}

async function uploadPdfToCloudinary({ buffer, orderId }) {
  if (!cloudinary || !cloudinary.uploader || typeof cloudinary.uploader.upload_stream !== "function") {
    throw new Error("Cloudinary is not configured correctly. Check CLOUDINARY_* env vars.")
  }
  return new Promise((resolve, reject) => {
    const folder = "order-invoices" // dedicated folder for invoices
    const public_id = `invoice_${orderId}`
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder,
        public_id,
        format: "pdf",
      },
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      },
    )
    // Convert buffer to stream by writing directly
    // However pdfkit can pipe directly - here we just end the stream with buffer
    uploadStream.end(buffer)
  })
}

function buildPdfBuffer(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 })
    const chunks = []
    doc.on("data", (d) => chunks.push(d))
    doc.on("error", (e) => reject(e))
    doc.on("end", () => resolve(Buffer.concat(chunks)))

    const items = getItems(order)
    const address = getAddress(order)
    const { sub, tax, shipping, extra, total } = getTotals(order)

    // Header
    doc.fontSize(20).text("Invoice", { align: "right" })
    doc.moveDown(0.5)
    doc.fontSize(10).text(`Order ID: ${order._id}`, { align: "right" })
    if (order.paymentId || order.payment_id) {
      doc.text(`Payment ID: ${order.paymentId || order.payment_id}`, { align: "right" })
    }
    doc.moveDown()

    // Seller/Buyer
    doc.fontSize(12).text("Seller:", { underline: true })
    doc.text("NatFood")
    doc.text("support@natfood.example") // adjust if you have real contact
    doc.moveDown()

    doc.fontSize(12).text("Bill To:", { underline: true })
    doc.fontSize(10)
    doc.text(`${address.fullName || address.name || ""}`)
    if (address.address) doc.text(address.address)
    if (address.city || address.state || address.postalCode || address.zipCode) {
      doc.text(`${address.city || ""}, ${address.state || ""} ${address.postalCode || address.zipCode || ""}`)
    }
    if (address.country) doc.text(`${address.country}`)
    doc.moveDown()

    // Items table header
    doc.fontSize(12).text("Items:", { underline: true })
    doc.moveDown(0.5)
    doc.fontSize(10)

    const tableTop = doc.y
    const colX = [50, 260, 330, 400, 470] // name, qty, price, extra, total

    doc.text("Product", colX[0], tableTop, { width: 200, continued: false })
    doc.text("Qty", colX[1], tableTop)
    doc.text("Price", colX[2], tableTop)
    doc.text("Extra", colX[3], tableTop)
    doc.text("Line Total", colX[4], tableTop)
    doc.moveDown(0.5)
    doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke()

    let y = doc.y + 5
    items.forEach((it) => {
      const name = it.name || it.title || it.productName || "Item"
      const qty = it.quantity || 1
      const price = it.price || it.unitPrice || 0
      const extraCharge = it.extraCharge || 0
      const lineTotal = qty * price + qty * extraCharge

      doc.text(name, colX[0], y, { width: 200 })
      doc.text(String(qty), colX[1], y)
      doc.text(price.toFixed(2), colX[2], y)
      doc.text(extraCharge.toFixed(2), colX[3], y)
      doc.text(lineTotal.toFixed(2), colX[4], y)
      y += 18

      if (it.taxRate != null) {
        doc.fontSize(9).fillColor("#555").text(`Tax: ${it.taxRate}%`, colX[0], y)
        doc.fontSize(10).fillColor("#000")
        y += 14
      }

      if (y > 720) {
        doc.addPage()
        y = 60
      }
    })

    // Totals
    doc.moveDown()
    doc.moveTo(300, doc.y).lineTo(560, doc.y).stroke()
    const totalsYStart = doc.y + 6

    const totalRows = [
      ["Subtotal", sub],
      ["Tax", tax],
      ["Shipping", shipping],
      ["Extra Charges", extra],
      ["Total", total],
    ]

    let ty = totalsYStart
    totalRows.forEach(([label, value]) => {
      doc.text(label, 350, ty)
      doc.text(Number(value).toFixed(2), 500, ty, { align: "right" })
      ty += 16
    })

    // Footer
    doc.moveDown(2)
    if (order.expectedDeliveryDate) {
      const edt = new Date(order.expectedDeliveryDate)
      doc.fontSize(10).text(`Expected Delivery: ${edt.toDateString()}`)
    }
    doc.end()
  })
}

async function generateAndUploadInvoice(order) {
  const buffer = await buildPdfBuffer(order)
  const uploadRes = await uploadPdfToCloudinary({ buffer, orderId: order._id.toString() })
  // Return the full upload response so callers can access public_id, resource_type, secure_url, etc.
  return uploadRes
}

module.exports = { generateAndUploadInvoice, buildPdfBuffer }
