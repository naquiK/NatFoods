const express = require("express")
const router = express.Router()
const Cart = require("../model/cart-model")
const Product = require("../model/product-model")
const { authMiddleware } = require("../middleware/auth-middleware")

// Apply auth middleware to all routes
router.use(authMiddleware)

// Get user's cart
router.get("/", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.userId }).populate("items.productId")

    if (!cart) {
      return res.json({ items: [], totalAmount: 0 })
    }

    res.json(cart)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Add item to cart
router.post("/add", async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" })
    }

    let cart = await Cart.findOne({ userId: req.user.userId })

    if (!cart) {
      cart = new Cart({ userId: req.user.userId, items: [] })
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && item.size === size && item.color === color,
    )

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity
    } else {
      cart.items.push({ productId, quantity, size, color })
    }

    // Calculate total amount
    await cart.populate("items.productId")
    cart.totalAmount = cart.items.reduce((total, item) => {
      const price = item.productId.effectivePrice
      return total + price * item.quantity
    }, 0)

    await cart.save()
    res.json({ message: "Item added to cart", cart })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update cart item quantity
router.put("/update/:itemId", async (req, res) => {
  try {
    const { quantity } = req.body
    const { itemId } = req.params

    const cart = await Cart.findOne({ userId: req.user.userId })
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" })
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId)
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" })
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1)
    } else {
      cart.items[itemIndex].quantity = quantity
    }

    // Recalculate total
    await cart.populate("items.productId")
    cart.totalAmount = cart.items.reduce((total, item) => {
      const price = item.productId.effectivePrice
      return total + price * item.quantity
    }, 0)

    await cart.save()
    res.json({ message: "Cart updated", cart })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Remove item from cart
router.delete("/remove/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params

    const cart = await Cart.findOne({ userId: req.user.userId })
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" })
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId)

    // Recalculate total
    await cart.populate("items.productId")
    cart.totalAmount = cart.items.reduce((total, item) => {
      const price = item.productId.effectivePrice
      return total + price * item.quantity
    }, 0)

    await cart.save()
    res.json({ message: "Item removed from cart", cart })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Clear cart
router.delete("/clear", async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ userId: req.user.userId }, { items: [], totalAmount: 0 })
    res.json({ message: "Cart cleared" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
