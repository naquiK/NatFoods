"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { adminAPI } from "../../utils/api"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import { Link } from "react-router-dom"

export default function AdminOrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const steps = ["pending", "processing", "shipped", "delivered"]
  const currentIndex = Math.max(0, steps.indexOf((order?.status || "").toLowerCase()))

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await adminAPI.getOrder(id)
        if (mounted) setOrder(res.data)
      } catch (e) {
        console.error("[v0] Admin order details fetch error:", e?.message)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => (mounted = false)
  }, [id])

  const downloadInvoice = async () => {
    try {
      const res = await adminAPI.getOrderInvoice(id)
      const blob = new Blob([res.data], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `invoice-${id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error("[v0] Admin invoice download error:", e?.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-6">
        <p className="text-stone-600">Order not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-3 py-2 rounded border border-stone-300">
          Back
        </button>
      </div>
    )
  }

  const addr = order.shippingAddress || {}
  const user = order.userId || order.user

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/admin")}
          className="px-3 py-2 rounded border border-stone-300 dark:border-zinc-700"
        >
          Back to Dashboard
        </button>
        <button onClick={downloadInvoice} className="px-3 py-2 rounded bg-stone-900 text-white hover:bg-stone-800">
          Download Invoice
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-2">Order #{order._id.slice(-8)}</h1>
        <p className="text-stone-600 dark:text-zinc-400">
          Placed on {new Date(order.createdAt).toLocaleString()} • Status:{" "}
          <span className="capitalize">{order.status}</span>
        </p>
        {order.expectedDeliveryDate && (
          <p className="text-stone-700 dark:text-zinc-300 mt-2">
            Expected Delivery: {new Date(order.expectedDeliveryDate).toDateString()}
          </p>
        )}

        <div className="mt-6">
          <ol className="grid grid-cols-4 gap-2 text-xs">
            {steps.map((s, idx) => {
              const active = idx <= currentIndex
              return (
                <li key={s} className="flex flex-col items-center">
                  <div
                    className={`w-full h-1 rounded ${active ? "bg-emerald-500" : "bg-stone-200 dark:bg-zinc-700"}`}
                  />
                  <span
                    className={`mt-2 capitalize ${active ? "text-stone-900 dark:text-white" : "text-stone-500 dark:text-zinc-400"}`}
                  >
                    {s}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3">Items</h2>
          <ul className="divide-y divide-stone-200 dark:divide-zinc-800">
            {order.items?.map((it) => {
              const p = it.productId || {}
              const pid = p._id || it.productId
              return (
                <li key={pid} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/products/${pid}`}
                      className="w-14 h-14 bg-stone-100 dark:bg-zinc-800 overflow-hidden rounded"
                    >
                      <img
                        src={p.images?.[0]?.url || "/placeholder.svg?height=200&width=200&query=product"}
                        alt={p.name || it.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div>
                      <Link to={`/products/${pid}`} className="font-medium hover:underline">
                        {p.name || it.name}
                      </Link>
                      <p className="text-sm text-stone-600 dark:text-zinc-400">Qty: {it.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">₹{(Number(it.price) * Number(it.quantity)).toFixed(2)}</p>
                </li>
              )
            })}
          </ul>

          {/* totals */}
          <div className="border-t dark:border-zinc-800 mt-4 pt-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Items</span>
              <span>₹{Number(order.itemsPrice).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>₹{Number(order.shippingPrice).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>₹{Number(order.taxPrice).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>₹{Number(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-3">Customer</h2>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-stone-600 dark:text-zinc-400">{user?.email}</p>
            {addr?.phone && <p className="text-sm text-stone-600 dark:text-zinc-400">{addr.phone}</p>}
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-3">Delivery Address</h2>
            <p className="font-medium">{addr.fullName}</p>
            {addr.phone && <p className="text-stone-600 dark:text-zinc-400">{addr.phone}</p>}
            <p>{addr.address}</p>
            <p>
              {addr.city} {addr.postalCode}
            </p>
            <p>{addr.country}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
