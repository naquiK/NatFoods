"use client"
import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { api } from "../utils/api"
import LoadingSpinner from "../components/ui/LoadingSpinner"

export default function OrderSuccess() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/api/orders/${id}`)
        let orderData = data
        if (!orderData.invoiceUrl) {
          try {
            const inv = await api.post(`/api/orders/${id}/invoice`)
            orderData = { ...orderData, invoiceUrl: inv.data.invoiceUrl }
          } catch (e) {
            // non-fatal if invoice generation fails; keep page usable
            console.log("[v0] invoice create failed:", e?.response?.data || e.message)
          }
        }
        setOrder(orderData)
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Order not found</h1>
          <Link to="/">{"Go Home"}</Link>
        </div>
      </div>
    )
  }

  const eta = order.expectedDeliveryDate
    ? new Date(order.expectedDeliveryDate).toDateString()
    : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toDateString()

  const viewHref = order.invoiceUrl ? order.invoiceUrl : `/api/orders/${order._id}/invoice.pdf`
  const downloadHref = `/api/orders/${order._id}/invoice.pdf`

  return (
    <div className="min-h-screen pt-20" style={{ background: "var(--color-bg)", color: "var(--color-fg)" }}>
      <div className="max-w-xl mx-auto px-4 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-serif mb-2">Thank you! Your order is confirmed.</h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
          Order ID: {order._id}
        </p>
        <div
          className="rounded-xl border p-4 mb-6"
          style={{
            borderColor: "color-mix(in oklab, var(--color-fg) 12%, transparent)",
            background: "color-mix(in oklab, var(--color-fg) 4%, transparent)",
          }}
        >
          <p className="text-lg">Expected delivery date:</p>
          <p className="text-2xl font-bold text-brand">{eta}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <a
            href={viewHref}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            style={{
              background: "var(--color-primary)",
              color: "#fff",
              padding: "0.75rem 1.25rem",
              borderRadius: "8px",
            }}
          >
            View Invoice
          </a>
          <a
            href={downloadHref}
            className="btn btn-secondary"
            style={{
              padding: "0.75rem 1.25rem",
              borderRadius: "8px",
              border: "1px solid color-mix(in oklab, var(--color-fg) 18%, transparent)",
            }}
          >
            Download PDF
          </a>
          <Link to="/" className="btn btn-secondary" style={{ padding: "0.75rem 1.25rem", borderRadius: "8px" }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
