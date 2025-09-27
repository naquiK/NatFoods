"use client"

const categories = ["Sneakers", "Hoodies", "Tees", "Accessories", "Denim", "Athleisure", "Outerwear", "Caps"]

const CategoryPills = ({ onSelect }) => {
  return (
    <section aria-label="Browse categories" className="section-padding" style={{ background: "var(--color-bg)" }}>
      <div className="container-max">
        <div className="pills">
          {categories.map((c) => (
            <button key={c} className="pill focus-ring" onClick={() => onSelect?.(c)} aria-label={`Filter by ${c}`}>
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategoryPills
