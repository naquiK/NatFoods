"use client"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { useCart } from "../context/CartContext"
import Button from "../components/ui/Button"

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart()

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else {
      updateQuantity(productId, newQuantity)
    }
  }

  const subtotal = getCartTotal()
  const shipping = subtotal > 50 ? 0 : 10
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (cartItems.length === 0) {
    return (
      <div className="pt-20 min-h-screen bg-neutral-50">
        <div className="section-padding py-24">
          <div className="container-max">
            <div className="text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <ShoppingBag size={64} className="mx-auto text-neutral-400 mb-6" />
                <h1 className="text-h1 font-serif mb-4">Your Cart is Empty</h1>
                <p className="text-body-lg text-neutral-600 mb-8">
                  Looks like you haven't added any items to your cart yet.
                </p>
                <Button as={Link} to="/products" size="large">
                  Continue Shopping
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen bg-neutral-50">
      <div className="section-padding py-12">
        <div className="container-max">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-h1 font-serif mb-8">Shopping Cart</h1>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white p-6 border border-neutral-200 flex items-center space-x-6"
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-neutral-100 overflow-hidden flex-shrink-0">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 mb-2 truncate">{item.name}</h3>
                    <p className="text-lg font-bold text-neutral-900">${item.price}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-neutral-300">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-neutral-100"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 py-2 min-w-16 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="p-2 hover:bg-neutral-100 disabled:opacity-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="font-bold text-neutral-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </motion.div>
              ))}

              {/* Clear Cart */}
              <div className="flex justify-between items-center pt-6 border-t border-neutral-200">
                <Button variant="ghost" onClick={clearCart} className="text-red-600 hover:text-red-700">
                  Clear Cart
                </Button>
                <Button as={Link} to="/products" variant="secondary">
                  Continue Shopping
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white p-6 border border-neutral-200 sticky top-24"
              >
                <h2 className="text-h3 font-serif mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {shipping > 0 && (
                  <div className="bg-primary-50 p-4 mb-6 text-sm">
                    <p className="text-primary-700">Add ${(50 - subtotal).toFixed(2)} more to get free shipping!</p>
                  </div>
                )}

                <Button as={Link} to="/checkout" className="w-full mb-4" size="large">
                  Proceed to Checkout
                </Button>

                <div className="text-center text-sm text-neutral-600">
                  <p>Secure checkout with SSL encryption</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
