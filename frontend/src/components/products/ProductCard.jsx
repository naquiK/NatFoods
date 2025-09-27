"use client"
import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../context/AuthContext"

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
  }

  const discountPercentage =
    product.isOnSale && product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0

  return (
    <motion.div
      className="group relative card overflow-hidden transition-transform duration-200"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
    >
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative aspect-product overflow-hidden bg-neutral-100">
          {product.isOnSale && discountPercentage > 0 && (
            <div className="absolute top-3 left-3 z-10 bg-accent text-on-accent px-2.5 py-1 text-[11px] font-semibold rounded">
              -{discountPercentage}%
            </div>
          )}
          {product.isFeatured && (
            <div className="absolute top-3 right-3 z-10 bg-brand text-white px-2.5 py-1 text-[11px] font-semibold rounded">
              Featured
            </div>
          )}
          <img
            src={product.images?.[0]?.url || "/placeholder.svg?height=400&width=300&query=product"}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? "scale-105" : "scale-100"}`}
            onLoad={() => setImageLoaded(true)}
          />
          {/* minimal overlay */}
          <motion.div
            className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
          />
        </div>

        <div className="p-5">
          {product.brand && (
            <p className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-1.5">{product.brand}</p>
          )}
          <h3 className="text-lg font-serif font-medium mb-2 line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base font-semibold">
              ${product.isOnSale && product.salePrice ? product.salePrice : product.price}
            </span>
            {product.isOnSale && product.salePrice && (
              <span className="text-sm text-[var(--color-muted)] line-through">${product.price}</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span
              className={`text-xs uppercase tracking-wide ${product.stock > 0 ? "text-emerald-600" : "text-red-600"}`}
            >
              {product.stock > 0 ? "In Stock" : "Out of Stock"}
            </span>
            {product.stock > 0 && product.stock <= product.lowStockThreshold && (
              <span className="text-xs text-amber-600">Low Stock</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default ProductCard
