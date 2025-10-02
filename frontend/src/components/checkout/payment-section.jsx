"use client"

export default function PaymentSection({ paymentMethod, onChange }) {
  return (
    <div className="rounded-xl border p-6 bg-white">
      <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
      <div className="space-y-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="paymentMethod"
            value="razorpay"
            checked={paymentMethod === "razorpay"}
            onChange={onChange}
            aria-label="Pay online with Razorpay"
          />
          <span className="ml-3 text-neutral-800">Online (Razorpay)</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="paymentMethod"
            value="cod"
            checked={paymentMethod === "cod"}
            onChange={onChange}
            aria-label="Cash on Delivery"
          />
          <span className="ml-3 text-neutral-800">Cash on Delivery</span>
        </label>
      </div>
    </div>
  )
}
