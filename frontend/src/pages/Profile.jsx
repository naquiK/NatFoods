"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { api, addressAPI } from "../utils/api"
import Button from "../components/ui/Button"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import { Link } from "react-router-dom"

const Profile = () => {
  const { user, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  })
  const [newAddress, setNewAddress] = useState({
    contactName: "",
    contactPhone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    isDefault: false,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.put("/auth/profile", formData)
      await refreshProfile()
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-stone-700 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                  <p className="text-stone-300">{user?.email}</p>
                </div>
              </div>
              {(user?.isAdmin || user?.role) && (
                <Link to="/admin">
                  <Button className="bg-stone-800 hover:bg-stone-700">Admin Panel</Button>
                </Link>
              )}
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
              <button
                onClick={() => setActiveTab("addresses")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "addresses"
                    ? "border-stone-900 text-stone-900"
                    : "border-transparent text-stone-500 hover:text-stone-700"
                }`}
              >
                Addresses
              </button>
              {(user?.isAdmin || user?.role) && (
                <Link to="/admin">
                  <button
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "admin"
                        ? "border-stone-900 text-stone-900"
                        : "border-transparent text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    Admin Panel
                  </button>
                </Link>
              )}
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

            {activeTab === "addresses" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Address List */}
                <div>
                  <h2 className="text-xl font-semibold text-stone-900 mb-4">Saved Addresses</h2>
                  <div className="space-y-4">
                    {(user?.addresses || []).length === 0 && <p className="text-stone-600">No addresses added yet.</p>}
                    {(user?.addresses || []).map((addr) => (
                      <div
                        key={addr.id}
                        className="border border-stone-200 rounded-lg p-4 flex items-start justify-between"
                      >
                        <div className="text-sm text-stone-800">
                          <p className="font-medium">
                            {addr.contactName || "Contact"}{" "}
                            {addr.isDefault && (
                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                Default
                              </span>
                            )}
                          </p>
                          <p className="text-stone-600">{addr.contactPhone}</p>
                          <p className="text-stone-600">
                            {addr.street}, {addr.city}, {addr.state} {addr.zip}, {addr.country}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!addr.isDefault && (
                            <button
                              onClick={async () => {
                                await addressAPI.setDefault(addr.id)
                                await refreshProfile()
                              }}
                              className="text-xs px-3 py-1 rounded bg-stone-900 text-white hover:bg-stone-800"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              await addressAPI.remove(addr.id)
                              await refreshProfile()
                            }}
                            className="text-xs px-3 py-1 rounded bg-red-600 text-white hover:bg-red-500"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add New Address */}
                <div>
                  <h2 className="text-xl font-semibold text-stone-900 mb-4">Add New Address</h2>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault()
                      setLoading(true)
                      try {
                        await addressAPI.add(newAddress)
                        await refreshProfile()
                        setNewAddress({
                          contactName: "",
                          contactPhone: "",
                          street: "",
                          city: "",
                          state: "",
                          zip: "",
                          country: "",
                          isDefault: false,
                        })
                        alert("Address added!")
                      } catch (err) {
                        console.error("[v0] Add address error:", err)
                        alert("Failed to add address")
                      } finally {
                        setLoading(false)
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Contact Name</label>
                        <input
                          type="text"
                          value={newAddress.contactName}
                          onChange={(e) => setNewAddress({ ...newAddress, contactName: e.target.value })}
                          className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Contact Phone</label>
                        <input
                          type="tel"
                          value={newAddress.contactPhone}
                          onChange={(e) => setNewAddress({ ...newAddress, contactPhone: e.target.value })}
                          className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Street</label>
                        <input
                          type="text"
                          value={newAddress.street}
                          onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                          className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">City</label>
                        <input
                          type="text"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">State</label>
                        <input
                          type="text"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">ZIP</label>
                        <input
                          type="text"
                          value={newAddress.zip}
                          onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                          className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Country</label>
                        <input
                          type="text"
                          value={newAddress.country}
                          onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                          className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-stone-700">
                        <input
                          type="checkbox"
                          checked={newAddress.isDefault}
                          onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                        />
                        Set as default
                      </label>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={loading} className="bg-stone-900 hover:bg-stone-800">
                        {loading ? <LoadingSpinner size="sm" /> : "Add Address"}
                      </Button>
                    </div>
                  </form>
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
