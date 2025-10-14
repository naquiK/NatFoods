"use client"
import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { api } from "../utils/api"
import LoadingSpinner from "../components/ui/LoadingSpinner"

export default function OrderSuccess() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [invLoading, setInvLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/api/orders/${id}`)
        setOrder(data)
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load order")
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  const canGenerate = order?.status === "accepted"

  const handleGenerate = async () => {
    if (!canGenerate || !order) return
    setInvLoading(true)
    setError("")
    try {
      const { data } = await api.post(`/api/orders/${order._id}/invoice`)
      setOrder({ ...order, invoiceUrl: data.invoiceUrl })
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to generate invoice"
      setError(msg)
    } finally {
      setInvLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <LoadingSpinner />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <div className="text-center" style={{ color: "var(--color-fg)" }}>
          <h1 className="text-2xl font-bold">Order not found</h1>
          <Link to="/" className="underline">
            {"Go Home"}
          </Link>
        </div>
      </div>
    )
  }

  const eta = order.expectedDeliveryDate
    ? new Date(order.expectedDeliveryDate).toDateString()
    : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toDateString()

  const downloadHref = `/api/orders/${order._id}/invoice.pdf`

  return (
    <div className="min-h-screen pt-20" style={{ background: "var(--color-bg)", color: "var(--color-fg)" }}>
      <div className="max-w-xl mx-auto px-4 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "color-mix(in oklab, var(--color-primary) 18%, transparent)" }}
        >
          <svg
            className="w-8 h-8"
            style={{ color: "var(--color-primary)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-serif mb-2">Thank you! Your order is confirmed.</h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
          Order ID: {order._id} • Status: {order.status}
        </p>

        <div
          className="rounded-xl border p-4 mb-6"
          style={{
            borderColor: "color-mix(in oklab, var(--color-fg) 12%, transparent)",
            background: "color-mix(in oklab, var(--color-fg) 4%, transparent)",
          }}
        >
          <p className="text-lg">Expected delivery date:</p>
          <p className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
            {eta}
          </p>
        </div>

        {error && (
          <div
            className="mb-4 text-sm"
            style={{
              color: "var(--color-danger, #ef4444)",
            }}
          >
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-center flex-wrap">
          {order.invoiceUrl ? (
            <>
              {/* Use same-origin backend endpoint for viewing to avoid direct Cloudinary 401s */}
              <a
                href={downloadHref}
                target="_blank"
                rel="noreferrer"
                className="btn"
                style={{
                  background: "var(--color-primary)",
                  color: "#fff",
                  padding: "0.75rem 1.25rem",
                  borderRadius: "8px",
                }}
              >
                View / Download Invoice
              </a>
            </>
          ) : (
            <>
              <button
                onClick={handleGenerate}
                disabled={!canGenerate || invLoading}
                className="btn"
                style={{
                  background: canGenerate
                    ? "var(--color-primary)"
                    : "color-mix(in oklab, var(--color-fg) 12%, transparent)",
                  color: canGenerate ? "#fff" : "var(--color-muted)",
                  padding: "0.75rem 1.25rem",
                  borderRadius: "8px",
                  cursor: canGenerate ? "pointer" : "not-allowed",
                }}
              >
                {invLoading ? "Generating..." : "Generate Invoice"}
              </button>
              {!canGenerate && (
                <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                  Invoice will be available once your order is accepted by admin.
                </p>
              )}
            </>
          )}
          <Link
            to="/"
            className="btn"
            style={{
              padding: "0.75rem 1.25rem",
              borderRadius: "8px",
              border: "1px solid color-mix(in oklab, var(--color-fg) 18%, transparent)",
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
