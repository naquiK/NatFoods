"use client"

import { useEffect, useState } from "react"
import AdminLayout from "../../components/admin/AdminLayout"
import { adminAPI } from "../../utils/api"

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "percent",
    value: "",
    minSpend: "",
    productIds: "",
    startsAt: "",
    endsAt: "",
    active: true,
  })

  const load = async () => {
    setLoading(true)
    try {
      const res = await adminAPI.getCoupons()
      setCoupons(res.data?.coupons || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const create = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      value: Number(form.value || 0),
      minSpend: Number(form.minSpend || 0),
      productIds: (form.productIds || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    }
    await adminAPI.createCoupon(payload)
    setForm({
      code: "",
      description: "",
      discountType: "percent",
      value: "",
      minSpend: "",
      productIds: "",
      startsAt: "",
      endsAt: "",
      active: true,
    })
    await load()
  }

  const remove = async (id) => {
    if (!confirm("Delete this coupon?")) return
    await adminAPI.deleteCoupon(id)
    await load()
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-2xl font-semibold">Coupons</h1>

        <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
          <input
            placeholder="CODE"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="border px-3 py-2 rounded"
            required
          />
          <select
            value={form.discountType}
            onChange={(e) => setForm({ ...form, discountType: e.target.value })}
            className="border px-3 py-2 rounded"
          >
            <option value="percent">Percent %</option>
            <option value="amount">Amount</option>
          </select>
          <input
            placeholder={form.discountType === "percent" ? "Value (e.g., 10 for 10%)" : "Amount (e.g., 100)"}
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            className="border px-3 py-2 rounded"
            required
          />
          <input
            placeholder="Min Spend (₹)"
            value={form.minSpend}
            onChange={(e) => setForm({ ...form, minSpend: e.target.value })}
            className="border px-3 py-2 rounded"
          />
          <input
            placeholder="Product IDs (comma-separated, optional)"
            value={form.productIds}
            onChange={(e) => setForm({ ...form, productIds: e.target.value })}
            className="border px-3 py-2 rounded md:col-span-2"
          />
          <input
            type="datetime-local"
            value={form.startsAt}
            onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
            className="border px-3 py-2 rounded"
          />
          <input
            type="datetime-local"
            value={form.endsAt}
            onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
            className="border px-3 py-2 rounded"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Active
          </label>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border px-3 py-2 rounded md:col-span-2"
          />
          <div className="md:col-span-2">
            <button type="submit" className="px-4 py-2 rounded bg-stone-900 text-white">
              Add Coupon
            </button>
          </div>
        </form>

        <div className="border rounded-lg">
          {loading ? (
            <div className="p-6 text-stone-600">Loading...</div>
          ) : coupons.length === 0 ? (
            <div className="p-6 text-stone-600">No coupons yet</div>
          ) : (
            <div className="divide-y">
              {coupons.map((c) => (
                <div key={c._id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {c.code} {c.active ? "" : "(inactive)"}
                    </p>
                    <p className="text-sm text-stone-600">
                      {c.discountType === "percent" ? `${c.value}% off` : `₹${c.value} off`} • Min spend ₹
                      {c.minSpend || 0}
                    </p>
                    {!!c.productIds?.length && (
                      <p className="text-xs text-stone-500">Products: {c.productIds.length}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => remove(c._id)} className="px-3 py-1.5 rounded border">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
