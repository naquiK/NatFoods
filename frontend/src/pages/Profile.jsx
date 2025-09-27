"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { api } from "../utils/api"
import Button from "../components/ui/Button"
import LoadingSpinner from "../components/ui/LoadingSpinner"

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.put("/auth/profile", formData)
      updateUser(response.data.user)
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-stone-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-stone-900 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-stone-700 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                <p className="text-stone-300">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-stone-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "profile"
                    ? "border-stone-900 text-stone-900"
                    : "border-transparent text-stone-500 hover:text-stone-700"
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "orders"
                    ? "border-stone-900 text-stone-900"
                    : "border-transparent text-stone-500 hover:text-stone-700"
                }`}
              >
                Order History
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "profile" && (
              <div>
                <h2 className="text-xl font-semibold text-stone-900 mb-6">Profile Information</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading} className="bg-stone-900 hover:bg-stone-800">
                      {loading ? <LoadingSpinner size="sm" /> : "Update Profile"}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                <h2 className="text-xl font-semibold text-stone-900 mb-6">Order History</h2>
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 text-stone-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <p className="text-stone-600">No orders found</p>
                  <p className="text-sm text-stone-500 mt-2">Start shopping to see your orders here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
