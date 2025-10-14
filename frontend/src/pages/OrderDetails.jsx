"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ordersAPI, productsAPI } from "../utils/api"
import ProductCard from "../components/products/ProductCard"
import { Link } from "react-router-dom"
import LoadingSpinner from "../components/ui/LoadingSpinner"

// --- Helper Icons (for the new UI) ---
const ShoppingCartIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
)
const BoxIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)
const TruckIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
)
const CheckCircleIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)
const MapPinIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

export default function OrderVibeCheck() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [orderDeets, setOrderDeets] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [otherVibes, setOtherVibes] = useState([])
  const [showReturn, setShowReturn] = useState(false)
  const [showExchange, setShowExchange] = useState(false)
  const [reason, setReason] = useState("")

  // (All the useEffect and handler logic remains the same as the previous Gen Z version)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await ordersAPI.get(id)
        if (mounted) setOrderDeets(res.data)
      } catch (e) {
        console.error("bruh, the order deets didn't load:", e?.message)
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()
    return () => (mounted = false)
  }, [id])

  const grabTheReceipts = async () => {
    try {
      const res = await ordersAPI.downloadInvoice(id)
      const blob = new Blob([res.data], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `receipt-for-order-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error("yikes, receipt download failed:", e?.message || e)
      alert("invoice download flopped. big yikes. try again? 🤷‍♀️")
    }
  }

  const submitReturn = async () => {
    try {
      await ordersAPI.requestReturn(id, reason)
      setShowReturn(false)
      setReason("")
      window.location.reload()
    } catch {
      alert("Failed to request return")
    }
  }
  const submitExchange = async () => {
    try {
      await ordersAPI.requestExchange(id, reason)
      setShowExchange(false)
      setReason("")
      window.location.reload()
    } catch {
      alert("Failed to request exchange")
    }
  }

  useEffect(() => {
    if (!orderDeets) return
    let mounted = true
    ;(async () => {
      try {
        const firstItem = orderDeets?.items?.[0]
        const brand = firstItem?.productId?.brand
        if (brand) {
          const res = await productsAPI.getAll({ brand })
          if (mounted) setOtherVibes(res?.data?.products || res?.data || [])
        } else {
          const res = await productsAPI.getFeatured()
          if (mounted) setOtherVibes(res?.data || [])
        }
      } catch (e) {
        console.warn("couldn't fetch other vibes, it's whatever tho", e?.message)
      }
    })()
    return () => (mounted = false)
  }, [orderDeets])

  // --- Loading and Not Found states ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 flex items-center justify-center">
        <LoadingSpinner />
        <p className="ml-4">hang tight, getting the deets...</p>
      </div>
    )
  }

  if (!orderDeets) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-600 dark:text-zinc-400">oof, this order ghosted us. 👻 where'd it go?</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-3 py-2 rounded-lg border border-stone-300 dark:border-zinc-700"
          >
            aight, go back
          </button>
        </div>
      </div>
    )
  }

  const dropLocation = orderDeets.shippingAddress || {}
  const statusVibes = [
    { name: "Ordered", icon: ShoppingCartIcon, key: "pending" },
    { name: "Packin' it up", icon: BoxIcon, key: "processing" },
    { name: "On its way", icon: TruckIcon, key: "shipped" },
    { name: "Delivered!", icon: CheckCircleIcon, key: "delivered" },
  ]
  const currentStatusIndex = Math.max(
    0,
    statusVibes.findIndex((v) => v.key === (orderDeets.status || "").toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* --- Header --- */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1 text-stone-900 dark:text-white">
              Order #{orderDeets._id.slice(-8)}
            </h1>
            <p className="text-stone-600 dark:text-zinc-400">
              Placed on {new Date(orderDeets.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-2 rounded-lg border border-stone-300 dark:border-zinc-700 text-sm"
            >
              Back
            </button>
            <button
              onClick={grabTheReceipts}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 font-semibold text-sm"
            >
              Download Invoice
            </button>
          </div>
        </div>

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Left Column: Items List --- */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-stone-900 dark:text-white">what you copped 🛍️</h2>
            {orderDeets.items?.map((it) => {
              const p = it.productId || {}
              const pid = p._id || it.productId
              return (
                <div
                  key={pid}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl"
                >
                  <Link to={`/products/${pid}`} className="flex-shrink-0">
                    <img
                      src={p.images?.[0]?.url || "/diverse-products-still-life.png"}
                      alt={p.name || it.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </Link>
                  <div className="flex-grow">
                    <Link
                      to={`/products/${pid}`}
                      className="font-semibold text-stone-800 dark:text-white hover:underline"
                    >
                      {p.name || it.name}
                    </Link>
                    <p className="text-sm text-stone-500 dark:text-zinc-400">Qty: {it.quantity}</p>
                  </div>
                  <p className="font-semibold text-stone-900 dark:text-white">₹{(it.price * it.quantity).toFixed(2)}</p>
                </div>
              )
            })}
          </div>

          {/* --- Right Column: Bento Box for Details --- */}
          <div className="lg:col-span-1 space-y-6">
            {/* Vibe Tracker */}
            <div className="p-6 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl">
              <h3 className="font-semibold mb-4">Vibe Track</h3>
              <ol className="space-y-4">
                {statusVibes.map((vibe, idx) => {
                  const isActive = idx <= currentStatusIndex
                  return (
                    <li key={vibe.name} className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400" : "bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-500"}`}
                      >
                        <vibe.icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`font-medium ${isActive ? "text-stone-800 dark:text-white" : "text-stone-500 dark:text-zinc-400"}`}
                      >
                        {vibe.name}
                      </span>
                    </li>
                  )
                })}
              </ol>
            </div>

            {/* Drop Zone */}
            <div className="p-6 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5" /> The Drop Zone
              </h3>
              <div className="text-sm text-stone-600 dark:text-zinc-300 space-y-1">
                <p className="font-bold text-stone-800 dark:text-white">{dropLocation.fullName}</p>
                <p>{dropLocation.address}</p>
                <p>
                  {dropLocation.city}, {dropLocation.postalCode}
                </p>
                <p>{dropLocation.country}</p>
              </div>
            </div>

            {/* The Damage */}
            <div className="p-6 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl">
              <h3 className="font-semibold mb-4">The Damage 💸</h3>
              <div className="space-y-2 text-sm text-stone-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{Number(orderDeets.itemsPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹{Number(orderDeets.shippingPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>₹{Number(orderDeets.taxPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-stone-900 dark:text-white pt-2 border-t border-stone-200 dark:border-zinc-700 mt-2">
                  <span>Total</span>
                  <span>₹{Number(orderDeets.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="p-6 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl">
              <h3 className="font-semibold mb-4">Payment</h3>
              <div className="text-sm text-stone-600 dark:text-zinc-400 space-y-1">
                <p>Method: {orderDeets?.paymentInfo?.gateway || orderDeets?.paymentMethod}</p>
                {orderDeets?.paymentInfo?.paymentId && <p>Payment ID: {orderDeets.paymentInfo.paymentId}</p>}
                {orderDeets?.paymentInfo?.gatewayOrderId && (
                  <p>Gateway Order: {orderDeets.paymentInfo.gatewayOrderId}</p>
                )}
                {orderDeets?.paymentStatus && <p>Status: {orderDeets.paymentStatus}</p>}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setShowReturn(true)}
                  className="px-3 py-2 rounded-md border border-stone-300 dark:border-zinc-700"
                >
                  Request Return
                </button>
                <button
                  onClick={() => setShowExchange(true)}
                  className="px-3 py-2 rounded-md border border-stone-300 dark:border-zinc-700"
                >
                  Request Exchange
                </button>
              </div>
              {/* show cancel reason */}
              {orderDeets?.cancelReason && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">Cancelled: {orderDeets.cancelReason}</p>
              )}
            </div>
          </div>
        </div>

        {/* --- Similar Products Section --- */}
        {otherVibes?.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold mb-4 text-stone-900 dark:text-white">
              you might also vibe with these 👀
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {otherVibes.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* --- Modals for Return and Exchange --- */}
        {showReturn || showExchange ? (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 p-6">
              <h3 className="text-lg font-semibold mb-2">{showReturn ? "Return Request" : "Exchange Request"}</h3>
              <p className="text-sm text-stone-600 dark:text-zinc-400 mb-4">Please share the reason.</p>
              <textarea
                className="w-full p-3 rounded-md border border-stone-300 dark:border-zinc-700 bg-transparent"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason..."
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  className="px-3 py-2 rounded-md"
                  onClick={() => {
                    setShowReturn(false)
                    setShowExchange(false)
                    setReason("")
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-2 rounded-md bg-emerald-600 text-white"
                  onClick={showReturn ? submitReturn : submitExchange}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
