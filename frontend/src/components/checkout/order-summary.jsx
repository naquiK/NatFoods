"use client"

export default function OrderSummary({ items = [], subtotal = 0, shipping = 0, tax = 0, total = 0 }) {
  return (
    <aside className="rounded-xl border p-6 bg-white">
      <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

      <div className="space-y-4">
        {items.map((item) => {
          const key = item.id || item._id
          return (
            <div key={key} className="flex items-center gap-4">
              <img
                src={item.image || "/placeholder.svg?height=64&width=64&query=product-preview"}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-medium text-neutral-900">{item.name}</h3>
                <p className="text-sm text-neutral-600">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium text-neutral-900">₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          )
        })}
      </div>

      <div className="border-t border-neutral-200 mt-6 pt-6 space-y-3 text-sm">
        <div className="flex justify-between text-neutral-700">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-neutral-700">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between text-neutral-700">
          <span>Tax (10%)</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-lg font-semibold text-neutral-900 pt-2">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>
    </aside>
  )
}
