"use client"
import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem("token"))

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common["Authorization"]
    }
  }, [token])

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/profile`)
          setUser(response.data)
        } catch (error) {
          console.error("Auth check failed:", error)
          logout()
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [token])

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email,
        password,
      })

      const { token: newToken, user: userData } = response.data

      setToken(newToken)
      setUser(userData)
      localStorage.setItem("token", newToken)

      toast.success("Login successful!")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed"
      toast.error(message)
      return { success: false, message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, userData)
      // Do NOT set token or user here
      toast.success("OTP sent successfully!")
      // Return userId for navigation
      return { success: true, userId: response.data.data.id }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed"
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    toast.success("Logged out successfully")
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/profile`, profileData)
      setUser(response.data.user)
      toast.success("Profile updated successfully!")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Profile update failed"
      toast.error(message)
      return { success: false, message }
    }
  }

  const refreshProfile = async () => {
    if (!token) return
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/profile`)
    setUser(response.data)
    return response.data
  }

  const hasPermission = (resource, action = "view") => {
    try {
      if (user?.isAdmin === true) return true

      const perms = user?.role?.permissions || user?.permissions
      if (!perms) return false
      return perms?.[resource]?.[action] === true
    } catch {
      return false
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin === true || user?.roleName === "Admin",
    isModerator:
      user?.roleName === "Moderator" ||
      (user?.permissions && user.permissions.dashboard && user.permissions.dashboard.view === true),
    isStaff:
      user?.isAdmin === true ||
      user?.roleName === "Admin" ||
      user?.roleName === "Moderator" ||
      (user?.permissions && user.permissions.dashboard && user.permissions.dashboard.view === true),
    hasPermission, // expose fine-grained permission check
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
