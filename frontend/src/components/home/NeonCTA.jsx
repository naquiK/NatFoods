"use client"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import Button from "../ui/Button"

export default function NeonCTA() {
  return (
    <section className="py-24">
      <div className="section-padding">
        <div className="container-max">
          <div className="neon-cta">
            <div className="inner p-10 md:p-14">
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center max-w-3xl mx-auto"
              >
                <h2 className="font-serif text-3xl md:text-5xl mb-4 tracking-tight">Elevate your everyday</h2>
                <p className="text-base md:text-lg opacity-80 mb-8">
                  Fresh drops, bold colors, and gear that goes hard. Join the wave.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button as={Link} to="/products" variant="primary" size="large" className="btn-sheen">
                    Shop now
                  </Button>
                  <Button as={Link} to="/about" variant="secondary" size="large">
                    Learn more
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
