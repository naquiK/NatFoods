const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const connectDB = require("./DB/connectionDB")
const path = require("path")

const app = express()

// Database connection
connectDB()

// Middleware
app.use(
  cors({
    origin:[ process.env.FRONTEND_URL || "http://localhost:5173",
    "https://nat-foods.vercel.app",  
    "https://nat-foods-r1oq.vercel.app"],
    credentials: true,
  }),
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
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`)
})
