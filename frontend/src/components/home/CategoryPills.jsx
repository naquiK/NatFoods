"use client"

import { useSettings } from "../../context/SettingsContext"

const CategoryPills = ({ onSelect }) => {
  const { settings } = useSettings()
  const categories = settings?.homepageCategories?.length
    ? settings.homepageCategories
    : ["Flour", "Pulses", "Edible Oil"]

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
