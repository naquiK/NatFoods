import { useSettings } from "../context/SettingsContext"

export default function Privacy() {
  const { settings } = useSettings()
  return (
    <main className="min-h-screen pt-24" style={{ background: "var(--color-bg)", color: "var(--color-fg)" }}>
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-serif mb-4">Privacy Policy</h1>
        <p style={{ color: "var(--color-muted)" }} className="mb-6">
          {settings?.privacyPolicy || "We respect your privacy and are committed to protecting your personal data."}
        </p>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Information We Collect</h2>
          <p>{settings?.informationWeCollect || "We collect information to provide and improve our services."}</p>
          <h2 className="text-xl font-semibold">How We Use Information</h2>
          <p>
            {settings?.howWeUseInformation ||
              "We use information to process orders, support customers, and improve our offerings."}
          </p>
        </section>
      </div>
    </main>
  )
}
