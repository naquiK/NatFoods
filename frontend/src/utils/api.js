import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// API endpoints
export const authAPI = {
  login: (credentials) => api.post("/api/auth/login", credentials),
  register: (userData) => api.post("/api/auth/register", userData),
  getProfile: () => api.get("/api/auth/profile"),
  updateProfile: (data) => api.put("/api/auth/profile", data),
}

export const addressAPI = {
  add: (data) => api.post("/api/auth/addresses", data),
  update: (id, data) => api.put(`/api/auth/addresses/${id}`, data),
  remove: (id) => api.delete(`/api/auth/addresses/${id}`),
  setDefault: (id) => api.put(`/api/auth/addresses/${id}/default`),
}

export const productsAPI = {
  getAll: (params) => api.get("/api/products", { params }),
  getById: (id) => api.get(`/api/products/${id}`),
  getFeatured: () => api.get("/api/products/featured/list"),
  getOnSale: () => api.get("/api/products/sale/list"),
  getCategories: () => api.get("/api/products/categories/list"),
  getBrands: () => api.get("/api/products/brands/list"),
  addReview: (id, review) => api.post(`/api/products/${id}/reviews`, review),
}

export const adminAPI = {
  getStats: () => api.get("/api/admin/stats"),
  getProducts: (params) => api.get("/api/products", { params }),
  createProduct: (data) => api.post("/api/admin/products", data),
  updateProduct: (id, data) => api.put(`/api/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/api/admin/products/${id}`),
  getUsers: (params) => api.get("/api/admin/users", { params }),
  getOrders: (params) => api.get("/api/admin/orders", { params }),
  updateOrderStatus: (id, status) => api.put(`/api/admin/orders/${id}/status`, { status }),
}

export const settingsAPI = {
  get: () => api.get("/api/settings"),
  update: (data) => api.put("/api/settings", data),
  uploadLogo: (file) => {
    const formData = new FormData()
    formData.append("logo", file)
    return api.post("/api/settings/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
}

export { api }
export default api
