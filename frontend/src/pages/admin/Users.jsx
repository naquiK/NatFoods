"use client"

import { useState, useEffect } from "react"
import { api } from "../../utils/api"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import Button from "../../components/ui/Button"
import PermissionRoute from "../../components/auth/PermissionRoute"
import { useAuth } from "../../context/AuthContext"

const Users = () => {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([]) // roles list
  const [loading, setLoading] = useState(true)
  const { hasPermission } = useAuth()

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get("/api/admin/users")
      setUsers(response.data.users || response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const res = await api.get("/api/roles")
      setRoles(res.data.roles || [])
    } catch (e) {
      console.error("Error fetching roles:", e)
    }
  }

  const toggleUserStatus = async (userId, isActive) => {
    try {
      await api.put(`/api/admin/users/${userId}`, { isActive: !isActive })
      fetchUsers()
    } catch (error) {
      console.error("Error updating user status:", error)
    }
  }

  const assignRole = async (userId, roleId) => {
    try {
      await api.post("/api/roles/assign", { userId, roleId })
      fetchUsers()
    } catch (e) {
      console.error("Error assigning role:", e)
    }
  }

  const unassignRole = async (userId) => {
    try {
      await api.post("/api/roles/unassign", { userId })
      fetchUsers()
    } catch (e) {
      console.error("Error unassigning role:", e)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <PermissionRoute resource="users" action="view">
      <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-stone-900 dark:text-white">Customer Management</h1>
            <p className="text-stone-600 dark:text-zinc-400 mt-2">Manage your customers and their accounts</p>
          </div>

          <div className="rounded-xl shadow-sm border border-stone-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-200 dark:divide-zinc-800">
                <thead className="bg-stone-50 dark:bg-zinc-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                      Assign Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-stone-200 dark:divide-zinc-800">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-stone-200 dark:bg-zinc-700 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-stone-700 dark:text-zinc-100">
                              {user.name?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-stone-900 dark:text-white">{user.name}</div>
                            <div className="text-sm text-stone-500 dark:text-zinc-400">ID: {user._id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900 dark:text-zinc-100">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role?.name === "Admin"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400"
                              : user.role?.name
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400"
                                : "bg-stone-200 text-stone-800 dark:bg-zinc-700/50 dark:text-zinc-300"
                          }`}
                        >
                          {user.role?.name || (user.isAdmin ? "Admin" : "None")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {hasPermission("roles", "update") ? (
                          <div className="flex items-center gap-2">
                            <select
                              className="px-2 py-1 border rounded bg-white dark:bg-zinc-900 border-stone-300 dark:border-zinc-700 text-stone-900 dark:text-zinc-100"
                              value={user.role?._id || ""}
                              onChange={(e) => assignRole(user._id, e.target.value)}
                            >
                              <option value="">{user.role ? "Change role" : "Select role"}</option>
                              {roles.map((r) => (
                                <option key={r._id} value={r._id}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                            {user.role && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/20 bg-transparent"
                                onClick={() => unassignRole(user._id)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        ) : (
                          <span className="text-stone-500 dark:text-zinc-400 text-sm">No permission</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive
                              ? "bg-green-100 text-green-800 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-zinc-400">
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
                                ? "text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/20"
                                : "text-green-600 border-green-200 hover:bg-green-50 dark:text-emerald-400 dark:border-emerald-900/50 dark:hover:bg-emerald-900/20"
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
                className="w-16 h-16 text-stone-400 dark:text-zinc-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1"
                />
              </svg>
              <p className="text-stone-600 dark:text-zinc-400">No customers found</p>
            </div>
          )}
        </div>
      </div>
    </PermissionRoute>
  )
}

export default Users
