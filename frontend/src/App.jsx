"use client"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AnimatePresence } from "framer-motion"
import { ThemeProvider } from "./context/ThemeContext"
import EntryLoader from "./components/ui/EntryLoader"
import { useEffect, useState } from "react"
import TopBarProgress from "./components/ui/TopBarProgress"

// Layout Components
import Header from "./components/layout/Header"
import Footer from "./components/layout/Footer"

// Pages
import Home from "./pages/Home"
import Products from "./pages/Products"
import ProductDetail from "./pages/ProductDetail"
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout"
import Profile from "./pages/Profile"
import Login from "./pages/Login"
import Register from "./pages/Register"
import About from "./pages/About"
import Contact from "./pages/Contact"
import ForgotPassword from "./pages/ForgotPassword"
import VerifyResetOTP from "./pages/VerifyResetOTP"
import ResetPassword from "./pages/ResetPassword"
import VerifyOTP from "./pages/VerifyOTP"

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard"
import ProductManagement from "./pages/admin/ProductManagement"
import AdminOrders from "./pages/admin/Orders"
import AdminUsers from "./pages/admin/Users"
import SiteSettings from "./pages/admin/SiteSettings"
import Roles from "./pages/admin/Roles"

// Context Providers
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import { SettingsProvider } from "./context/SettingsContext"

// Route Guards
import ProtectedRoute from "./components/auth/ProtectedRoute"
import AdminRoute from "./components/auth/AdminRoute"

function App() {
  const [showEntry, setShowEntry] = useState(() => {
    try {
      return sessionStorage.getItem("entryShown") !== "1"
    } catch {
      return true
    }
  })

  useEffect(() => {
    if (!showEntry) return
    const t = setTimeout(() => {
      try {
        sessionStorage.setItem("entryShown", "1")
      } catch {}
      setShowEntry(false)
    }, 1500)
    return () => clearTimeout(t)
  }, [showEntry])

  return (
    <AuthProvider>
      <SettingsProvider>
        <CartProvider>
          <ThemeProvider>
            <Router>
              <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-fg)]">
                {showEntry && <EntryLoader onDone={() => setShowEntry(false)} />}
                <TopBarProgress />
                <Header />

                <main className="flex-1">
                  <AnimatePresence mode="wait">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/products/:id" element={<ProductDetail />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/verify-otp" element={<VerifyOTP />} />

                      {/* Protected Routes */}
                      <Route
                        path="/cart"
                        element={
                          <ProtectedRoute>
                            <Cart />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/checkout"
                        element={
                          <ProtectedRoute>
                            <Checkout />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        }
                      />

                      {/* Admin Routes */}
                      <Route
                        path="/admin"
                        element={
                          <AdminRoute>
                            <AdminDashboard />
                          </AdminRoute>
                        }
                      />
                      <Route
                        path="/admin/products"
                        element={
                          <AdminRoute>
                            <ProductManagement />
                          </AdminRoute>
                        }
                      />
                      <Route
                        path="/admin/orders"
                        element={
                          <AdminRoute>
                            <AdminOrders />
                          </AdminRoute>
                        }
                      />
                      <Route
                        path="/admin/users"
                        element={
                          <AdminRoute>
                            <AdminUsers />
                          </AdminRoute>
                        }
                      />
                      <Route
                        path="/admin/customers"
                        element={
                          <AdminRoute>
                            <AdminUsers />
                          </AdminRoute>
                        }
                      />
                      <Route
                        path="/admin/roles"
                        element={
                          <AdminRoute>
                            {/*
                              Roles page to manage role CRUD and permissions.
                              Uses fine-grained PermissionRoute inside the page.
                            */}
                            <Roles />
                          </AdminRoute>
                        }
                      />
                      <Route
                        path="/admin/settings"
                        element={
                          <AdminRoute>
                            <SiteSettings />
                          </AdminRoute>
                        }
                      />
                    </Routes>
                  </AnimatePresence>
                </main>

                <Footer />
              </div>

              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#1a1a18",
                    color: "#fafaf9",
                    border: "1px solid #3a3a34",
                    borderRadius: "0",
                    fontSize: "14px",
                    fontWeight: "500",
                  },
                  success: {
                    iconTheme: {
                      primary: "#8b7355",
                      secondary: "#fafaf9",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "#ed7a2a",
                      secondary: "#fafaf9",
                    },
                  },
                }}
              />
            </Router>
          </ThemeProvider>
        </CartProvider>
      </SettingsProvider>
    </AuthProvider>
  )
}

export default App
