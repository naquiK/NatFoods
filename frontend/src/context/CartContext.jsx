"use client"
import { createContext, useContext, useState, useEffect } from "react"
import toast from "react-hot-toast"

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product._id)

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > product.stock) {
          toast.error("Not enough stock available")
          return prevItems
        }
        toast.success("Cart updated!")
        return prevItems.map((item) => (item.id === product._id ? { ...item, quantity: newQuantity } : item))
      } else {
        if (quantity > product.stock) {
          toast.error("Not enough stock available")
          return prevItems
        }
        toast.success("Added to cart!")
        return [
          ...prevItems,
          {
            id: product._id,
            name: product.name,
            price: product.effectivePrice || product.price,
            image: product.images?.[0]?.url || "/placeholder.svg",
            quantity,
            stock: product.stock,
          },
        ]
      }
    })
  }

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId))
    toast.success("Removed from cart")
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === productId) {
          if (quantity > item.stock) {
            toast.error("Not enough stock available")
            return item
          }
          return { ...item, quantity }
        }
        return item
      }),
    )
  }

  const clearCart = () => {
    setCartItems([])
    toast.success("Cart cleared")
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
