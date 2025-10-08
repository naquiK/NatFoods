"use client"

import { useEffect, useState } from "react"
import PermissionRoute from "../../components/auth/PermissionRoute"
import AdminLayout from "../../components/admin/AdminLayout"
import { api } from "../../utils/api"
import Button from "../../components/ui/Button"
import LoadingSpinner from "../../components/ui/LoadingSpinner"

const PERMISSIONS = {
  products: ["view", "create", "update", "delete"],
  orders: ["view", "update", "delete"],
  users: ["view", "update", "delete"],
  roles: ["view", "create", "update", "delete"],
  settings: ["view", "update"],
  dashboard: ["view"],
  custom: ["view", "create", "update", "delete"],
}

const Roles = () => {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: "", description: "" })
  const [saving, setSaving] = useState(false)
  const [permDraft, setPermDraft] = useState({})
  const [customResourceName, setCustomResourceName] = useState("custom")

  const loadRoles = async () => {
    try {
      const res = await api.get("/api/roles")
      setRoles(res.data.roles || [])
    } catch (e) {
      console.error("Error loading roles:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoles()
  }, [])

  const togglePerm = (resource, action) => {
    setPermDraft((p) => ({
      ...p,
      [resource]: { ...(p[resource] || {}), [action]: !(p[resource]?.[action] === true) },
    }))
  }

  const createRole = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post("/api/roles", {
        ...form,
        permissions: permDraft,
      })
      setForm({ name: "", description: "" })
      setPermDraft({})
      await loadRoles()
    } catch (e) {
      console.error("Error creating role:", e)
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (role) => {
    try {
      await api.put(`/api/roles/${role._id}`, { isActive: !role.isActive })
      await loadRoles()
    } catch (e) {
      console.error("Error toggling role:", e)
    }
  }

  const removeRole = async (role) => {
    try {
      await api.delete(`/api/roles/${role._id}`)
      await loadRoles()
    } catch (e) {
      console.error("Error deleting role:", e)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <PermissionRoute resource="roles" action="view">
        <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 py-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-stone-900 dark:text-white">Roles</h1>
              <p className="text-stone-600 dark:text-zinc-400 mt-2">
                Create, activate/deactivate, and manage role permissions.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Create Role */}
              <form
                onSubmit={createRole}
                className="rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4"
              >
                <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Create Role</h2>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-1">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 rounded border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 focus:ring-2 focus:ring-stone-500 dark:focus:ring-zinc-400"
                    placeholder="e.g., Manager"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 rounded border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 focus:ring-2 focus:ring-stone-500 dark:focus:ring-zinc-400"
                    placeholder="What permissions this role should have"
                  />
                </div>

                <div className="space-y-4">
                  {Object.entries(PERMISSIONS).map(([resource, actions]) => (
                    <div key={resource} className="border rounded-lg p-3 dark:border-zinc-700">
                      <div className="font-semibold mb-2 capitalize">
                        {resource === "custom" ? customResourceName : resource}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {actions.map((act) => (
                          <label key={act} className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={!!permDraft[resource]?.[act]}
                              onChange={() => togglePerm(resource, act)}
                            />
                            <span className="text-sm capitalize">{act}</span>
                          </label>
                        ))}
                      </div>
                      {resource === "custom" && (
                        <div className="mt-2">
                          <input
                            value={customResourceName}
                            onChange={(e) => setCustomResourceName(e.target.value)}
                            className="px-3 py-1 rounded border dark:border-zinc-700 bg-transparent"
                            aria-label="Custom resource name"
                          />
                          <p className="text-xs text-stone-500 mt-1">This is the "Other" resource admins can assign.</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-stone-900 hover:bg-stone-800 dark:bg-white dark:text-zinc-900"
                >
                  {saving ? "Saving..." : "Create Role"}
                </Button>
              </form>

              {/* Roles List */}
              <div className="lg:col-span-2 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-stone-200 dark:divide-zinc-800">
                    <thead className="bg-stone-50 dark:bg-zinc-900/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 dark:divide-zinc-800">
                      {roles.map((r) => (
                        <tr key={r._id} className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                          <td className="px-6 py-4 text-sm font-medium text-stone-900 dark:text-white">{r.name}</td>
                          <td className="px-6 py-4 text-sm text-stone-600 dark:text-zinc-300">
                            {r.description || "-"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${r.isActive ? "bg-green-100 text-green-800 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400"}`}
                            >
                              {r.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="dark:border-zinc-700 dark:text-zinc-200 bg-transparent"
                                onClick={() => toggleActive(r)}
                              >
                                {r.isActive ? "Deactivate" : "Activate"}
                              </Button>
                              {!r.isSystem && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/20 bg-transparent"
                                  onClick={() => removeRole(r)}
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {roles.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-stone-600 dark:text-zinc-400">
                            No roles found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PermissionRoute>
    </AdminLayout>
  )
}

export default Roles
