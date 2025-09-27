"use client"

import { useState } from "react"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { api } from "../utils/api"
import Button from "../components/ui/Button"
import LoadingSpinner from "../components/ui/LoadingSpinner"

const Checkout = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [formData, setFormData] = useState({
    shippingAddress: {
      fullName: user?.name || "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    paymentMethod: "card",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith("shipping.")) {
      const field = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [field]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const orderData = {
        items: cartItems,
        shippingAddress: formData.shippingAddress,
        paymentMethod: formData.paymentMethod,
        totalAmount: getTotalPrice(),
      }

      await api.post("/orders", orderData)
      clearCart()
      setOrderPlaced(true)
    } catch (error) {
      console.error("Error placing order:", error)
      alert("Failed to place order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-stone-50 py-16 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-4">Order Placed Successfully!</h1>
          <p className="text-stone-600 mb-8">Thank you for your order. You'll receive a confirmation email shortly.</p>
          <Button onClick={() => (window.location.href = "/")} className="bg-stone-900 hover:bg-stone-800">
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 py-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-stone-900 mb-4">Your cart is empty</h1>
          <p className="text-stone-600 mb-8">Add some items to your cart before checking out.</p>
          <Button onClick={() => (window.location.href = "/products")} className="bg-stone-900 hover:bg-stone-800">
            Shop Now
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Shipping Address */}
              <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
                <h2 className="text-xl font-semibold text-stone-900 mb-6">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="shipping.fullName"
                      value={formData.shippingAddress.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Address</label>
                    <input
                      type="text"
                      name="shipping.address"
                      value={formData.shippingAddress.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">City</label>
                      <input
                        type="text"
                        name="shipping.city"
                        value={formData.shippingAddress.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">State</label>
                      <input
                        type="text"
                        name="shipping.state"
                        value={formData.shippingAddress.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">ZIP Code</label>
                      <input
                        type="text"
                        name="shipping.zipCode"
                        value={formData.shippingAddress.zipCode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Country</label>
                      <input
                        type="text"
                        name="shipping.country"
                        value={formData.shippingAddress.country}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
                <h2 className="text-xl font-semibold text-stone-900 mb-6">Payment Method</h2>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === "card"}
                      onChange={handleInputChange}
                      className="text-stone-600 focus:ring-stone-500"
                    />
                    <span className="ml-3 text-stone-700">Credit/Debit Card</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === "paypal"}
                      onChange={handleInputChange}
                      className="text-stone-600 focus:ring-stone-500"
                    />
                    <span className="ml-3 text-stone-700">PayPal</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === "cod"}
                      onChange={handleInputChange}
                      className="text-stone-600 focus:ring-stone-500"
                    />
                    <span className="ml-3 text-stone-700">Cash on Delivery</span>
                  </label>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-stone-900 hover:bg-stone-800 py-3">
                {loading ? <LoadingSpinner size="sm" /> : `Place Order - $${getTotalPrice().toFixed(2)}`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-6">Order Summary</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center space-x-4">
                  <img
                    src={item.images?.[0] || "/placeholder.svg?height=60&width=60&query=product"}
                    alt={item.name}
                    className="w-15 h-15 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-stone-900">{item.name}</h3>
                    <p className="text-sm text-stone-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-stone-900">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-200 mt-6 pt-6">
              <div className="flex justify-between items-center text-lg font-semibold text-stone-900">
                <span>Total</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
