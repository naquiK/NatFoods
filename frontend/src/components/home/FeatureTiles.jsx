const tiles = [
  {
    title: "Fresh Drops",
    desc: "Weekly limited releases from indie labels and top brands.",
    tone: "var(--color-primary)",
  },
  {
    title: "Sustainable",
    desc: "Responsible picks from verified eco lines and circular shops.",
    tone: "var(--color-accent)",
  },
  { title: "Editor’s Picks", desc: "Curated looks loved by our community and team.", tone: "var(--color-accent)" },
  { title: "Under $50", desc: "Budget-friendly finds that still go hard.", tone: "var(--color-primary)" },
]

export default function FeatureTiles() {
  return (
    <section className="section-padding">
      <div className="container-max">
        <div className="tiles">
          {tiles.map((t, i) => (
            <article className="tile shadow-lift" key={i} aria-label={t.title}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <h4 style={{ margin: 0 }}>{t.title}</h4>
                <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 999, background: t.tone }} />
              </div>
              <p style={{ color: "var(--color-muted)", marginTop: 6 }}>{t.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
