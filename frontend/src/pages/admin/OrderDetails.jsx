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
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [paymentData, setPaymentData] = useState(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [resolving, setResolving] = useState(false)

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

  const openPaymentDetails = async () => {
    setPaymentLoading(true)
    try {
      const res = await adminAPI.getOrderPayment(id)
      setPaymentData(res.data?.transactions?.[0] || null)
      setPaymentOpen(true)
    } catch (e) {
      console.error("[v0] Admin payment details fetch error:", e?.message)
      alert("Failed to load payment details.")
    } finally {
      setPaymentLoading(false)
    }
  }

  const decideRequest = async (type, action) => {
    try {
      setResolving(true)
      const adminNote = window.prompt(`Add a note for ${action} ${type}? (optional)`) || ""
      if (type === "return") {
        await adminAPI.decideReturn(id, action, adminNote)
      } else {
        await adminAPI.decideExchange(id, action, adminNote)
      }
      const res = await adminAPI.getOrder(id)
      setOrder(res.data)
      alert(`${type} ${action}ed successfully`)
    } catch (e) {
      console.error("[v0] Admin request decision error:", e?.message)
      alert("Failed to update request")
    } finally {
      setResolving(false)
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

          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-3">Payment</h2>
            <div className="text-sm text-stone-600 dark:text-zinc-400 space-y-1">
              <p>Method: {order?.paymentInfo?.gateway || order?.paymentMethod}</p>
              {order?.paymentInfo?.paymentId && <p>Payment ID: {order.paymentInfo.paymentId}</p>}
              {order?.paymentInfo?.gatewayOrderId && <p>Gateway Order: {order.paymentInfo.gatewayOrderId}</p>}
              {order?.paymentStatus && <p>Status: {order.paymentStatus}</p>}
            </div>
            <button
              onClick={openPaymentDetails}
              disabled={paymentLoading}
              className="mt-4 px-3 py-2 rounded bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-60"
            >
              {paymentLoading ? "Loading..." : "View Payment Details"}
            </button>
            {order?.cancelReason && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-3">Cancel Reason: {order.cancelReason}</p>
            )}
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-3">Return / Exchange Requests</h2>
            {order.returnRequested || order.exchangeRequested ? (
              <>
                {order.returnRequested && (
                  <div className="mb-4">
                    <p className="text-sm text-stone-700 dark:text-zinc-300">
                      Return Reason: {order.returnReason || "-"}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        disabled={resolving}
                        onClick={() => decideRequest("return", "accept")}
                        className="px-3 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        Accept Return (cancel order)
                      </button>
                      <button
                        disabled={resolving}
                        onClick={() => decideRequest("return", "decline")}
                        className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        Decline Return
                      </button>
                    </div>
                  </div>
                )}
                {order.exchangeRequested && (
                  <div>
                    <p className="text-sm text-stone-700 dark:text-zinc-300">
                      Exchange Reason: {order.exchangeReason || "-"}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        disabled={resolving}
                        onClick={() => decideRequest("exchange", "accept")}
                        className="px-3 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        Accept Exchange (cancel order)
                      </button>
                      <button
                        disabled={resolving}
                        onClick={() => decideRequest("exchange", "decline")}
                        className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        Decline Exchange
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-stone-600 dark:text-zinc-400">No pending requests.</p>
            )}
          </div>
        </div>
      </div>

      {paymentOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" role="dialog" aria-modal>
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Payment Details</h3>
              <button onClick={() => setPaymentOpen(false)} className="px-2 py-1 border rounded">
                Close
              </button>
            </div>
            {paymentData ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Gateway:</span> {paymentData.gateway}
                </p>
                <p>
                  <span className="font-medium">Status:</span> {paymentData.status}
                </p>
                <p>
                  <span className="font-medium">Amount:</span> ₹{(Number(paymentData.amount || 0) / 100).toFixed(2)}{" "}
                  {paymentData.currency}
                </p>
                {paymentData.razorpay && (
                  <>
                    <p>
                      <span className="font-medium">Payment ID:</span> {paymentData.razorpay.paymentId}
                    </p>
                    <p>
                      <span className="font-medium">Order ID:</span> {paymentData.razorpay.orderId}
                    </p>
                    <p>
                      <span className="font-medium">Signature:</span> {paymentData.razorpay.signature}
                    </p>
                    {paymentData.razorpay.method && (
                      <p>
                        <span className="font-medium">Method:</span> {paymentData.razorpay.method}
                      </p>
                    )}
                    {paymentData.razorpay.bank && (
                      <p>
                        <span className="font-medium">Bank:</span> {paymentData.razorpay.bank}
                      </p>
                    )}
                    {paymentData.razorpay.wallet && (
                      <p>
                        <span className="font-medium">Wallet:</span> {paymentData.razorpay.wallet}
                      </p>
                    )}
                    {paymentData.razorpay.vpa && (
                      <p>
                        <span className="font-medium">UPI ID:</span> {paymentData.razorpay.vpa}
                      </p>
                    )}
                    {paymentData.razorpay.cardLast4 && (
                      <p>
                        <span className="font-medium">Card Last4:</span> {paymentData.razorpay.cardLast4}
                      </p>
                    )}
                  </>
                )}
                <p className="text-stone-500 dark:text-zinc-400">
                  Created: {new Date(paymentData.createdAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-sm text-stone-600 dark:text-zinc-400">No payment record found for this order.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
