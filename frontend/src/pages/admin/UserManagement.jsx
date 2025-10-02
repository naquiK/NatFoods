import { useState, useEffect } from "react"
import axios from "axios"
import { Plus, Edit, Trash } from "lucide-react"

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "", isActive: true })

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const usersResponse = await axios.get("/api/users")
      setUsers(usersResponse.data.users)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
    setIsLoading(false)
  }

  const fetchRoles = async () => {
    try {
      const rolesResponse = await axios.get("/api/roles")
      setRoles(rolesResponse.data.roles)
    } catch (error) {
      console.error("Error fetching roles:", error)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const openModalForCreate = () => {
    setIsEditing(false)
    setCurrentUser(null)
    setFormData({ name: "", email: "", password: "", role: "", isActive: true })
    setIsModalOpen(true)
  }

  const openModalForEdit = (user) => {
    setIsEditing(true)
    setCurrentUser(user)
    setFormData({ 
      name: user.name, 
      email: user.email, 
      password: "", // Password should not be pre-filled
      role: user.role?._id || "",
      isActive: user.isActive
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const dataToSend = { ...formData };
    if (isEditing && !dataToSend.password) {
      delete dataToSend.password; // Don't send empty password on update
    }

    try {
      if (isEditing) {
        await axios.put(`/api/users/${currentUser._id}`, dataToSend)
      } else {
        await axios.post("/api/users", dataToSend)
      }
      fetchUsers()
      closeModal()
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} user:`, error)
      // Optionally, show an error message to the user
    }
  }

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`/api/users/${userId}`)
        fetchUsers()
      } catch (error) {
        console.error("Error deleting user:", error)
      }
    }
  }

  if (isLoading) {
    return <div>Loading users...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <button onClick={openModalForCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          <Plus size={20} className="mr-2" />
          Add New User
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
             {/* Table headers */}
             <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Created At</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.role?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openModalForEdit(user)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-600">
                    <Edit size={20} />
                  </button>
                  <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-600 ml-4">
                    <Trash size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{isEditing ? "Edit User" : "Create User"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md shadow-sm" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full rounded-md shadow-sm" required />
              </div>
              {!isEditing && (
                 <div className="mb-4">
                   <label className="block text-sm font-medium">Password</label>
                   <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="mt-1 block w-full rounded-md shadow-sm" required />
                 </div>
              )}
              <div className="mb-6">
                <label className="block text-sm font-medium">Role</label>
                <select name="role" value={formData.role} onChange={handleInputChange} className="mt-1 block w-full rounded-md shadow-sm" required>
                  <option value="">Select a role</option>
                  {roles.map(role => (
                    <option key={role._id} value={role._id}>{role.name}</option>
                  ))}
                </select>
              </div>
              {isEditing && (
                <div className="mb-6 flex items-center">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="h-4 w-4 rounded" />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Active</label>
                </div>
              )}
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">{isEditing ? "Save Changes" : "Create User"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
