"use client"

import Button from "../ui/Button"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useSettings } from "../../context/SettingsContext"

export default function AboutSection() {
  const { settings } = useSettings()
  const about = settings?.homepageAbout || "Nat-Organics, as the name suggests, stands for Natural and Organic foods..."

  return (
    <section className="section-padding" aria-labelledby="home-about-title">
      <div className="container-max" style={{ position: "relative" }}>
        <span className="sparkle" style={{ top: -6, right: 16 }} aria-hidden="true" />
        <span className="sparkle teal" style={{ bottom: -8, left: 28 }} aria-hidden="true" />
        <div className="section-divider" aria-hidden="true" />
        <div className="about-grid" style={{ marginTop: 20 }}>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="about-card"
          >
            <h2
              id="home-about-title"
              className="font-serif"
              style={{ fontSize: "clamp(24px, 4.5vw, 36px)", marginTop: 0 }}
            >
              About {settings?.siteName || "Nat-Organics"}
            </h2>
            <p style={{ color: "var(--color-muted)", marginTop: 8, maxWidth: 720 }}>{about}</p>
            <div className="about-badges" aria-label="Our highlights">
              <span className="badge">
                <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--color-primary)" }} /> Organic
                only
              </span>
              <span className="badge">
                <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--color-accent)" }} /> Freshly
                prepared
              </span>
              <span className="badge">
                <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--color-primary)" }} /> No
                chemicals
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <Button as={Link} to="/about" variant="secondary" size="large">
                Learn more
              </Button>
              <Button as={Link} to="/products" variant="primary" size="large">
                Shop now
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            viewport={{ once: true }}
            className="about-card"
            aria-label="Quick stats"
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                { k: "4.8/5", v: "Avg. rating" },
                { k: "72h", v: "New edits" },
                { k: "25k+", v: "Happy customers" },
              ].map((s, i) => (
                <div key={i} className="card" style={{ padding: 14, textAlign: "center" }}>
                  <div className="font-serif" style={{ fontSize: 26, color: "var(--color-primary)" }}>
                    {s.k}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--color-muted)" }}>{s.v}</div>
                </div>
              ))}
            </div>
            <p style={{ color: "var(--color-muted)", marginTop: 14 }}>
              Numbers update regularly based on verified orders and community reviews.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
