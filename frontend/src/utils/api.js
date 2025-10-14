import axios from "axios"

// Robust API base URL resolution for Next & Vite and default to 5000
const RESOLVE_NEXT_PUBLIC =
  typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : undefined
const RESOLVE_VITE =
  typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : undefined

// v0 dev safeguard: if base is localhost:3000 (frontend), prefer same-origin
const deriveDevBase = () => {
  if (typeof window !== "undefined") {
    const envBase = RESOLVE_NEXT_PUBLIC || RESOLVE_VITE
    // Prefer same-origin when no explicit env is provided (works with dev proxy/rewrite)
    if (!envBase) return window.location.origin
    return envBase
  }
  return RESOLVE_NEXT_PUBLIC || RESOLVE_VITE || ""
}

const API_BASE_URL = deriveDevBase()
console.log("[v0] API_BASE_URL:", API_BASE_URL) // debug: remove after verifying

// Export API_BASE_URL and document env usage
export const BASE_URL = API_BASE_URL

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
  updateOrderStatus: (id, status, reason) => api.put(`/api/admin/orders/${id}/status`, { status, reason }),
  getOrder: (id) => api.get(`/api/admin/orders/${id}`),
  getOrderInvoice: (id) =>
    api.get(`/api/admin/orders/${id}/invoice.pdf`, {
      responseType: "blob",
    }),
  getOrderPayment: (id) => api.get(`/api/admin/orders/${id}/payment`),

  getCoupons: () => api.get("/api/admin/coupons"),
  createCoupon: (data) => api.post("/api/admin/coupons", data),
  updateCoupon: (id, data) => api.put(`/api/admin/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/api/admin/coupons/${id}`),

  bulkSales: (payload) => api.put("/api/admin/sales/bulk", payload),
  getRequestOrders: () => api.get("/api/admin/orders/requests"),
  decideReturn: (id, action, adminNote) => api.put(`/api/admin/orders/${id}/return-request`, { action, adminNote }),
  decideExchange: (id, action, adminNote) => api.put(`/api/admin/orders/${id}/exchange-request`, { action, adminNote }),

  createSale: (payload) => api.post("/api/admin/sales", payload),
  listSales: () => api.get("/api/admin/sales"),
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

export const wishlistAPI = {
  get: () => api.get("/api/auth/wishlist"),
  add: (productId) => api.post(`/api/auth/wishlist/${productId}`),
  remove: (productId) => api.delete(`/api/auth/wishlist/${productId}`),
}

export const ordersAPI = {
  list: (params) => api.get("/api/orders", { params }),
  get: (id) => api.get(`/api/orders/${id}`),
  downloadInvoice: async (id) => {
    try {
      return await api.get(`/api/orders/${id}/invoice.pdf`, { responseType: "blob" })
    } catch (e) {
      if (e?.response?.status === 403) {
        try {
          await api.post(`/api/orders/${id}/invoice`)
          return await api.get(`/api/orders/${id}/invoice.pdf`, { responseType: "blob" })
        } catch {
          // fall through to throw original error
        }
      }
      throw e
    }
  },
  requestReturn: (id, reason) => api.post(`/api/orders/${id}/return-request`, { reason }),
  requestExchange: (id, reason) => api.post(`/api/orders/${id}/exchange-request`, { reason }),
}

export const paymentAPI = {
  saveRazorpayTxn: (payload) => api.post("/api/payment/razorpay/transactions", payload),
}

export const profileAPI = {
  uploadPicture: (file) => {
    const fd = new FormData()
    fd.append("profilePic", file)
    return api.post("/api/auth/profile/picture", fd, { headers: { "Content-Type": "multipart/form-data" } })
  },
}

export const eventsAPI = {
  list: () => api.get("/api/events"),
}

export { api }
export default api
