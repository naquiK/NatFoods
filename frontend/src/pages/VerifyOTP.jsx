"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "react-hot-toast"
import { Shield, ArrowLeft, RotateCcw } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import api from "../utils/api"

const VerifyOTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const userId = location.state?.userId

  useEffect(() => {
    if (!userId) {
      navigate("/register")
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [userId, navigate])

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpString = otp.join("")

    if (otpString.length !== 6) {
      toast.error("Please enter complete OTP")
      return
    }

    setLoading(true)
    try {
      const response = await api.post(`/auth/verify-otp/${userId}`, {
        otp: otpString,
      })
      toast.success(response.data.message)
      login(response.data.token, response.data.user)
      navigate("/")
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    try {
      await api.post(`/auth/resend-otp/${userId}`)
      toast.success("New OTP sent to your email")
      setTimeLeft(600)
      setOtp(["", "", "", "", "", ""])
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP")
    } finally {
      setResendLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-violet-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-600">Enter the 6-digit code sent to your email</p>
          </div>

          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  maxLength={1}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Code expires in: <span className="font-semibold text-violet-600">{formatTime(timeLeft)}</span>
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || timeLeft === 0}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
              ) : (
                "Verify Email"
              )}
            </motion.button>
          </form>

          {/* Resend */}
          <div className="mt-6 text-center space-y-4">
            <button
              onClick={handleResend}
              disabled={resendLoading || timeLeft > 0}
              className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              {resendLoading ? "Sending..." : "Resend Code"}
            </button>

            <div>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-700 font-medium transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Register
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default VerifyOTP
