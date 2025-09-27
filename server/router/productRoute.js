const express = require("express")
const router = express.Router()
const Product = require("../model/product-model")
const { authMiddleware } = require("../middleware/auth-middleware")

// Get all products with filtering and pagination
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      sort = "createdAt",
      order = "desc",
      featured,
      onSale,
    } = req.query

    const query = { isActive: true }

    // Apply filters
    if (category) query.category = category
    if (brand) query.brand = brand
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }
    if (featured === "true") query.isFeatured = true
    if (onSale === "true") query.isOnSale = true
    if (search) {
      query.$text = { $search: search }
    }

    const sortOrder = order === "desc" ? -1 : 1
    const sortObj = { [sort]: sortOrder }

    const products = await Product.find(query)
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("reviews.userId", "name")

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

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("reviews.userId", "name profilePicture")
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }
    res.json(product)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get featured products
router.get("/featured/list", async (req, res) => {
  try {
    const products = await Product.getFeatured(8)
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get products on sale
router.get("/sale/list", async (req, res) => {
  try {
    const products = await Product.getOnSale(12)
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get categories
router.get("/categories/list", async (req, res) => {
  try {
    const categories = await Product.distinct("category", { isActive: true })
    res.json(categories)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get brands
router.get("/brands/list", async (req, res) => {
  try {
    const brands = await Product.distinct("brand", { isActive: true })
    res.json(brands)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Add review
router.post("/:id/reviews", authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Check if user already reviewed
    const existingReview = product.reviews.find((review) => review.userId.toString() === req.user.userId)

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product" })
    }

    product.reviews.push({
      userId: req.user.userId,
      rating,
      comment,
    })

    await product.save()
    res.json({ message: "Review added successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
