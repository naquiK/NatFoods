"use client"

import { useState, useEffect } from "react"
import { api } from "../../utils/api"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import Button from "../../components/ui/Button"
import ImageUpload from "../../components/admin/ImageUpload"
import ImageGallery from "../../components/admin/ImageGallery"

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
    stock: "",
    images: [],
    featured: false,
    onSale: false,
    salePrice: "",
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products")
      setProducts(response.data)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct._id}`, formData)
      } else {
        await api.post("/admin/products", formData)
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
        await api.delete(`/admin/products/${productId}`)
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
      stock: "",
      images: [],
      featured: false,
      onSale: false,
      salePrice: "",
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
      stock: product.stock,
      images: product.images || [],
      featured: product.featured || false,
      onSale: product.onSale || false,
      salePrice: product.salePrice || "",
    })
    setShowModal(true)
  }

  const handleImageUpload = (uploadedImages) => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...uploadedImages.map((img) => img.url)],
    }))
  }

  const handleImageRemove = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-stone-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-stone-900">Product Management</h1>
          <Button onClick={() => setShowModal(true)} className="bg-stone-900 hover:bg-stone-800">
            Add New Product
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={product.images?.[0] || "/placeholder.svg?height=200&width=300&query=product"}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-stone-900 line-clamp-2">{product.name}</h3>
                  <div className="flex space-x-1">
                    {product.featured && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Featured</span>
                    )}
                    {product.onSale && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Sale</span>
                    )}
                  </div>
                </div>
                <p className="text-stone-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {product.onSale ? (
                      <>
                        <span className="text-lg font-bold text-red-600">${product.salePrice}</span>
                        <span className="text-sm text-stone-500 line-through">${product.price}</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-stone-900">${product.price}</span>
                    )}
                  </div>
                  <span className="text-sm text-stone-500">Stock: {product.stock}</span>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => handleEdit(product)} variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(product._id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-stone-900 mb-6">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Product Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Stock</label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="rounded border-stone-300 text-stone-600 focus:ring-stone-500"
                      />
                      <span className="ml-2 text-sm text-stone-700">Featured Product</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.onSale}
                        onChange={(e) => setFormData({ ...formData, onSale: e.target.checked })}
                        className="rounded border-stone-300 text-stone-600 focus:ring-stone-500"
                      />
                      <span className="ml-2 text-sm text-stone-700">On Sale</span>
                    </label>
                  </div>
                  {formData.onSale && (
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Sale Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.salePrice}
                        onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Product Images</label>
                    <ImageUpload onUpload={handleImageUpload} multiple={true} accept="image/*" />
                    {formData.images.length > 0 && (
                      <div className="mt-4">
                        <ImageGallery images={formData.images} onRemove={handleImageRemove} editable={true} />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-4 pt-6">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-stone-900 hover:bg-stone-800">
                      {editingProduct ? "Update Product" : "Add Product"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductManagement
