"use client"

import { useEffect, useRef, useState } from "react"
import Button from "../ui/Button"

export default function ProductSpotlight({ items }) {
  const sample = items?.length
    ? items.slice(0, 3).map((p, idx) => ({
        id: p._id ?? idx,
        title: p.name ?? p.title ?? "Product",
        price: typeof p.price === "number" ? `$${p.price}` : (p.price ?? "$—"),
        img: p.image?.url || p.thumbnail || "/diverse-products-still-life.png",
      }))
    : [
        { id: 1, title: "Aurora Runner", price: "$129", img: "/aurora-runner.jpg" },
        { id: 2, title: "Neon Hoodie", price: "$89", img: "/neon-hoodie.png" },
        { id: 3, title: "Pulse Earbuds", price: "$59", img: "/wireless-earbuds.png" },
      ]

  const [index, setIndex] = useState(0)
  const trackRef = useRef(null)

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % sample.length), 3800)
    return () => clearInterval(t)
  }, [sample.length])

  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${index * 100}%)`
    }
  }, [index])

  return (
    <section className="section-padding">
      <div className="container-max spot">
        <div>
          <h3 style={{ margin: 0, fontSize: 22 }}>
            Spotlight <span style={{ color: "var(--color-accent)" }}>This Week</span>
          </h3>
          <p className="text-muted" style={{ marginTop: 6, color: "var(--color-muted)" }}>
            Handpicked essentials trending with our community.
          </p>
          <div className="spot-viewport">
            <div className="spot-track" ref={trackRef}>
              {sample.map((p) => (
                <div className="spot-card" key={p.id}>
                  <img className="spot-img" src={p.img || "/placeholder.svg"} alt={p.title} />
                  <div className="spot-meta">
                    <div>
                      <strong>{p.title}</strong>
                      <div style={{ fontSize: 13, color: "var(--color-muted)" }}>{p.price}</div>
                    </div>
                    <Button variant="primary">Add to Cart</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="spot-controls">
            <button
              className="icon-btn"
              aria-label="Previous"
              onClick={() => setIndex((i) => (i - 1 + sample.length) % sample.length)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <button className="icon-btn" aria-label="Next" onClick={() => setIndex((i) => (i + 1) % sample.length)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>

        <aside
          className="surface"
          style={{
            padding: 16,
            border: "1px solid color-mix(in oklab, var(--color-fg) 12%, transparent)",
            borderRadius: "var(--radius)",
            background: "var(--color-bg)",
          }}
        >
          <h4 style={{ marginTop: 0 }}>Why eKart?</h4>
          <ul style={{ paddingLeft: 18, margin: "8px 0 0", lineHeight: 1.8, color: "var(--color-fg)" }}>
            <li>Gen Z-first curation, weekly new drops.</li>
            <li>Price transparency and student perks.</li>
            <li>Fast shipping and easy returns.</li>
          </ul>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <a className="btn btn-secondary" href="/about">
              Learn More
            </a>
            <a className="btn btn-ghost" href="/products">
              Browse All
            </a>
          </div>
        </aside>
      </div>
    </section>
  )
}
