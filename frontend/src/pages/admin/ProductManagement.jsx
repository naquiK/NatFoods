"use client"

import { useState, useEffect } from "react"
import { api } from "../../utils/api"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import ImageUpload from "../../components/admin/ImageUpload"
import ImageGallery from "../../components/admin/ImageGallery"
import AdminLayout from "../../components/admin/AdminLayout"
import { useAuth } from "../../context/AuthContext"
import PermissionRoute from "../../components/auth/PermissionRoute"

const ProductManagement = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    sub_category: "", // new
    brand: "", // optional
    stock: "",
    images: [], // keep [{url, public_id}]
    featured: false,
    onSale: false,
    salePrice: "",
    specifications: [], // array of { key, value } for UI; convert to map when submitting
    inBox: [], // array of strings
  })

  const { hasPermission } = useAuth()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await api.get("/api/admin/products")
      setProducts(response.data.products || response.data)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        stock: Number.parseInt(formData.stock || 0),
        category: formData.category,
        sub_category: formData.sub_category || undefined,
        brand: formData.brand || undefined,
        images: formData.images.map((img) => ({
          url: img.url || img, // keep backward compatibility
          public_id: img.public_id,
        })),
        isFeatured: !!formData.featured,
        isOnSale: !!formData.onSale,
        salePrice: formData.onSale && formData.salePrice ? Number.parseFloat(formData.salePrice) : undefined,
        // specifications Map expects object {key:value}
        specifications:
          formData.specifications?.length > 0
            ? Object.fromEntries(
                formData.specifications
                  .filter((p) => p.key && p.value)
                  .map((p) => [p.key.trim(), String(p.value).trim()]),
              )
            : {},
        inBox: Array.isArray(formData.inBox) ? formData.inBox.filter(Boolean) : [],
      }

      if (editingProduct) {
        await api.put(`/api/admin/products/${editingProduct._id}`, payload)
      } else {
        await api.post("/api/admin/products", payload)
      }
      fetchProducts()
      resetForm()
    } catch (error) {
      console.error("Error saving product:", error)
    }
  }

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/api/admin/products/${productId}`)
        fetchProducts()
      } catch (error) {
        console.error("Error deleting product:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      sub_category: "",
      brand: "",
      stock: "",
      images: [],
      featured: false,
      onSale: false,
      salePrice: "",
      specifications: [],
      inBox: [],
    })
    setEditingProduct(null)
    setShowModal(false)
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      sub_category: product.sub_category || "",
      brand: product.brand || "",
      stock: product.stock,
      images: product.images || [],
      featured: product.isFeatured || false,
      onSale: product.isOnSale || false,
      salePrice: product.salePrice || "",
      specifications: product.specifications
        ? Object.entries(product.specifications).map(([key, value]) => ({ key, value }))
        : [],
      inBox: product.inBox || [],
    })
    setShowModal(true)
  }

  const handleImageUpload = (uploaded) => {
    const normalized = uploaded.map((img) => ({ url: img.url, public_id: img.public_id }))
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...normalized],
    }))
  }

  const handleImageRemove = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    )
  }

  return (
    <PermissionRoute resource="products" action="view">
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-1">Product Management</h1>
              <p style={{ color: "var(--color-muted)" }}>Manage your product catalog</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ background: "var(--color-primary)", color: "#fff" }}
            >
              Add Product
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product._id}
                className="rounded-lg overflow-hidden"
                style={{
                  background: "var(--color-bg)",
                  border: "1px solid color-mix(in oklab, var(--color-fg) 12%, transparent)",
                }}
              >
                <div className="aspect-video">
                  <img
                    src={product.images?.[0]?.url || "/placeholder.svg?height=200&width=300&query=product"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-semibold line-clamp-1">{product.name}</h3>
                    <div className="flex gap-1">
                      {product.isFeatured && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: "color-mix(in oklab, var(--color-accent) 12%, transparent)",
                            color: "var(--color-accent)",
                          }}
                        >
                          Featured
                        </span>
                      )}
                      {product.isOnSale && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: "color-mix(in oklab, var(--color-primary) 12%, transparent)",
                            color: "var(--color-primary)",
                          }}
                        >
                          Sale
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm mb-3 line-clamp-2" style={{ color: "var(--color-muted)" }}>
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {product.isOnSale ? (
                        <>
                          <span className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
                            ${product.salePrice}
                          </span>
                          <span className="text-sm line-through" style={{ color: "var(--color-muted)" }}>
                            ${product.price}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold">${product.price}</span>
                      )}
                    </div>
                    <span className="text-sm" style={{ color: "var(--color-muted)" }}>
                      Stock: {product.stock}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors"
                      style={{
                        background: "color-mix(in oklab, var(--color-fg) 6%, transparent)",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors"
                      style={{
                        color: "var(--color-accent)",
                        background: "color-mix(in oklab, var(--color-accent) 12%, transparent)",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal */}
          {showModal && (
            <div
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
              style={{ background: "rgba(0,0,0,0.6)" }}
            >
              <div
                className="rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                style={{
                  background: "var(--color-bg)",
                  border: "1px solid color-mix(in oklab, var(--color-fg) 12%, transparent)",
                }}
              >
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-6">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-muted)" }}>
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg"
                        style={{
                          background: "color-mix(in oklab, var(--color-fg) 6%, transparent)",
                          border: "1px solid color-mix(in oklab, var(--color-fg) 14%, transparent)",
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-muted)" }}>
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg"
                        style={{
                          background: "color-mix(in oklab, var(--color-fg) 6%, transparent)",
                          border: "1px solid color-mix(in oklab, var(--color-fg) 14%, transparent)",
                        }}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-muted)" }}>
                          Price
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg"
                          style={{
                            background: "color-mix(in oklab, var(--color-fg) 6%, transparent)",
                            border: "1px solid color-mix(in oklab, var(--color-fg) 14%, transparent)",
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-muted)" }}>
                          Stock
                        </label>
                        <input
                          type="number"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg"
                          style={{
                            background: "color-mix(in oklab, var(--color-fg) 6%, transparent)",
                            border: "1px solid color-mix(in oklab, var(--color-fg) 14%, transparent)",
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-muted)" }}>
                          Category
                        </label>
                        <input
                          type="text"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg"
                          style={{
                            background: "color-mix(in oklab, var(--color-fg) 6%, transparent)",
                            border: "1px solid color-mix(in oklab, var(--color-fg) 14%, transparent)",
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-muted)" }}>
                          Sub Category (optional)
                        </label>
                        <input
                          type="text"
                          value={formData.sub_category}
                          onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg"
                          style={{
                            background: "color-mix(in oklab, var(--color-fg) 6%, transparent)",
                            border: "1px solid color-mix(in oklab, var(--color-fg) 14%, transparent)",
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-muted)" }}>
                        Brand (optional)
                      </label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg"
                        style={{
                          background: "color-mix(in oklab, var(--color-fg) 6%, transparent)",
                          border: "1px solid color-mix(in oklab, var(--color-fg) 14%, transparent)",
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2" style={{ color: "var(--color-muted)" }}>
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        />
                        <span className="text-sm">Featured Product</span>
                      </label>
                      <label className="flex items-center gap-2" style={{ color: "var(--color-muted)" }}>
                        <input
                          type="checkbox"
                          checked={formData.onSale}
                          onChange={(e) => setFormData({ ...formData, onSale: e.target.checked })}
                        />
                        <span className="text-sm">On Sale</span>
                      </label>
                    </div>

                    {formData.onSale && (
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-muted)" }}>
                          Sale Price
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.salePrice}
                          onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg"
                          style={{
                            background: "color-mix(in oklab, var(--color-fg) 6%, transparent)",
                            border: "1px solid color-mix(in oklab, var(--color-fg) 14%, transparent)",
                          }}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-muted)" }}>
                        Specifications (key/value)
                      </label>
                      <div className="space-y-2">
                        {formData.specifications.map((pair, idx) => (
                          <div key={idx} className="grid grid-cols-5 gap-2">
                            <input
                              placeholder="Key"
                              value={pair.key}
                              onChange={(e) => {
                                const specs = [...formData.specifications]
                                specs[idx].key = e.target.value
                                setFormData((p) => ({ ...p, specifications: specs }))
                              }}
                              className="px-3 py-2 rounded col-span-2"
                              style={{
                                background: "color-mix(in oklab, var(--color-fg) 6%, transparent)",
                                border: "1px solid color-mix(in oklab, var(--color-fg) 14%, transparent)",
                              }}
                            />
                            <input
                              placeholder="Value"
                              value={pair.value}
                              onChange={(e) => {
                                const specs = [...formData.specifications]
                                specs[idx].value = e.target.value
                                setFormData((p) => ({ ...p, specifications: specs }))
                              }}
                              className="px-3 py-2 rounded col-span-3"
                              style={{
                                background: "color-mix(in oklab, var(--color-fg) 6%, transparent)",
                                border: "1px solid color-mix(in oklab, var(--color-fg) 14%, transparent)",
                              }}
                            />
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="px-3 py-2 rounded text-sm"
                            style={{
                              background: "color-mix(in oklab, var(--color-primary) 18%, transparent)",
                              border: "1px solid color-mix(in oklab, var(--color-primary) 40%, transparent)",
                            }}
                            onClick={() =>
                              setFormData((p) => ({
                                ...p,
                                specifications: [...(p.specifications || []), { key: "", value: "" }],
                              }))
                            }
                          >
                            Add Spec
                          </button>
                          {formData.specifications.length > 0 && (
                            <button
                              type="button"
                              className="px-3 py-2 rounded text-sm"
                              style={{
                                background: "color-mix(in oklab, var(--color-fg) 6%, transparent)",
                                border: "1px solid color-mix(in oklab, var(--color-fg) 14%, transparent)",
                              }}
                              onClick={() =>
                                setFormData((p) => ({ ...p, specifications: p.specifications.slice(0, -1) }))
                              }
                            >
                              Remove Last
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-muted)" }}>
                        In-Box Items (one per line)
                      </label>
                      <textarea
                        rows={3}
                        value={(formData.inBox || []).join("\n")}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, inBox: e.target.value.split("\n").map((s) => s.trim()) }))
                        }
                        className="w-full px-4 py-2 rounded-lg"
                        style={{
                          background: "color-mix(in oklab, var(--color-fg) 6%, transparent)",
                          border: "1px solid color-mix(in oklab, var(--color-fg) 14%, transparent)",
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-muted)" }}>
                        Product Images
                      </label>
                      <ImageUpload onUpload={handleImageUpload} multiple={true} accept="image/*" />
                      {formData.images.length > 0 && (
                        <div className="mt-4">
                          <ImageGallery
                            images={formData.images}
                            onRemove={(index) =>
                              setFormData((prev) => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== index),
                              }))
                            }
                            editable={true}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 rounded-lg font-medium transition-colors"
                        style={{
                          background: "color-mix(in oklab, var(--color-fg) 6%, transparent)",
                          border: "1px solid color-mix(in oklab, var(--color-fg) 14%, transparent)",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg font-medium transition-colors"
                        style={{ background: "var(--color-primary)", color: "#fff" }}
                      >
                        {editingProduct ? "Update Product" : "Add Product"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </PermissionRoute>
  )
}

export default ProductManagement
