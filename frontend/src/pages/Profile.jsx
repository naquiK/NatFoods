"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { api, addressAPI, ordersAPI, profileAPI } from "../utils/api"
import Button from "../components/ui/Button"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import { Link } from "react-router-dom"

// --- Helper Icon Components ---
const UserIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z"
      clipRule="evenodd"
    />
  </svg>
)
const CubeIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="m2.695 7.184 6.32-3.226a2.25 2.25 0 0 1 2.035 0l6.32 3.226a2.25 2.25 0 0 1 1.255 2.033v5.566a2.25 2.25 0 0 1-1.255 2.033l-6.32 3.226a2.25 2.25 0 0 1-2.035 0L2.695 16.816a2.25 2.25 0 0 1-1.255-2.033V9.217a2.25 2.25 0 0 1 1.255-2.033Z" />
  </svg>
)
const MapPinIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path
      fillRule="evenodd"
      d="m9.69 18.933.003.001a9.7 9.7 0 0 1 3.472-1.952 1.637 1.637 0 0 0 1.152-.693 28.164 28.164 0 0 0 1.258-2.531 2.25 2.25 0 0 0-.25-2.285l-.252-.284A12.001 12.001 0 0 0 10 2.5c-2.43 0-4.685.84-6.455 2.285l-.252.284a2.25 2.25 0 0 0-.25 2.285c.373.85.767 1.696 1.258 2.531a1.637 1.637 0 0 0 1.152.693 9.7 9.7 0 0 1 3.472 1.952l.003-.001Z"
      clipRule="evenodd"
    />
  </svg>
)

