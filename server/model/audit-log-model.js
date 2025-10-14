const mongoose = require("mongoose")

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String },
    action: { type: String, required: true },
    meta: { type: Object, default: {} },
    ip: { type: String },
    path: { type: String },
  },
  { timestamps: true },
)

module.exports = mongoose.model("AuditLog", auditLogSchema)
