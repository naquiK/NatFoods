import { useSettings } from "../context/SettingsContext"

export default function Returns() {
  const { settings } = useSettings()
  return (
    <main className="min-h-screen pt-24" style={{ background: "var(--color-bg)", color: "var(--color-fg)" }}>
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-serif mb-4">Cancellation & Returns</h1>
        <p style={{ color: "var(--color-muted)" }} className="mb-6">
          {settings?.returnsPolicy || "Understand our cancellation and returns process."}
        </p>
        <section className="space-y-4">
          <p className="leading-relaxed">{settings?.returnsPolicy}</p>
        </section>
      </div>
    </main>
  )
}
