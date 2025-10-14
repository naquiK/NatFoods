const mongoose = require("mongoose")

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: {
      products: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      orders: {
        view: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      users: {
        view: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      events: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      coupons: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      roles: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      settings: {
        view: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
      },
      dashboard: {
        view: { type: Boolean, default: false },
      },
      custom: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Static method to get default admin role
roleSchema.statics.getAdminRole = async function () {
  let adminRole = await this.findOne({ name: "Admin", isSystem: true })

  if (!adminRole) {
    adminRole = await this.create({
      name: "Admin",
      description: "Full system access",
      isSystem: true,
      permissions: {
        products: { view: true, create: true, update: true, delete: true },
        orders: { view: true, update: true, delete: true },
        users: { view: true, update: true, delete: true },
        events: { view: true, create: true, update: true, delete: true },
        coupons: { view: true, create: true, update: true, delete: true },
        roles: { view: true, create: true, update: true, delete: true },
        settings: { view: true, update: true },
        dashboard: { view: true },
        custom: { view: true, create: true, update: true, delete: true },
      },
    })
  }

  return adminRole
}

// Static method to get default moderator role
roleSchema.statics.getModeratorRole = async function () {
  let moderatorRole = await this.findOne({ name: "Moderator", isSystem: true })

  if (!moderatorRole) {
    moderatorRole = await this.create({
      name: "Moderator",
      description: "Can manage products and orders",
      isSystem: true,
      permissions: {
        products: { view: true, create: true, update: true, delete: false },
        orders: { view: true, update: true, delete: false },
        users: { view: true, update: false, delete: false },
        events: { view: false, create: false, update: false, delete: false },
        coupons: { view: false, create: false, update: false, delete: false },
        roles: { view: false, create: false, update: false, delete: false },
        settings: { view: false, update: false },
        dashboard: { view: true },
        custom: { view: false, create: false, update: false, delete: false },
      },
    })
  }

  return moderatorRole
}

const Role = mongoose.model("Role", roleSchema)

module.exports = Role
