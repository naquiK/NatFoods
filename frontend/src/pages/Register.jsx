"use client"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Eye, EyeOff, Sparkles, UserPlus, Mail, Phone, Lock } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import Button from "../components/ui/Button"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/")
    }
  }, [isAuthenticated, navigate])

  const validateForm = () => {
    const newErrors = {}

    if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }
    setLoading(true)
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
    })
    if (result.success && result.userId) {
      navigate("/verify-otp", { state: { userId: result.userId } })
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      })
    }
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-800 flex items-center justify-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-36 h-36 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 left-20 w-44 h-44 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full opacity-20 blur-xl animate-pulse delay-500"></div>
        <div className="absolute top-1/3 left-1/3 w-52 h-52 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-10 blur-2xl"></div>
      </div>

      <div className="section-padding py-12 w-full relative z-10">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-2xl"
          >
            {/* Header with icon */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-4"
              >
                <UserPlus className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Create Account
              </h1>
              <p className="text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                Join us and start your journey
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4 text-purple-500" />
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.name ? "border-red-400" : "border-gray-200 dark:border-gray-600"} bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 placeholder-gray-400`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-indigo-500" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.email ? "border-red-400" : "border-gray-200 dark:border-gray-600"} bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 placeholder-gray-400`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-teal-500" />
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-200 placeholder-gray-400"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-pink-500" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 ${errors.password ? "border-red-400" : "border-gray-200 dark:border-gray-600"} bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all duration-200 placeholder-gray-400`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-pink-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-orange-500" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 ${errors.confirmPassword ? "border-red-400" : "border-gray-200 dark:border-gray-600"} bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-200 placeholder-gray-400`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-600 transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 mt-1"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                size="large"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600 dark:text-gray-300">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-purple-600 hover:text-purple-800 font-semibold transition-colors duration-200"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60"></div>
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full opacity-60"></div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Register
