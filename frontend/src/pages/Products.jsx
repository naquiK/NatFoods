// pages/Products.jsx
"use client"
import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, Grid, List, ChevronDown, X, Search } from "lucide-react"
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
      search: "", category: "", brand: "", minPrice: "", maxPrice: "",
      sort: "createdAt", order: "desc", featured: "", onSale: "",
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
    <div className="pt-20 min-h-screen bg-neutral-50 dark:bg-black text-neutral-800 dark:text-neutral-200">
      {/* --- Immersive Header --- */}
      <motion.div 
        className="relative h-64 md:h-80 flex items-center justify-center text-center text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1550520310-c0235a9a4686?q=80&w=2000')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        <motion.div 
          className="relative z-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Our Collection</h1>
          <p className="mt-4 text-lg text-white/80 max-w-2xl">Browse a universe of curated products, designed for the modern connoisseur.</p>
        </motion.div>
      </motion.div>
      
      <div className="container-max mx-auto px-4 py-12">
        {/* --- Toolbar --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              defaultValue={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Search in collection..."
              className="w-full md:w-64 pl-12 pr-4 py-3 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              Filters
              <ChevronDown size={16} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
            <div className="flex border border-neutral-200 dark:border-neutral-800 rounded-full overflow-hidden">
               <button onClick={() => setViewMode("grid")} className={`p-3 ${viewMode === "grid" ? "bg-primary-500 text-white" : "bg-transparent"}`}><Grid size={16} /></button>
               <button onClick={() => setViewMode("list")} className={`p-3 ${viewMode === "list" ? "bg-primary-500 text-white" : "bg-transparent"}`}><List size={16} /></button>
            </div>
          </div>
        </div>

        {/* --- Animated Filter Deck --- */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -20 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="mb-8 p-6 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {/* Category, Brand, Price, Special filters go here */}
                <select onChange={(e) => handleFilterChange("category", e.target.value)} value={filters.category} className="input-field"><option value="">All Categories</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                <select onChange={(e) => handleFilterChange("brand", e.target.value)} value={filters.brand} className="input-field"><option value="">All Brands</option>{brands.map(b => <option key={b} value={b}>{b}</option>)}</select>
                <select onChange={(e) => { const [sort, order] = e.target.value.split("-"); handleFilterChange("sort", sort); handleFilterChange("order", order);}} value={`${filters.sort}-${filters.order}`} className="input-field">{sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                <div className="flex items-center gap-2">
                  <input type="number" value={filters.minPrice} onChange={(e) => handleFilterChange("minPrice", e.target.value)} placeholder="Min $" className="input-field w-1/2" />
                  <input type="number" value={filters.maxPrice} onChange={(e) => handleFilterChange("maxPrice", e.target.value)} placeholder="Max $" className="input-field w-1/2" />
                </div>
                <div className="flex flex-col gap-2 justify-center">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={filters.featured === "true"} onChange={(e) => handleFilterChange("featured", e.target.checked ? "true" : "")} /> Featured</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={filters.onSale === "true"} onChange={(e) => handleFilterChange("onSale", e.target.checked ? "true" : "")} /> On Sale</label>
                </div>
              </div>
              <div className="mt-6 border-t border-neutral-200 dark:border-neutral-800 pt-4 flex justify-end">
                <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2"><X size={16} /> Clear Filters</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Products Grid --- */}
        {loading ? (
          <div className="min-h-[50vh] flex items-center justify-center"><HoloGridLoader /></div>
        ) : products.length > 0 ? (
          <>
            <motion.div
              layout
              className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "space-y-6"}
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
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-12">
                <Button variant="secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}>Prev</Button>
                <span className="p-2 text-sm">Page {currentPage} of {totalPages}</span>
                <Button variant="secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)}>Next</Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 min-h-[50vh] flex flex-col items-center justify-center">
             <h3 className="text-2xl font-bold mb-4">No Products Found</h3>
             <p className="text-neutral-500 mb-8">Your search returned no results. Try adjusting your filters.</p>
             <Button onClick={clearFilters} variant="primary">Clear Filters</Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products