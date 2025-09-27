const items = [
  "24h Express Delivery",
  "7-Day Easy Returns",
  "Drop Alerts Enabled",
  "Secure Checkout",
  "Student Perks",
  "eKart Exclusive",
]

export default function Marquee() {
  return (
    <div className="marquee" aria-label="Shop perks">
      <div className="section-padding">
        <div className="container-max">
          <div className="marquee-track" role="list">
            {[...items, ...items].map((t, i) => (
              <span className="marquee-item" role="listitem" key={i}>
                {t} •
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