const Profile = () => {
  const { user, refreshProfile, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
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
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersPage, setOrdersPage] = useState(1)
  const [ordersTotalPages, setOrdersTotalPages] = useState(1)
  const [picUploading, setPicUploading] = useState(false)

  const getProfileImageSrc = (userObj) => {
    if (!userObj) return "/placeholder-user.jpg"
    const p = userObj.profilePicture || userObj.profilePic || userObj.profile
    if (!p) return "/placeholder-user.jpg"
    if (typeof p === "string") return p
    return p.url || p.secure_url || p.path || "/placeholder-user.jpg"
  }

  // All logic functions (downloadInvoice, useEffect, handleSubmit, etc.) remain unchanged.
  // ... (Keep all your existing logic functions here)
  const downloadInvoice = async (orderId) => {
    try {
      const res = await ordersAPI.downloadInvoice(orderId)
      const blob = new Blob([res.data], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `invoice-${orderId}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      alert("Failed to download invoice.")
    }
  }

  const handleUploadPic = async (file) => {
    try {
      setPicUploading(true)
      await profileAPI.uploadPicture(file)
      await refreshProfile()
      alert("Profile picture updated!")
    } catch {
      alert("Failed to upload profile picture.")
    } finally {
      setPicUploading(false)
    }
  }

  useEffect(() => {
    if (activeTab !== "orders") return
    let isMounted = true
    ;(async () => {
      setOrdersLoading(true)
      try {
        const res = await ordersAPI.list({ page: ordersPage, limit: 10 })
        if (isMounted) {
          setOrders(res.data.orders || [])
          setOrdersTotalPages(res.data.totalPages || 1)
        }
      } catch (err) {
        console.error("Fetch orders error:", err)
      } finally {
        if (isMounted) setOrdersLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [activeTab, ordersPage])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put("/api/auth/profile-update", formData)
      await refreshProfile()
      alert("Profile updated successfully!")
    } catch {
      alert("Failed to update profile.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleAddAddress = async (e) => {
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
    } catch {
      alert("Failed to add address.")
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileContent />
      case "orders":
        return <OrdersContent />
      case "addresses":
        return <AddressesContent />
      default:
        return null
    }
  }

  const InputField = ({ label, ...props }) => (
    <div>
      <label className="block text-sm font-medium text-secondary mb-2">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-primary focus:ring-2 focus:ring-ring focus:border-accent transition"
      />
    </div>
  )

  const ProfileContent = () => (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">Account Settings</h2>
          <p className="text-text-muted">Update your profile information.</p>
        </div>
        <button onClick={logout} className="px-3 py-1.5 rounded border border-border text-sm hover:bg-muted">
          Logout
        </button>
      </div>
      {/* Change profile picture */}
      <div className="flex items-center gap-4 mb-6">
        <img src={getProfileImageSrc(user)}
          alt="Profile"
          className="w-16 h-16 rounded-full object-cover border border-border"
          onError={(e) => {
            if (e?.currentTarget) e.currentTarget.src = "/placeholder-user.jpg"
          }}
        />
        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border cursor-pointer hover:bg-muted">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleUploadPic(e.target.files[0])}
          />
          {picUploading ? "Uploading..." : "Change Photo"}
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} />
          <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} />
          <InputField label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
        </div>
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-accent hover:bg-accent/90 text-accent-foreground !px-6 !py-2.5"
          >
            {loading ? <LoadingSpinner size="sm" /> : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )

  const OrdersContent = () => (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-primary mb-1">Order History</h2>
      <p className="text-text-muted mb-8">Review your past and current orders.</p>
      {ordersLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 px-6 bg-muted rounded-xl">
          <CubeIcon className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-secondary font-semibold">No Orders Found</p>
          <p className="text-sm text-text-muted mt-1">Start shopping to see your orders here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="p-4 bg-foreground border border-border rounded-lg transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-primary">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-text-muted">Placed: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-sm text-secondary">
                  <p>Items: {order.items?.length || 0}</p>
                  <p>Total: ₹{Number(order.totalAmount).toFixed(2)}</p>
                </div>
                <p className="capitalize text-sm font-semibold text-primary">{order.status}</p>
                <div className="flex gap-2">
                  <Link
                    to={`/orders/${order._id}`}
                    className="px-3 py-2 text-sm rounded-md bg-muted text-secondary hover:bg-border"
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => downloadInvoice(order._id)}
                    className="px-3 py-2 text-sm rounded-md bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    Invoice
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const AddressesContent = () => (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-primary mb-1">Shipping Addresses</h2>
      <p className="text-text-muted mb-8">Manage your saved delivery locations.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-foreground border border-border rounded-xl">
          <h3 className="text-lg font-semibold text-primary mb-4">Add New Address</h3>
          <form onSubmit={handleAddAddress} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Contact Name"
                value={newAddress.contactName}
                onChange={(e) => setNewAddress({ ...newAddress, contactName: e.target.value })}
                required
              />
              <InputField
                label="Contact Phone"
                type="tel"
                value={newAddress.contactPhone}
                onChange={(e) => setNewAddress({ ...newAddress, contactPhone: e.target.value })}
                required
              />
            </div>
            <InputField
              label="Street Address"
              value={newAddress.street}
              onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="City"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                required
              />
              <InputField
                label="State"
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                required
              />
            </div>
            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="bg-accent hover:bg-accent/90 w-full !py-2.5 text-accent-foreground"
              >
                {loading ? <LoadingSpinner size="sm" /> : "Save Address"}
              </Button>
            </div>
          </form>
        </div>
        <div className="space-y-4">
          {(user?.addresses || []).length === 0 && (
            <p className="text-text-muted text-center pt-16">No addresses have been added yet.</p>
          )}
          {(user?.addresses || []).map((addr) => (
            <div
              key={addr.id}
              className="p-4 bg-foreground border border-border rounded-xl flex items-start justify-between"
            >
              <div className="text-sm">
                <p className="font-semibold text-primary flex items-center">
                  {addr.contactName}
                  {addr.isDefault && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">
                      Default
                    </span>
                  )}
                </p>
                <p className="text-text-muted mt-1">
                  {addr.street}, {addr.city}, {addr.zip}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 text-xs font-semibold">
                {!addr.isDefault && (
                  <button
                    onClick={async () => {
                      await addressAPI.setDefault(addr.id)
                      await refreshProfile()
                    }}
                    className="px-2 py-1 rounded bg-muted hover:bg-border text-secondary"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={async () => {
                    await addressAPI.remove(addr.id)
                    await refreshProfile()
                  }}
                  className="px-2 py-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const NavTab = ({ tabName, icon, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors duration-200 ${
        activeTab === tabName ? "border-accent text-accent" : "border-transparent text-text-muted hover:text-secondary"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )

  return (
    <div className="min-h-screen bg-background text-primary py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header Card */}
        <div className="bg-foreground rounded-xl shadow-sm border border-border overflow-hidden mb-8">
          <div className="p-6 md:p-8 bg-gradient-to-r from-muted/50 to-transparent">
            <div className="flex items-center space-x-5">
              <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-3xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-primary">{user?.name}</h1>
                <p className="text-text-muted">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex border-t border-border">
            <NavTab tabName="profile" label="Profile" icon={<UserIcon className="w-5 h-5" />} />
            <NavTab tabName="orders" label="Orders" icon={<CubeIcon className="w-5 h-5" />} />
            <NavTab tabName="addresses" label="Addresses" icon={<MapPinIcon className="w-5 h-5" />} />
          </nav>
        </div>

        {/* Content Area */}
        <div className="bg-foreground rounded-xl shadow-sm border border-border p-6 md:p-8">{renderContent()}</div>
      </div>
    </div>
  )
}

export default Profile
