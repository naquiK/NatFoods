"use client"
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Star, ShoppingBag, Heart, Minus, Plus, Truck, Shield, RotateCcw } from "lucide-react"
import { productsAPI } from "../utils/api"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import Button from "../components/ui/Button"
import toast from "react-hot-toast"

const ProductDetail = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("description")
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" })
  const [submittingReview, setSubmittingReview] = useState(false)

  const { addToCart } = useCart()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(id)
      setProduct(response.data)
    } catch (error) {
      console.error("Error fetching product:", error)
      toast.error("Product not found")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity)
    }
  }

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity)
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error("Please login to submit a review")
      return
    }

    setSubmittingReview(true)
    try {
      await productsAPI.addReview(id, reviewForm)
      toast.success("Review submitted successfully!")
      setReviewForm({ rating: 5, comment: "" })
      fetchProduct() // Refresh to show new review
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review")
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-h2 font-serif mb-4">Product Not Found</h2>
          <Link to="/products" className="text-primary-600 hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const discountPercentage =
    product.isOnSale && product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0

  const tabs = [
    { id: "description", label: "Description" },
    { id: "specifications", label: "Specifications" },
    { id: "reviews", label: `Reviews (${product.numReviews})` },
  ]

  return (
    <div className="pt-20 min-h-screen bg-[var(--color-bg)]">
      <div className="section-padding py-12">
        <div className="container-max">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-neutral-600 mb-8">
            <Link to="/" className="hover:text-neutral-900">
              Home
            </Link>
            <span>/</span>
            <Link to="/products" className="hover:text-neutral-900">
              Products
            </Link>
            <span>/</span>
            <span className="text-neutral-900">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <motion.div
                className="aspect-square bg-neutral-100 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <img
                  src={product.images?.[selectedImage]?.url || "/placeholder.svg?height=600&width=600&query=product"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-4 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 bg-neutral-100 overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? "border-neutral-900" : "border-transparent"
                      }`}
                    >
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Brand */}
              {product.brand && <p className="text-sm uppercase tracking-wide text-neutral-500">{product.brand}</p>}

              {/* Name */}
              <h1 className="text-h1 font-serif">{product.name}</h1>

              {/* Rating */}
              {product.averageRating > 0 && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={`${
                          i < Math.floor(product.averageRating) ? "text-yellow-400 fill-current" : "text-neutral-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-neutral-600">({product.numReviews} reviews)</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold">
                  ${product.isOnSale && product.salePrice ? product.salePrice : product.price}
                </span>
                {product.isOnSale && product.salePrice && (
                  <>
                    <span className="text-xl text-[var(--color-muted)] line-through">${product.price}</span>
                    <span className="bg-accent text-on-accent px-3 py-1 text-sm font-semibold rounded">
                      -{discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-4">
                <span className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
                {product.stock > 0 && product.stock <= product.lowStockThreshold && (
                  <span className="text-sm text-orange-600 font-medium">Low stock!</span>
                )}
              </div>

              {/* Description */}
              <p className="text-neutral-600 leading-relaxed">{product.description}</p>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Key Features:</h3>
                  <ul className="space-y-1">
                    {product.features.map((feature, index) => (
                      <li key={index} className="text-neutral-600 flex items-start">
                        <span className="text-primary-600 mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              {product.stock > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">Quantity:</span>
                    <div className="flex items-center border border-neutral-300">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="p-2 hover:bg-neutral-100 disabled:opacity-50"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 py-2 min-w-16 text-center">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                        className="p-2 hover:bg-neutral-100 disabled:opacity-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button onClick={handleAddToCart} className="flex-1">
                      <ShoppingBag size={20} className="mr-2" />
                      Add to Cart
                    </Button>
                    <Button variant="secondary">
                      <Heart size={20} />
                    </Button>
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="border-t border-neutral-200 pt-6 space-y-4">
                <div className="flex items-center space-x-3 text-sm text-neutral-600">
                  <Truck size={16} />
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-neutral-600">
                  <Shield size={16} />
                  <span>2-year warranty included</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-neutral-600">
                  <RotateCcw size={16} />
                  <span>30-day return policy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="border-t border-neutral-200">
            {/* Tab Navigation */}
            <div className="flex space-x-8 border-b border-neutral-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-neutral-900 text-neutral-900"
                      : "border-transparent text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="py-8">
              {activeTab === "description" && (
                <div className="prose max-w-none">
                  <p className="text-neutral-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {product.specifications && Object.keys(product.specifications).length > 0 ? (
                    Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-neutral-100">
                        <span className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                        <span className="text-neutral-600">{value}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-neutral-600">No specifications available.</p>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-8">
                  {/* Review Form */}
                  {isAuthenticated && (
                    <div className="bg-neutral-50 p-6">
                      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">Rating</label>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                className="text-2xl"
                              >
                                <Star
                                  className={`${
                                    star <= reviewForm.rating ? "text-yellow-400 fill-current" : "text-neutral-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">Comment</label>
                          <textarea
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                            rows={4}
                            className="input-field"
                            placeholder="Share your thoughts about this product..."
                          />
                        </div>
                        <Button type="submit" loading={submittingReview}>
                          Submit Review
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-6">
                    {product.reviews && product.reviews.length > 0 ? (
                      product.reviews.map((review) => (
                        <div key={review._id} className="border-b border-neutral-200 pb-6">
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={`${
                                    i < review.rating ? "text-yellow-400 fill-current" : "text-neutral-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-medium">{review.userId?.name || "Anonymous"}</span>
                            <span className="text-sm text-neutral-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {review.comment && <p className="text-neutral-600">{review.comment}</p>}
                        </div>
                      ))
                    ) : (
                      <p className="text-neutral-600">No reviews yet. Be the first to review this product!</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
