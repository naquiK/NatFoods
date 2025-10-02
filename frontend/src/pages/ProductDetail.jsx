"use client"
import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Star, ShoppingBag, Heart, Minus, Plus, Truck, Shield, RotateCcw, Sparkles, Award, Users } from "lucide-react"
import { productsAPI, api } from "../utils/api"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import Button from "../components/ui/Button"
import toast from "react-hot-toast"

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("description")
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

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

  useEffect(() => {
    setWishlisted(Array.isArray(user?.wishlist) && product ? user.wishlist.includes(product?._id) : false)
  }, [user, product])

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

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to use wishlist")
      return
    }
    try {
      if (wishlisted) {
        await api.delete(`/api/auth/wishlist/${product._id}`)
        setWishlisted(false)
        toast.success("Removed from wishlist")
      } else {
        await api.post(`/api/auth/wishlist/${product._id}`)
        setWishlisted(true)
        toast.success("Added to wishlist")
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Wishlist action failed")
    }
  }

  const buyNow = (product, quantity) => {
    // Implement buy now logic here
    addToCart(product, quantity)
    navigate("/cart")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-cyan-50 dark:from-slate-900 dark:to-purple-900">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-cyan-50 dark:from-slate-900 dark:to-purple-900">
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
    <div className="pt-20 min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-800">
      <div className="section-padding py-12">
        <div className="container-max">
          {/* Enhanced Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm mb-8 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full px-6 py-3 w-fit">
            <Link to="/" className="text-violet-600 hover:text-violet-800 font-medium transition-colors duration-200">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              to="/products"
              className="text-violet-600 hover:text-violet-800 font-medium transition-colors duration-200"
            >
              Products
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700 dark:text-gray-200 font-medium">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Enhanced Product Images */}
            <div className="space-y-6">
              {/* Main Image with gradient border */}
              <motion.div
                className="relative aspect-square bg-gradient-to-br from-violet-100 to-cyan-100 dark:from-slate-700 dark:to-purple-800 overflow-hidden rounded-3xl p-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-full h-full bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
                  <img
                    src={product.images?.[selectedImage]?.url || "/placeholder.svg?height=600&width=600&query=product"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating badges */}
                {product.isOnSale && (
                  <div className="absolute top-6 left-6 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                    -{discountPercentage}% OFF
                  </div>
                )}
                {product.featured && (
                  <div className="absolute top-6 right-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    Featured
                  </div>
                )}
              </motion.div>

              {/* Enhanced Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-4 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-3 transition-all duration-200 ${
                        selectedImage === index
                          ? "border-violet-500 shadow-lg scale-110"
                          : "border-gray-200 dark:border-gray-600 hover:border-violet-300"
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

            {/* Enhanced Product Info */}
            <div className="space-y-8">
              {/* Brand with icon */}
              {product.brand && (
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-violet-500" />
                  <p className="text-sm uppercase tracking-wide text-violet-600 dark:text-violet-400 font-semibold">
                    {product.brand}
                  </p>
                </div>
              )}

              {/* Enhanced Name */}
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                {product.name}
              </h1>

              {/* Enhanced Rating */}
              {product.averageRating > 0 && (
                <div className="flex items-center space-x-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl px-6 py-4 w-fit">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={`${i < Math.floor(product.averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 dark:text-gray-300 font-medium flex items-center gap-1">
                    <Users className="w-4 h-4" />({product.numReviews} reviews)
                  </span>
                </div>
              )}

              {/* Enhanced Price */}
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-slate-800 dark:to-purple-900 rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl font-bold text-violet-600 dark:text-violet-400">
                    ₹{product.isOnSale && product.salePrice ? product.salePrice : product.price}
                  </span>
                  {product.isOnSale && product.salePrice && (
                    <>
                      <span className="text-2xl text-gray-400 line-through">₹{product.price}</span>
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 text-sm font-bold rounded-full shadow-lg">
                        SAVE ₹{(product.price - product.salePrice).toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Enhanced Stock Status */}
              <div className="flex items-center space-x-4">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    product.stock > 0
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  {product.stock > 0 ? `✅ ${product.stock} in stock` : "❌ Out of stock"}
                </span>
                {product.stock > 0 && product.stock <= product.lowStockThreshold && (
                  <span className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 px-4 py-2 rounded-full text-sm font-semibold">
                    🔥 Low stock!
                  </span>
                )}
              </div>

              {/* Enhanced Description */}
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{product.description}</p>
              </div>

              {/* Enhanced Features */}
              {product.features && product.features.length > 0 && (
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
                    <Sparkles className="w-5 h-5" />
                    Key Features
                  </h3>
                  <ul className="space-y-3">
                    {product.features.map((feature, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start gap-3">
                        <span className="text-cyan-500 text-xl">✨</span>
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Enhanced Quantity & Add to Cart */}
              {product.stock > 0 && (
                <div className="space-y-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6">
                  <div className="flex items-center space-x-6">
                    <span className="font-semibold text-lg">Quantity:</span>
                    <div className="flex items-center border-2 border-violet-200 dark:border-violet-700 rounded-xl overflow-hidden bg-white dark:bg-slate-700">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="p-3 hover:bg-violet-100 dark:hover:bg-violet-800 disabled:opacity-50 transition-colors duration-200"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-6 py-3 min-w-16 text-center font-bold text-lg">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                        className="p-3 hover:bg-violet-100 dark:hover:bg-violet-800 disabled:opacity-50 transition-colors duration-200"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      onClick={handleAddToCart}
                      className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <ShoppingBag size={20} className="mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      onClick={() => {
                        buyNow(product, quantity)
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Buy Now
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={toggleWishlist}
                      className={`bg-white/80 dark:bg-slate-700/80 border-2 ${
                        wishlisted
                          ? "border-pink-500 text-pink-600 dark:text-pink-400"
                          : "border-pink-200 dark:border-pink-700"
                      } hover:border-pink-500 text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-xl px-6 py-4 transition-all duration-200`}
                    >
                      <Heart size={20} />
                    </Button>
                  </div>
                </div>
              )}

              {/* Enhanced Features */}
              <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-slate-800 dark:to-teal-900 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-3 text-green-700 dark:text-green-300">
                  <Truck size={20} className="text-green-500" />
                  <span className="font-medium">Free shipping on orders over ₹50</span>
                </div>
                <div className="flex items-center space-x-3 text-blue-700 dark:text-blue-300">
                  <Shield size={20} className="text-blue-500" />
                  <span className="font-medium">2-year warranty included</span>
                </div>
                <div className="flex items-center space-x-3 text-purple-700 dark:text-purple-300">
                  <RotateCcw size={20} className="text-purple-500" />
                  <span className="font-medium">30-day return policy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Product Details Tabs */}
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-3xl overflow-hidden">
            {/* Enhanced Tab Navigation */}
            <div className="flex space-x-0 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-slate-700 dark:to-purple-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-6 px-6 text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-lg"
                      : "text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-white/50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Enhanced Tab Content */}
            <div className="p-8">
              {activeTab === "description" && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{product.description}</p>
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {product.specifications && Object.keys(product.specifications).length > 0 ? (
                    Object.entries(product.specifications).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between py-4 px-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 rounded-xl"
                      >
                        <span className="font-semibold capitalize text-gray-700 dark:text-gray-200">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                        <span className="text-gray-600 dark:text-gray-300 font-medium">{value}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 text-center col-span-2 py-8">
                      No specifications available.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-8">
                  {/* Enhanced Review Form */}
                  {isAuthenticated && (
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-slate-700 dark:to-purple-800 p-8 rounded-2xl">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-violet-700 dark:text-violet-300">
                        <Star className="w-6 h-6" />
                        Write a Review
                      </h3>
                      <form onSubmit={handleReviewSubmit} className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                            Rating
                          </label>
                          <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                className="text-3xl transition-all duration-200 hover:scale-110"
                              >
                                <Star
                                  className={`${star <= reviewForm.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                            Comment
                          </label>
                          <textarea
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-slate-700/50 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-200"
                            placeholder="Share your thoughts about this product..."
                          />
                        </div>
                        <Button
                          type="submit"
                          loading={submittingReview}
                          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                          Submit Review
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* Enhanced Reviews List */}
                  <div className="space-y-6">
                    {product.reviews && product.reviews.length > 0 ? (
                      product.reviews.map((review) => (
                        <div
                          key={review._id}
                          className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={`${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              {review.userId?.name || "Anonymous"}
                            </span>
                            <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{review.comment}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-r from-violet-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Star className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                          No reviews yet. Be the first to review this product!
                        </p>
                      </div>
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
