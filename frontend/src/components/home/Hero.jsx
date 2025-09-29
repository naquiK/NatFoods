import Button from "../ui/Button"
import { Link } from "react-router-dom"
import { useSettings } from "../../context/SettingsContext"

export default function Hero() {
  const { settings } = useSettings()
  const lines = settings?.homepageTaglines?.length
    ? settings.homepageTaglines
    : ["Nature's Best, Delivered to Your Doorstep.", "Simple, Organic Goodness. No Chemicals.", "Prepared On-Demand."]

  return (
    <section className="hero">
      <div className="section-padding">
        <div className="container-max hero-grid">
          <div>
            <span className="hero-badge">
              <span
                style={{ width: 6, height: 6, borderRadius: 999, background: "var(--color-accent)" }}
                aria-hidden="true"
              />
              {settings?.siteName || "Nat-Organics"}
            </span>
            <h1 className="text-balance" style={{ fontSize: "clamp(32px, 6vw, 56px)", margin: "6px 0 8px" }}>
              {lines[0]}
            </h1>
            <p style={{ color: "var(--color-muted)", maxWidth: 620 }}>{lines.slice(1).join(" ")}</p>
            <div className="hero-actions">
              <Button as={Link} to="/products" variant="primary" size="large">
                Explore Products
              </Button>
              <Button as={Link} to="/offers" variant="ghost" size="large">
                View Offers
              </Button>
            </div>
          </div>

          <div className="hero-art">
            <div className="blob teal"></div>
            <div className="blob coral"></div>
            <div className="blob sun"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
