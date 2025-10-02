"use client"

import { useEffect, useState } from "react"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { api } from "../utils/api"
import Button from "../components/ui/Button"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import AddressSection from "../components/checkout/address-section"
import PaymentSection from "../components/checkout/payment-section"
import OrderSummary from "../components/checkout/order-summary"

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart()
  const { user, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [addresses, setAddresses] = useState(user?.addresses || [])
  const [useSavedAddress, setUseSavedAddress] = useState(!!user?.addresses?.length)
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(user?.addresses?.findIndex((a) => a.isDefault) ?? 0)
  const [formData, setFormData] = useState({
    shippingAddress: {
      fullName: user?.name || "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      phone: "",
    },
    paymentMethod: "razorpay",
  })
  const [errorMsg, setErrorMsg] = useState("")

  const subtotal = getCartTotal()
  const shipping = subtotal > 500 ? 0 : 50
  const tax = subtotal * 0.1
  const grandTotal = subtotal + shipping + tax

  useEffect(() => {
    // refresh profile to get latest addresses if not present
    if (!addresses?.length) {
      refreshProfile()?.then((p) => setAddresses(p?.addresses || []))
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith("shipping.")) {
      const field = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        shippingAddress: { ...prev.shippingAddress, [field]: value },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const getShippingForOrder = () => {
    if (useSavedAddress && addresses[selectedAddressIndex]) {
      const a = addresses[selectedAddressIndex]
      return {
        fullName: a.contactName || user?.name || "",
        address: a.street,
        city: a.city,
        state: a.state,
        zipCode: a.zip,
        country: a.country,
        phone: a.contactPhone || "",
      }
    }
    return formData.shippingAddress
  }

  const createOrderOnBackend = async (paymentMethod, paymentStatus = "pending") => {
    setErrorMsg("")
    const orderData = {
      items: cartItems.map((i) => ({
        productId: i.id || i.productId || i._id,
        quantity: i.quantity,
      })),
      shippingAddress: getShippingForOrder(),
      paymentMethod,
      totalAmount: grandTotal,
      paymentStatus,
    }
    try {
      await api.post("/api/orders", orderData)
    } catch (err) {
      const apiMsg =
        err?.response?.data?.message || (err?.message?.includes("401") ? "Please login to place an order." : null)
      setErrorMsg(apiMsg || "Order could not be created. Please try again.")
      throw err
    }
  }

  const handleRazorpay = async () => {
    const ok = await loadRazorpay()
    if (!ok) {
      alert("Razorpay SDK failed to load. Please check your connection.")
      return
    }
    setLoading(true)
    try {
      const amountInPaise = Math.round(getCartTotal() * 100)
      const { data } = await api.post("/api/payment/razorpay/order", {
        amount: amountInPaise,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
      })

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Checkout",
        description: "Order payment",
        order_id: data.id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: getShippingForOrder().phone || "",
        },
        notes: { address: getShippingForOrder().address },
        handler: async () => {
          await createOrderOnBackend("razorpay", "paid")
          clearCart()
          setOrderPlaced(true)
        },
        theme: { color: "#0f766e" },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e) {
      console.error("Razorpay error:", e)
      alert("Payment failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (formData.paymentMethod === "cod") {
        await createOrderOnBackend("cod", "pending")
        clearCart()
        setOrderPlaced(true)
      } else {
        await handleRazorpay()
      }
    } finally {
      setLoading(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen py-16" style={{ background: "var(--color-bg)" }}>
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-serif mb-4">Order Placed Successfully!</h1>
          <p className="text-sm mb-8" style={{ color: "var(--color-muted)" }}>
            Thank you for your order. You'll receive a confirmation email shortly.
          </p>
          <Button onClick={() => (window.location.href = "/")} className="btn btn-primary">
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <div className="text-center">
          <h1 className="text-3xl font-serif mb-4">Your cart is empty</h1>
          <p className="text-sm mb-8" style={{ color: "var(--color-muted)" }}>
            Add some items to your cart before checking out.
          </p>
          <Button onClick={() => (window.location.href = "/products")} className="btn btn-primary">
            Shop Now
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 bg-neutral-50">
      <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-serif text-neutral-900">Checkout</h1>
          <p className="text-sm text-neutral-600 mt-1">Secure payment powered by Razorpay</p>
        </header>

        {errorMsg ? (
          <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {errorMsg}
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <AddressSection
                addresses={addresses}
                user={user}
                useSavedAddress={useSavedAddress}
                onToggleUseSaved={setUseSavedAddress}
                selectedAddressIndex={selectedAddressIndex}
                onSelectSaved={setSelectedAddressIndex}
                formData={formData}
                onChangeField={handleInputChange}
              />

              <PaymentSection paymentMethod={formData.paymentMethod} onChange={handleInputChange} />

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-medium"
                aria-label="Place order"
              >
                {loading ? <LoadingSpinner size="sm" /> : `Place Order - ₹${grandTotal.toFixed(2)}`}
              </Button>
            </form>
          </div>

          <OrderSummary items={cartItems} subtotal={subtotal} shipping={shipping} tax={tax} total={grandTotal} />
        </div>
      </div>
    </div>
  )
}

export default Checkout
