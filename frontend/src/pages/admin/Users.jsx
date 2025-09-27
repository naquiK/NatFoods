"use client"

import { useState, useEffect } from "react"
import { api } from "../../utils/api"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import Button from "../../components/ui/Button"

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get("/admin/users")
      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}`, { isActive: !isActive })
      fetchUsers()
    } catch (error) {
      console.error("Error updating user status:", error)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900">Customer Management</h1>
          <p className="text-stone-600 mt-2">Manage your customers and their accounts</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-stone-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-stone-700">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-stone-900">{user.name}</div>
                          <div className="text-sm text-stone-500">ID: {user._id.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {user.role !== "admin" && (
                        <Button
                          onClick={() => toggleUserStatus(user._id, user.isActive)}
                          variant="outline"
                          size="sm"
                          className={
                            user.isActive
                              ? "text-red-600 border-red-200 hover:bg-red-50"
                              : "text-green-600 border-green-200 hover:bg-green-50"
                          }
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {users.length === 0 && (
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <p className="text-stone-600">No customers found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Users
