"use client"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { productsAPI } from "../utils/api"
import { useSettings } from "../context/SettingsContext"
import ProductCard from "../components/products/ProductCard"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import Button from "../components/ui/Button"
import CategoryPills from "../components/home/CategoryPills"
import TestimonialStrip from "../components/home/TestimonialStrip"
import BentoShowcase from "../components/home/BentoShowcase"
import NeonCTA from "../components/home/NeonCTA"

import Hero from "../components/home/Hero"
import Marquee from "../components/home/Marquee"
import FeatureTiles from "../components/home/FeatureTiles"
import ProductSpotlight from "../components/home/ProductSpotlight"
import AboutSection from "../components/home/AboutSection"

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [saleProducts, setSaleProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { settings } = useSettings()

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      const [featuredRes, saleRes] = await Promise.all([productsAPI.getFeatured(), productsAPI.getOnSale()])

      setFeaturedProducts(featuredRes.data)
      setSaleProducts(saleRes.data)
    } catch (error) {
      console.error("Error fetching home data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="home-vibrant pt-20">
      <div className="aurora-bg">
        {/* New Animated Hero */}
        <Hero />
      </div>

      {/* Colorful Marquee */}
      <Marquee />

      {/* Interactive Feature Tiles */}
      <FeatureTiles />

      {/* New Animated Bento Showcase */}
      <BentoShowcase />

      {/* Quick category browse */}
      <CategoryPills onSelect={(c) => (window.location.href = `/products?category=${encodeURIComponent(c)}`)} />

      {/* New About section on Home */}
      <AboutSection />

      {/* Trending Now section */}
      {(saleProducts.length > 0 || featuredProducts.length > 0) && (
        <section className="py-24 bg-[var(--color-bg)]">
          <div className="section-padding">
            <div className="container-max">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <h2 className="font-serif text-3xl md:text-4xl">Trending Now</h2>
                <p className="text-[var(--color-muted)] max-w-2xl mt-2">
                  Hand-picked bestsellers getting the most love this week.
                </p>
              </motion.div>

              <div className="overflow-x-auto no-scrollbar">
                <div className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-6">
                  {(saleProducts.length ? saleProducts : featuredProducts).slice(0, 12).map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Simple Carousel Spotlight using Featured Products from backend only */}
      {featuredProducts.length > 0 && <ProductSpotlight items={featuredProducts} />}

      {/* Featured Products - keep but visually consistent */}
      {featuredProducts.length > 0 && (
        <section className="py-24 bg-[var(--color-bg)]">
          <div className="section-padding">
            <div className="container-max">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-10"
              >
                <h2 className="font-serif text-3xl md:text-4xl">Featured Products</h2>
                <p className="text-[var(--color-muted)] max-w-2xl mx-auto mt-2">
                  Discover our carefully curated selection of premium products.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.slice(0, 8).map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Button as={Link} to="/products" variant="secondary">
                  View All Products <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sale Products */}
      {saleProducts.length > 0 && (
        <section className="py-24 bg-white dark:bg-neutral-800">
          <div className="section-padding">
            <div className="container-max">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-h2 font-serif mb-6">Special Offers</h2>
                <p className="text-body-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                  Don't miss out on these limited-time offers on our most popular products.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {saleProducts.slice(0, 8).map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Social proof ticker */}
      <TestimonialStrip />

      {/* Neon CTA */}
      <NeonCTA />
    </div>
  )
}

export default Home
