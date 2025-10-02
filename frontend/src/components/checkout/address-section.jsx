"use client"

export default function AddressSection({
  addresses = [],
  user,
  useSavedAddress,
  onToggleUseSaved,
  selectedAddressIndex,
  onSelectSaved,
  formData,
  onChangeField,
}) {
  return (
    <div className="rounded-xl border p-6 bg-white">
      <h2 className="text-xl font-semibold mb-6">Shipping Address</h2>

      {addresses?.length > 0 && (
        <label className="flex items-center gap-2 mb-4 text-neutral-600">
          <input
            type="checkbox"
            checked={useSavedAddress}
            onChange={(e) => onToggleUseSaved(e.target.checked)}
            aria-label="Use a saved address"
          />
          Use a saved address
        </label>
      )}

      {useSavedAddress && addresses?.length > 0 ? (
        <div className="grid gap-3">
          {addresses.map((a, idx) => {
            const selected = selectedAddressIndex === idx
            return (
              <label
                key={idx}
                className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer ${
                  selected ? "border-teal-600 ring-1 ring-teal-600" : "border-neutral-200"
                }`}
              >
                <input
                  type="radio"
                  name="savedAddress"
                  checked={selected}
                  onChange={() => onSelectSaved(idx)}
                  aria-label={`Select address ${idx + 1}`}
                />
                <div>
                  <div className="font-medium text-neutral-900">{a.contactName || user?.name}</div>
                  <div className="text-sm text-neutral-600">
                    {a.street}, {a.city}, {a.state} {a.zip}, {a.country}
                  </div>
                  {a.isDefault && (
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Default
                    </span>
                  )}
                </div>
              </label>
            )
          })}
        </div>
      ) : (
        <div className="grid gap-4">
          <div>
            <label htmlFor="shipping.fullName" className="block text-sm font-medium mb-2 text-neutral-600">
              Full Name
            </label>
            <input
              id="shipping.fullName"
              type="text"
              name="shipping.fullName"
              value={formData.shippingAddress.fullName}
              onChange={onChangeField}
              required
              className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label htmlFor="shipping.address" className="block text-sm font-medium mb-2 text-neutral-600">
              Address
            </label>
            <input
              id="shipping.address"
              type="text"
              name="shipping.address"
              value={formData.shippingAddress.address}
              onChange={onChangeField}
              required
              className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
              placeholder="Street address"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="shipping.city" className="block text-sm font-medium mb-2 text-neutral-600">
                City
              </label>
              <input
                id="shipping.city"
                type="text"
                name="shipping.city"
                value={formData.shippingAddress.city}
                onChange={onChangeField}
                required
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
                placeholder="City"
              />
            </div>
            <div>
              <label htmlFor="shipping.state" className="block text-sm font-medium mb-2 text-neutral-600">
                State
              </label>
              <input
                id="shipping.state"
                type="text"
                name="shipping.state"
                value={formData.shippingAddress.state}
                onChange={onChangeField}
                required
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
                placeholder="State"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="shipping.zipCode" className="block text-sm font-medium mb-2 text-neutral-600">
                ZIP Code
              </label>
              <input
                id="shipping.zipCode"
                type="text"
                name="shipping.zipCode"
                value={formData.shippingAddress.zipCode}
                onChange={onChangeField}
                required
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
                placeholder="e.g. 560001"
              />
            </div>
            <div>
              <label htmlFor="shipping.country" className="block text-sm font-medium mb-2 text-neutral-600">
                Country
              </label>
              <input
                id="shipping.country"
                type="text"
                name="shipping.country"
                value={formData.shippingAddress.country}
                onChange={onChangeField}
                required
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
                placeholder="Country"
              />
            </div>
          </div>
          <div>
            <label htmlFor="shipping.phone" className="block text-sm font-medium mb-2 text-neutral-600">
              Phone
            </label>
            <input
              id="shipping.phone"
              type="tel"
              name="shipping.phone"
              value={formData.shippingAddress.phone}
              onChange={onChangeField}
              required
              className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
              placeholder="Phone number"
            />
          </div>
        </div>
      )}
    </div>
  )
}
