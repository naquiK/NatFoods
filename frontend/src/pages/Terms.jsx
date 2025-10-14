import { useSettings } from "../context/SettingsContext"

export default function Terms() {
  const { settings } = useSettings()
  return (
    <main className="min-h-screen pt-24" style={{ background: "var(--color-bg)", color: "var(--color-fg)" }}>
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-serif mb-4">Terms & Conditions</h1>
        <p style={{ color: "var(--color-muted)" }} className="mb-6">
          {settings?.termsAndConditions || "Please read these terms and conditions carefully before using our website."}
        </p>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">1. Introduction</h2>
          <p>{settings?.introduction || "By accessing or using our services, you agree to be bound by these Terms."}</p>
          <h2 className="text-xl font-semibold">2. Purchases</h2>
          <p>{settings?.purchases || "All orders are subject to acceptance and availability."}</p>
          <h2 className="text-xl font-semibold">3. Limitation of Liability</h2>
          <p>
            {settings?.limitationOfLiability ||
              "We are not liable for indirect or consequential damages to the extent permitted by law."}
          </p>
        </section>
      </div>
    </main>
  )
}
