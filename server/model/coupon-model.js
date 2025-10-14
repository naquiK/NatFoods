const mongoose = require("mongoose")

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: "" },
    discountType: { type: String, enum: ["percent", "amount"], required: true },
    value: { type: Number, required: true, min: 0 }, // percent or amount based on discountType
    minSpend: { type: Number, default: 0, min: 0 },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // empty means sitewide
    startsAt: { type: Date },
    endsAt: { type: Date },
    active: { type: Boolean, default: true },
    usageLimit: { type: Number }, // optional
    usageCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
)

couponSchema.index({ code: 1 }, { unique: true })

module.exports = mongoose.model("Coupon", couponSchema)
