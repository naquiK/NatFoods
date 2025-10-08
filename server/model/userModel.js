const mongoose = require("mongoose")
const validator = require("validator")
const role = require("./role-model")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      maxLength: [30, "Your name cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      validate: [validator.isEmail, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: [6, "Your password must be longer than 6 characters"],
      select: false, // This ensures password is not returned in queries by default
    },
    phone: {
      type: String,
      default: "",
    },
    profilePic: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },
    addresses: [
      {
        contactName: { type: String, default: "" },
        contactPhone: { type: String, default: "" },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        country: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      default: "",
    },
    verificationCodeExpire: {
      type: Date,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true },
)

userSchema.methods.hasPermission = async function (resource, action) {
  // Super admin has all permissions
  if (this.isAdmin && !this.role) {
    return true
  }

  // If user has a role, check role permissions
  if (this.role) {
    await this.populate("role")
    if (this.role && this.role.permissions && this.role.permissions[resource]) {
      return this.role.permissions[resource][action] === true
    }
  }

  return false
}

module.exports = mongoose.model("User", userSchema)
