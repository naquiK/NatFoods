"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, Grid, List, ChevronDown, X, Search, Sparkles, Star } from "lucide-react"
import { productsAPI } from "../utils/api"
import ProductCard from "../components/products/ProductCard"
import Button from "../components/ui/Button"
import HoloGridLoader from "../components/ui/HoloGridLoader"

const Products = () => {
  // --- All your existing state and logic remains here ---
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState("grid")
  const [showFilters, setShowFilters] = useState(false)

  const [searchParams, setSearchParams] = useSearchParams()

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    brand: searchParams.get("brand") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "createdAt",
    order: searchParams.get("order") || "desc",
    featured: searchParams.get("featured") || "",
    onSale: searchParams.get("onSale") || "",
  })

  useEffect(() => {
    fetchProducts()
    fetchFiltersData()
  }, [searchParams, currentPage])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: 12,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== "")),
      }
      const response = await productsAPI.getAll(params)
      setProducts(response.data.products)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFiltersData = async () => {
    // This can be optimized to run only once
    if (categories.length === 0) {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([productsAPI.getCategories(), productsAPI.getBrands()])
        setCategories(categoriesRes.data)
        setBrands(brandsRes.data)
      } catch (error) {
        console.error("Error fetching filters data:", error)
      }
    }
  }

  const handleFilterChange = (key, value) => {
    // Debounce search input
    if (key === "search") {
      const timer = setTimeout(() => {
        updateFiltersAndParams({ ...filters, [key]: value })
      }, 500)
      return () => clearTimeout(timer)
    }
    updateFiltersAndParams({ ...filters, [key]: value })
  }

  const updateFiltersAndParams = (newFilters) => {
    setFilters(newFilters)
    const newSearchParams = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newSearchParams.set(k, v)
    })
    setSearchParams(newSearchParams)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    const defaultFilters = {
      search: "",
      category: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      sort: "createdAt",
      order: "desc",
      featured: "",
      onSale: "",
    }
    setFilters(defaultFilters)
    setSearchParams({})
    setCurrentPage(1)
  }

  const sortOptions = [
    { value: "createdAt-desc", label: "Newest" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "averageRating-desc", label: "Highest Rated" },
  ]

  // --- New UI Starts Here ---
  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-800 text-neutral-800 dark:text-neutral-200">
      {/* --- Immersive Header --- */}
      <motion.div
        className="relative h-80 md:h-96 flex items-center justify-center text-center text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Floating elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full opacity-30 blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full opacity-30 blur-xl animate-pulse delay-1000"></div>

        <motion.div
          className="relative z-10 max-w-4xl mx-auto px-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
              Our Collection
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Discover amazing products curated just for you ✨
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-white/80 ml-2">Rated 5/5 by our customers</span>
          </div>
        </motion.div>
      </motion.div>

      <div className="container-max mx-auto px-6 py-12">
        {/* --- Toolbar --- */}
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-400" />
            <input
              type="text"
              defaultValue={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Search for amazing products..."
              className="w-full md:w-80 pl-12 pr-4 py-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-violet-200 dark:border-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 transition-all duration-200 text-gray-700 dark:text-gray-200 placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 hover:from-violet-600 hover:to-purple-700 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Filter size={16} />
              Filters
              <ChevronDown size={16} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
            <div className="flex border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 transition-all duration-200 ${viewMode === "grid" ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg" : "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700"}`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 transition-all duration-200 ${viewMode === "list" ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg" : "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700"}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* --- Animated Filter Deck --- */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -20 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="mb-8 p-8 rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-violet-200 dark:border-violet-700 shadow-2xl overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Category</label>
                  <select
                    onChange={(e) => handleFilterChange("category", e.target.value)}
                    value={filters.category}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-slate-700/50 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-200"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Brand</label>
                  <select
                    onChange={(e) => handleFilterChange("brand", e.target.value)}
                    value={filters.brand}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-slate-700/50 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-200"
                  >
                    <option value="">All Brands</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Sort By</label>
                  <select
                    onChange={(e) => {
                      const [sort, order] = e.target.value.split("-")
                      handleFilterChange("sort", sort)
                      handleFilterChange("order", order)
                    }}
                    value={`${filters.sort}-${filters.order}`}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-slate-700/50 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-200"
                  >
                    {sortOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Price Range
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                      placeholder="Min $"
                      className="w-1/2 px-3 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-slate-700/50 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-200"
                    />
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                      placeholder="Max $"
                      className="w-1/2 px-3 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-slate-700/50 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Special</label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.featured === "true"}
                        onChange={(e) => handleFilterChange("featured", e.target.checked ? "true" : "")}
                        className="w-5 h-5 text-violet-600 bg-gray-100 border-gray-300 rounded focus:ring-violet-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium">⭐ Featured</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.onSale === "true"}
                        onChange={(e) => handleFilterChange("onSale", e.target.checked ? "true" : "")}
                        className="w-5 h-5 text-violet-600 bg-gray-100 border-gray-300 rounded focus:ring-violet-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium">🔥 On Sale</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 flex justify-end">
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-gray-600 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-xl px-4 py-2 transition-all duration-200"
                >
                  <X size={16} />
                  Clear Filters
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Products Grid --- */}
        {loading ? (
          <div className="min-h-[50vh] flex items-center justify-center">
            <HoloGridLoader />
          </div>
        ) : products.length > 0 ? (
          <>
            <motion.div
              layout
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                  : "space-y-6"
              }
            >
              <AnimatePresence>
                {products.map((product, index) => (
                  <motion.div
                    layout
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="w-full"
                  >
                    <ProductCard product={product} viewMode={viewMode} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            {/* --- Pagination --- */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4 mt-16">
                <Button
                  variant="secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((c) => c - 1)}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-violet-200 dark:border-violet-700 hover:border-violet-500 rounded-xl px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-xl font-semibold transition-all duration-200 ${
                          currentPage === page
                            ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg"
                            : "bg-white/80 dark:bg-slate-800/80 text-gray-600 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/20"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>
                <Button
                  variant="secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((c) => c + 1)}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-violet-200 dark:border-violet-700 hover:border-violet-500 rounded-xl px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <motion.div
            className="text-center py-24 min-h-[50vh] flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-24 h-24 bg-gradient-to-r from-violet-400 to-purple-500 rounded-full flex items-center justify-center mb-6">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              No Products Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
              Your search returned no results. Try adjusting your filters or search terms.
            </p>
            <Button
              onClick={clearFilters}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl px-8 py-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Clear All Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Products
