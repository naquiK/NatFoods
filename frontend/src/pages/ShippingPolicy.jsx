import { useSettings } from "../context/SettingsContext"

export default function ShippingPolicy() {
  const { settings } = useSettings()
  return (
    <main className="min-h-screen pt-24" style={{ background: "var(--color-bg)", color: "var(--color-fg)" }}>
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-serif mb-4">Shipping Policy</h1>
        <p style={{ color: "var(--color-muted)" }} className="mb-6">
          {settings?.shippingPolicy || "Learn about shipping methods, timelines, and costs."}
        </p>
        <section className="space-y-4">
          <p className="leading-relaxed">{settings?.shippingPolicy}</p>
        </section>
      </div>
    </main>
  )
}
