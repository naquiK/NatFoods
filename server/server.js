const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const connectDB = require("./DB/connectionDB")
const path = require("path")
const removedUnverifiedData = require("./authomation/removedUnverifiedData")
const eventsRoute = require("./router/eventsRoute")
const couponAdminRoute = require("./router/couponAdminRoute")

// Start the cron job to remove unverified users
removedUnverifiedData()

const app = express()

// Database connection
connectDB()


const allowedOrigins = [
  "https://nat-foods.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
]

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true)

      const isAllowed = allowedOrigins.some((allowed) =>
        origin.startsWith(allowed)
      )

      if (isAllowed) {
        callback(null, true)
      } else {
        console.warn("❌ Blocked by CORS:", origin)
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
  })
)
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Routes
app.use("/api/auth", require("./router/userRoute"))
app.use("/api/products", require("./router/productRoute"))
app.use("/api/admin", require("./router/adminRoute"))
app.use("/api/cart", require("./router/cartRoute"))
app.use("/api/orders", require("./router/orderRoute"))
app.use("/api/settings", require("./router/settingsRoute"))
app.use("/api/upload", require("./router/uploadRoute")) // Added upload routes for Cloudinary integration
app.use("/api/payment", require("./router/paymentRoute"))
app.use("/api/events", eventsRoute)
app.use("/api/admin/coupons", couponAdminRoute)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running!", timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`🚀 Server is running on port: ${port}`)
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL}`)
})
