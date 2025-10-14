"use client"

import { useEffect, useState } from "react"
import AdminLayout from "../../components/admin/AdminLayout"
import { adminAPI, productsAPI, api } from "../../utils/api"

export default function AdminSales() {
  const [products, setProducts] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [percentOff, setPercentOff] = useState("")
  const [salePrice, setSalePrice] = useState("")
  const [onSale, setOnSale] = useState(true)
  const [q, setQ] = useState("")
  const [sales, setSales] = useState([])
  const [creating, setCreating] = useState(false)
  const [saleName, setSaleName] = useState("")
  const [saleDescription, setSaleDescription] = useState("")
  const [startAt, setStartAt] = useState("")
  const [endAt, setEndAt] = useState("")
  const [saleImage, setSaleImage] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await productsAPI.getAll({ search: q, limit: 50 })
      setProducts(res.data?.products || [])
    } finally {
      setLoading(false)
    }
  }

  const loadSales = async () => {
    try {
      const res = await adminAPI.listSales()
      setSales(res.data?.sales || [])
    } catch (e) {
      console.error("[v0] loadSales error:", e?.message)
    }
  }

  const onSaleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const fd = new FormData()
      fd.append("image", file)
      const resp = await api.post("/api/upload/image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      const f = resp.data?.files?.[0]
      if (f?.url && f?.public_id) {
        setSaleImage({ url: f.url, public_id: f.public_id })
      } else {
        alert("Upload failed. Please try again.")
      }
    } catch (err) {
      console.error("[v0] sale image upload error:", err?.message)
      alert("Image upload failed.")
    }
  }

  const createSale = async () => {
    const productIds = Array.from(selected)
    if (!saleName.trim()) return alert("Sale name is required")
    if (!startAt || !endAt) return alert("Start and End date/time are required")
    if (productIds.length === 0) return alert("Select at least one product for this sale")

    const payload = {
      name: saleName.trim(),
      description: saleDescription.trim(),
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
      productIds,
      percentOff: percentOff ? Number(percentOff) : undefined,
      salePrice: salePrice ? Number(salePrice) : undefined,
      image: saleImage || undefined,
    }

    try {
      setCreating(true)
      await adminAPI.createSale(payload)
      // refresh lists and reset form
      await Promise.all([load(), loadSales()])
      setSaleName("")
      setSaleDescription("")
      setStartAt("")
      setEndAt("")
      setSaleImage(null)
      setPercentOff("")
      setSalePrice("")
      setSelected(new Set())
      alert("Sale created and applied!")
    } catch (e) {
      console.error("[v0] createSale error:", e?.message)
      alert("Failed to create sale")
    } finally {
      setCreating(false)
    }
  }

  const apply = async () => {
    const productIds = Array.from(selected)
    if (productIds.length === 0) {
      alert("Select at least one product.")
      return
    }
    await adminAPI.bulkSales({
      productIds,
      onSale,
      percentOff: percentOff ? Number(percentOff) : undefined,
      salePrice: salePrice ? Number(salePrice) : undefined,
    })
    await load()
    alert("Sale updated!")
    setSelected(new Set())
  }

  useEffect(() => {
    load()
    loadSales()
    // eslint-disable-next-line
  }, [])

  const toggle = (id) => {
    const clone = new Set(selected)
    if (clone.has(id)) clone.delete(id)
    else clone.add(id)
    setSelected(clone)
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Sales</h1>

        <div className="border rounded-lg p-4 space-y-4">
          <h2 className="text-lg font-semibold">Create New Sale</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Sale Name</label>
              <input
                value={saleName}
                onChange={(e) => setSaleName(e.target.value)}
                className="border px-3 py-2 rounded w-full"
                placeholder="e.g. Diwali Mega Sale"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Sale Image</label>
              <input type="file" accept="image/*" onChange={onSaleImageChange} className="block w-full" />
              {saleImage?.url && (
                <img
                  src={saleImage.url || "/placeholder.svg"}
                  alt="Sale"
                  className="mt-2 w-24 h-24 object-cover rounded border"
                />
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Description</label>
              <textarea
                value={saleDescription}
                onChange={(e) => setSaleDescription(e.target.value)}
                className="border px-3 py-2 rounded w-full"
                rows={3}
                placeholder="Short description for the sale banner"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Starts At</label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="border px-3 py-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Ends At</label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="border px-3 py-2 rounded w-full"
              />
            </div>
          </div>

          {/* reuse pricing controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 border rounded-lg p-4 mt-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} />
              Put On Sale
            </label>
            <input
              placeholder="% Off (optional)"
              value={percentOff}
              onChange={(e) => setPercentOff(e.target.value)}
              className="border px-3 py-2 rounded"
            />
            <input
              placeholder="Sale Price (optional)"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              className="border px-3 py-2 rounded"
            />
            <button
              onClick={createSale}
              disabled={creating}
              className="px-4 py-2 rounded bg-stone-900 text-white disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create Sale"}
            </button>
          </div>
        </div>

        {/* existing search and selection UI */}
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm mb-1">Search</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="border px-3 py-2 rounded w-full"
              placeholder="Search products..."
            />
          </div>
          <button onClick={load} className="px-4 py-2 rounded border">
            Search
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {loading ? (
            <div className="col-span-full p-6 text-stone-600">Loading...</div>
          ) : (
            products.map((p) => (
              <label key={p._id} className="border rounded-lg p-3 flex items-center gap-3">
                <input type="checkbox" checked={selected.has(p._id)} onChange={() => toggle(p._id)} />
                <img
                  src={p.images?.[0]?.url || "/placeholder.svg?height=120&width=120&query=product"}
                  alt={p.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="text-sm">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-stone-600">
                    ₹{p.price}
                    {p.isOnSale && p.salePrice ? ` • Sale ₹${p.salePrice}` : ""}
                  </p>
                </div>
              </label>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 border rounded-lg p-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} />
            Put On Sale
          </label>
          <input
            placeholder="% Off (optional)"
            value={percentOff}
            onChange={(e) => setPercentOff(e.target.value)}
            className="border px-3 py-2 rounded"
          />
          <input
            placeholder="Sale Price (optional)"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            className="border px-3 py-2 rounded"
          />
          <button onClick={apply} className="px-4 py-2 rounded bg-stone-900 text-white">
            Apply
          </button>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Existing Sales</h2>
          {sales.length === 0 ? (
            <p className="text-sm text-stone-600">No sales found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sales.map((s) => {
                const now = Date.now()
                const active = s.isActive && new Date(s.endAt).getTime() > now
                return (
                  <div key={s._id} className="border rounded-lg p-3 flex gap-3">
                    <img
                      src={s.image?.url || "/placeholder.svg?height=96&width=96&query=sale"}
                      alt={s.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{s.name}</h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            active ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700"
                          }`}
                        >
                          {active ? "Active" : "Expired"}
                        </span>
                      </div>
                      {s.description && <p className="text-sm text-stone-600 mt-1 line-clamp-2">{s.description}</p>}
                      <p className="text-xs text-stone-500 mt-1">
                        {new Date(s.startAt).toLocaleString()} → {new Date(s.endAt).toLocaleString()}
                      </p>
                      {(typeof s.percentOff === "number" || typeof s.salePrice === "number") && (
                        <p className="text-xs text-stone-600 mt-1">
                          {typeof s.percentOff === "number" ? `${s.percentOff}% off` : ""}
                          {typeof s.salePrice === "number" ? ` Sale Price: ₹${s.salePrice}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
