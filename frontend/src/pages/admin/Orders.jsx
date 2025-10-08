"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "../../utils/api"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import Button from "../../components/ui/Button"
import { Link } from "react-router-dom"

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await adminAPI.getOrders()
      setOrders(response.data.orders || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      await adminAPI.updateOrderStatus(orderId, status)
      fetchOrders()
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true
    return order.status === filter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400"
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400"
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400"
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-emerald-500/10 dark:text-emerald-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400"
      default:
        return "bg-stone-100 text-stone-800 dark:bg-zinc-700/50 dark:text-zinc-300"
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-stone-900 dark:text-white">Order Management</h1>
          <div className="flex flex-wrap gap-2">
            {["all", "pending", "processing", "shipped", "delivered"].map((status) => (
              <Button
                key={status}
                onClick={() => setFilter(status)}
                variant={filter === status ? "default" : "outline"}
                size="sm"
                className={
                  filter === status
                    ? "bg-stone-900 hover:bg-stone-800 dark:bg-white dark:text-zinc-900"
                    : "dark:border-zinc-700 dark:text-zinc-300"
                }
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-xl shadow-sm border border-stone-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200 dark:divide-zinc-800">
              <thead className="bg-stone-50 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-stone-200 dark:divide-zinc-800">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900 dark:text-white">
                      #{order._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-stone-900 dark:text-white">
                          {order.userId?.name || order.user?.name || "Guest"}
                        </div>
                        <div className="text-sm text-stone-500 dark:text-zinc-400">
                          {order.userId?.email || order.user?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900 dark:text-zinc-200">
                      {order.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900 dark:text-zinc-100">
                      ₹{Number(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700 dark:text-zinc-300 max-w-[240px]">
                      <div className="truncate">
                        {(order.shippingAddress?.address || "") +
                          (order.shippingAddress?.city ? `, ${order.shippingAddress.city}` : "") +
                          (order.shippingAddress?.postalCode ? ` ${order.shippingAddress.postalCode}` : "")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-2">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="text-sm border border-stone-300 rounded px-2 py-1 hover:bg-stone-50 dark:border-zinc-700"
                      >
                        Details
                      </Link>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="text-sm border border-stone-300 dark:border-zinc-700 rounded px-2 py-1 focus:ring-2 focus:ring-stone-500 dark:focus:ring-zinc-400 focus:border-transparent bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-stone-400 dark:text-zinc-500 mx-auto mb-4"
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
            <p className="text-stone-600 dark:text-zinc-400">No orders found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
