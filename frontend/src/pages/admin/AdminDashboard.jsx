"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { useSettings } from "../../context/SettingsContext"
import { api } from "../../utils/api"
import LoadingSpinner from "../../components/ui/LoadingSpinner"

const AdminDashboard = () => {
  const { user } = useAuth()
  const { settings } = useSettings()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([api.get("/admin/stats"), api.get("/admin/orders/recent")])
      setStats(statsRes.data)
      setRecentOrders(ordersRes.data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Welcome back, {user?.name}</h1>
          <p className="text-stone-600">Manage your {settings?.siteName || "eKart"} store</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600">Total Revenue</p>
                <p className="text-2xl font-bold text-stone-900">${stats?.totalRevenue?.toLocaleString() || "0"}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-emerald-600 font-medium">
                +{stats?.revenueGrowth || 0}% from last month
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600">Total Orders</p>
                <p className="text-2xl font-bold text-stone-900">{stats?.totalOrders?.toLocaleString() || "0"}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-blue-600 font-medium">+{stats?.ordersGrowth || 0}% from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600">Total Products</p>
                <p className="text-2xl font-bold text-stone-900">{stats?.totalProducts?.toLocaleString() || "0"}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-purple-600 font-medium">{stats?.lowStockProducts || 0} low stock</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600">Total Customers</p>
                <p className="text-2xl font-bold text-stone-900">{stats?.totalCustomers?.toLocaleString() || "0"}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-orange-600 font-medium">
                +{stats?.customersGrowth || 0}% from last month
              </span>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-200">
            <h2 className="text-lg font-semibold text-stone-900">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-200">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-stone-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">
                      #{order._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900">
                      {order.user?.name || "Guest"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900">${order.totalAmount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "shipped"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "processing"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-stone-100 text-stone-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
