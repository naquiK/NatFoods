// components/Header.jsx
"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ShoppingBag, User, Menu, X, Sun, Moon, LogOut } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"
import { useSettings } from "../../context/SettingsContext"
import { useTheme } from "../../context/ThemeContext"
import logo from "../../assets/WhatsApp Image 2025-09-29 at 20.09.08_1ed7565b.jpg"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)

  const { user, logout } = useAuth()
  const { cartItems } = useCart()
  const { settings } = useSettings()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  // --- LOGIC (Preserved from your original component) ---

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
    setIsSearchOpen(false)
  }, [location.pathname])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  // --- Animation Variants ---
  const mobileNavVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }
  const mobileLinkVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${
            isScrolled
              ? "bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800"
              : "bg-transparent"
          }`}
      >
        <div className="container-max mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* --- Logo --- */}
            <Link
              to="/"
              className="flex items-center gap-3 text-2xl font-bold font-serif text-neutral-800 dark:text-white"
            >
              <img
                src={settings?.logo?.url || logo}
                alt={settings?.siteName || "Nat-Organics"} 
                className="h-8 w-auto"
              />
              <span className="hidden sm:inline">{settings?.siteName || "Nat-Organics"}</span>
            </Link>

            {/* --- Desktop Navigation --- */}
            <nav className="hidden lg:flex items-center gap-4">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-neutral-900 dark:text-white"
                        : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                    }`}
                  >
                    {item.name}
                    {isActive && (
                      <motion.div
                        layoutId="active-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* --- Actions --- */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
              >
                <span className="sr-only">Search</span>
                <Search size={20} />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
              >
                <span className="sr-only">Toggle Theme</span>
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Link
                to="/cart"
                className="relative p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
              >
                <span className="sr-only">Cart</span>
                <ShoppingBag size={20} />
                {cartItemsCount > 0 && (
                  <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-primary-500" />
                )}
              </Link>
              {user ? (
                <Link
                  to="/profile"
                  className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  <span className="sr-only">Profile</span>
                  <User size={20} />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  <span className="sr-only">Login</span>
                  <User size={20} />
                </Link>
              )}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-2 -mr-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
              >
                <span className="sr-only">Open menu</span>
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* --- Search Modal --- */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSearchOpen(false)}
            className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-24 px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl"
            >
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-neutral-800 shadow-2xl py-5 pl-14 pr-6 text-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Mobile Menu --- */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-lg z-50 lg:hidden"
          >
            <div className="p-4 flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800 h-20">
              <Link to="/" className="text-xl font-bold font-serif">
                {settings?.siteName || "Nat-Organics"}
              </Link>
              <button onClick={() => setIsMenuOpen(false)} className="p-2">
                <X size={24} />
              </button>
            </div>
            <motion.nav variants={mobileNavVariants} initial="hidden" animate="visible" className="p-6 flex flex-col">
              {navigation.map((item) => (
                <motion.div variants={mobileLinkVariants} key={item.name}>
                  <Link to={item.href} className="block text-3xl font-semibold py-3">
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                variants={mobileLinkVariants}
                className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800 space-y-4"
              >
                {user ? (
                  <>
                    <Link to="/profile" className="flex items-center gap-4 text-xl">
                      <User /> My Account
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-4 text-xl">
                      <LogOut /> Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="flex items-center gap-4 text-xl">
                    <User /> Login / Sign Up
                  </Link>
                )}
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Header
