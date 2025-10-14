const mongoose = require("mongoose")

const saleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    image: {
      url: String,
      public_id: String,
    },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    percentOff: { type: Number, min: 0, max: 100 },
    salePrice: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Sale", saleSchema)
 