"use client"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Camera, Headphones, Watch, ShoppingBag, Sparkles, Flame } from "lucide-react"

export default function BentoShowcase() {
  const items = [
    {
      icon: <Camera size={24} />,
      title: "Creator Gear",
      to: "/products?tag=creator",
      span: "sm:col-span-3 sm:row-span-2",
    },
    { icon: <Headphones size={24} />, title: "Audio", to: "/products?category=audio", span: "sm:col-span-3" },
    { icon: <Watch size={24} />, title: "Wearables", to: "/products?category=wearables", span: "sm:col-span-3" },
    { icon: <ShoppingBag size={24} />, title: "New Drops", to: "/products?tag=new", span: "sm:col-span-2" },
    { icon: <Sparkles size={24} />, title: "Trending", to: "/products?tag=trending", span: "sm:col-span-2" },
    { icon: <Flame size={24} />, title: "Hot Deals", to: "/products?tag=hot", span: "sm:col-span-2" },
  ]

  return (
    <section className="py-20">
      <div className="section-padding">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-8 text-center"
          >
            <h2 className="font-serif text-3xl md:text-4xl">Explore the Vibes</h2>
            <p className="text-[color:color-mix(in_oklab,var(--color-ink),transparent_40%)] mt-2">
              Curated picks across categories. Tap in.
            </p>
          </motion.div>

          <div className="bento-grid">
            {items.map((it, idx) => (
              <motion.div
                key={it.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className={`bento-card ${it.span} p-6`}
              >
                <div className="sheen" aria-hidden="true" />
                <div className="halo" aria-hidden="true" />
                <Link to={it.to} className="group block">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="grid place-items-center w-10 h-10 rounded-lg"
                        style={{
                          background:
                            "linear-gradient(180deg, color-mix(in oklab, var(--color-primary), transparent 70%), transparent)",
                          border: "1px solid color-mix(in oklab, var(--color-ink), transparent 85%)",
                        }}
                        aria-hidden="true"
                      >
                        <span className="text-[var(--color-fg)] opacity-90">{it.icon}</span>
                      </span>
                      <h3 className="font-semibold text-lg">{it.title}</h3>
                    </div>
                    <span className="opacity-60 group-hover:opacity-100 transition-opacity">→</span>
                  </div>
                  <p className="mt-4 text-sm opacity-80">Discover the latest pieces handpicked for the culture.</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
