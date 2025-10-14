const User = require("../model/userModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const mailSender = require("../utils/mailSender")
const { uploadImage, cloudinary } = require("../config/cloudinary")

//register user
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    // Check if user Email exists
    const existingUserEmail = await User.findOne({ email })
    if (existingUserEmail && existingUserEmail.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already exists. Please use a different email.",
      })
    }

    // Check if user Phone exists
    if (phone) {
      const existingUserPhone = await User.findOne({ phone })
      if (existingUserPhone && existingUserPhone.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Phone number already exists. Please use a different phone number.",
        })
      }
    }

    // hashing the password
    const hashedPassword = await bcrypt.hash(password, 10)

    const verificationCode = Math.floor(100000 + Math.random() * 900000)
    const verificationCodeExpire = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // Create a new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      verificationCode,
      verificationCodeExpire,
    })

    mailSender({
      email: newUser.email,
      subject: "Verification Code",
      message: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4CAF50;">eKart OTP Verification</h2>
          <p>Hi <strong>Customer</strong>,</p>
          <p>Use the following One-Time Password (OTP):</p>
          <div style="margin: 20px 0; font-size: 24px; font-weight: bold; color: #000; letter-spacing: 3px;">
            ${verificationCode}
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        </div>
      `,
    })

    res.status(201).json({
      success: true,
      message: " Please verify your email.",
      data: { id: newUser._id },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

//otp verification
const optVerification = async (req, res) => {
  try {
    const { otp } = req.body
    const id = req.params.id
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "please provide verification code",
      })
    }
    const user = await User.findById(id)
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      })
    }
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "user already verified",
      })
    }
    if (!user.verificationCode) {
      return res.status(400).json({
        success: false,
        message: "verification code not sent",
      })
    }
    if (user.verificationCode !== otp) {
      return res.status(400).json({
        success: false,
        message: "invalid verification code",
      })
    }
    if (user.verificationCodeExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "verification code expired",
      })
    }
    user.isVerified = true
    user.emailVerified = true
    user.verificationCode = null
    user.verificationCodeExpire = null
    await user.save()

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    )

    return res.status(200).json({
      success: true,
      message: "user verified",
      token,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

//generating otp for forget password by email
const forgetPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email, isVerified: true })
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found or not verified" })
    }

    const resetPasswordToken = Math.floor(100000 + Math.random() * 900000)
    const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000)

    user.resetPasswordToken = String(resetPasswordToken)
    user.resetPasswordExpire = resetPasswordExpire
    await user.save()

    await mailSender({
      email: user.email,
      subject: "Forget Password Code",
      message: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4CAF50;">Password Reset OTP</h2>
          <p>Your OTP is:</p>
          <div style="margin: 20px 0; font-size: 24px; font-weight: bold; color: #000; letter-spacing: 3px;">
            ${resetPasswordToken}
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        </div>
      `,
    })

    return res.status(200).json({
      success: true,
      message: "Reset OTP sent to your email",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

//verifying otp for forget password
const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" })
    }

    const user = await User.findOne({ email, isVerified: true })
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found or not verified" })
    }

    if (!user.resetPasswordToken || !user.resetPasswordExpire) {
      return res.status(400).json({ success: false, message: "No reset request found" })
    }
    if (String(user.resetPasswordToken) !== String(otp)) {
      return res.status(401).json({ success: false, message: "Invalid OTP" })
    }
    if (user.resetPasswordExpire < Date.now()) {
      return res.status(401).json({ success: false, message: "OTP expired" })
    }

    // Clear OTP and issue a reset token JWT
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    const resetToken = jwt.sign({ userId: user._id, purpose: "password-reset" }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    })

    return res.status(200).json({
      success: true,
      message: "OTP verified",
      resetToken,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

// New: reset password using resetToken and newPassword
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body
    if (!resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: "resetToken and newPassword are required" })
    }

    let decoded
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET)
    } catch (e) {
      return res.status(401).json({ success: false, message: "Invalid or expired reset token" })
    }
    if (decoded.purpose !== "password-reset") {
      return res.status(400).json({ success: false, message: "Invalid reset token purpose" })
    }

    const user = await User.findById(decoded.userId)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    user.password = hashed
    await user.save()

    return res.status(200).json({ success: true, message: "Password reset successful" })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email }).select("+password")
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email first",
        needsVerification: true,
        userId: user._id,
      })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate token
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" })

    await user.populate("role")
    const roleName = user.role?.name || null
    const permissions = user.role?.permissions || null

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin === true,
        roleName,
        permissions, // pass full permission object for fine-grained checks
        profilePicture: user.profilePic?.url,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get User Info
const getInfo = async (req, res) => {
  try {
    const u = req.user
    if (!u) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    await u.populate("role")
    const roleName = u.role?.name || null
    const permissions = u.role?.permissions || null

    return res.status(200).json({
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      isAdmin: u.isAdmin === true,
      roleName,
      permissions,
      profilePicture: u.profilePic?.url,
      addresses: (u.addresses || []).map((a) => ({
        id: a._id,
        contactName: a.contactName || "",
        contactPhone: a.contactPhone || "",
        street: a.street,
        city: a.city,
        state: a.state,
        zip: a.zip,
        country: a.country,
        isDefault: !!a.isDefault,
      })),
      wishlist: (u.wishlist || []).map((id) => id?.toString?.() || id),
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

//updatating profile
const editProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body

    // Prefer req.user (set by authMiddleware) when available
    let userId = req.user && (req.user.id || req.user._id?.toString())

    // If not available, try to read and verify token but don't throw uncaught errors
    if (!userId) {
      const auth = req.headers["authorization"]
      if (!auth) return res.status(401).json({ success: false, message: "Unauthorized" })
      const token = auth.split(" ")[1]
      if (!token) return res.status(401).json({ success: false, message: "Unauthorized" })
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        userId = decoded.userId || decoded.id || decoded._id
      } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" })
      }
    }

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ success: false, message: "User not found" })

    // Check uniqueness if email/phone are being changed
    if (email && email !== user.email) {
      const exists = await User.findOne({ email })
      if (exists) return res.status(400).json({ success: false, message: "Email already in use" })
    }
    if (phone && phone !== user.phone) {
      const exists = await User.findOne({ phone })
      if (exists) return res.status(400).json({ success: false, message: "Phone already in use" })
    }

    if (req.file) {
      try {
        // Delete last profile from cloudinary if present
        const prevPublicId = user.profilePic?.publicId || user.profilePic?.public_id
        if (prevPublicId) {
          await cloudinary.uploader.destroy(prevPublicId).catch(() => {})
        }

        // Upload new image and normalize fields
        const uploadRes = await uploadImage(req.file.path)
        const url = uploadRes?.url || uploadRes?.secure_url || uploadRes?.path || req.file.path
        const publicId = uploadRes?.publicId || uploadRes?.public_id || req.file.filename || req.file.public_id
        user.profilePic = { url, publicId }
      } catch (err) {
        console.log("[v0] profile pic upload failed:", err?.message)
        return res.status(500).json({ success: false, message: "Failed to upload profile picture" })
      }
    }

    if (name) user.name = name
    if (email) user.email = email
    if (phone) user.phone = phone

    await user.save()

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.isAdmin ? "admin" : "user",
        profilePicture: user.profilePic?.url,
      },
    })
  } catch (error) {
    console.error("[v0] editProfile error:", error?.message)
    return res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
}

//changing password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body
    const email = req.userInfo.email

    const algorithm = "aes-256-cbc"
    const key = Buffer.from(process.env.AES_KEY, "hex")
    const iv = Buffer.from(process.env.AES_IV, "hex")

    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    let decryptedEmail = decipher.update(email, "hex", "utf-8")
    decryptedEmail += decipher.final("utf-8")

    const user = await User.findOne({ email: decryptedEmail })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      })
    }
    if (newPassword !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "Passwords do not match",
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    await user.save()

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Upload Profile Picture
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      console.log(" uploadProfilePicture missing req.file")
      return res.status(400).json({
        success: false,
        message: "No image file provided.",
      })
    }
    const user = await User.findById(req.user.id || req.user._id)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." })
    }
    // CloudinaryStorage sets: path (url), filename (public_id)
    const url = req.file.path || req.file.secure_url || req.file.url || "" // normalize url fields
    const publicId = req.file.filename || req.file.public_id || req.file.key || req.file.originalname || "" // normalize id fields

    if (!url || !publicId) {
      console.log(" uploadProfilePicture missing returned identifiers", { file: req.file })
      return res.status(500).json({ success: false, message: "Upload provider did not return URL/public_id" })
    }

    // delete previous pic if present
    if (user.profilePic?.publicId) {
      try {
        await cloudinary.uploader.destroy(user.profilePic.publicId)
      } catch (err) {
        console.log(" previous profilePic destroy failed:", err?.message)
      }
    }
    user.profilePic = { url, publicId }
    await user.save()
    // Return a normalized shape to the client (profilePicture) plus the updated user object
    return res.status(200).json({
      success: true,
      message: "Profile picture updated.",
      profilePic: user.profilePic,
      profilePicture: user.profilePic?.url,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePic?.url,
      },
    })
  } catch (error) {
    console.error(" Upload profile picture error:", error?.message)
    res.status(500).json({ success: false, message: "Failed to upload profile picture.", error: error.message })
  }
}

// Add new address
const addAddress = async (req, res) => {
  try {
    const { contactName, contactPhone, street, city, state, zip, country, isDefault } = req.body

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false))
    }

    user.addresses.push({
      contactName: contactName || "",
      contactPhone: contactPhone || "",
      street,
      city,
      state,
      zip,
      country,
      isDefault: !!isDefault,
    })
    await user.save()

    res.status(201).json({ success: true, message: "Address added successfully", addresses: user.addresses })
  } catch (error) {
    console.error("Add address error:", error)
    res.status(500).json({ success: false, message: "Failed to add address", error: error.message })
  }
}

// Update address
const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params
    const { contactName, contactPhone, street, city, state, zip, country, isDefault } = req.body

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    const addressIndex = user.addresses.findIndex((addr) => addr._id.toString() === addressId)
    if (addressIndex === -1) {
      return res.status(404).json({ success: false, message: "Address not found" })
    }

    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false))
    }

    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      contactName: contactName ?? user.addresses[addressIndex].contactName,
      contactPhone: contactPhone ?? user.addresses[addressIndex].contactPhone,
      street: street ?? user.addresses[addressIndex].street,
      city: city ?? user.addresses[addressIndex].city,
      state: state ?? user.addresses[addressIndex].state,
      zip: zip ?? user.addresses[addressIndex].zip,
      country: country ?? user.addresses[addressIndex].country,
      isDefault: isDefault ?? user.addresses[addressIndex].isDefault,
    }
    await user.save()

    res.status(200).json({ success: true, message: "Address updated successfully", addresses: user.addresses })
  } catch (error) {
    console.error("Update address error:", error)
    res.status(500).json({ success: false, message: "Failed to update address", error: error.message })
  }
}

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const initialLength = user.addresses.length
    user.addresses = user.addresses.filter((addr) => addr._id.toString() !== addressId)

    if (user.addresses.length === initialLength) {
      return res.status(404).json({ success: false, message: "Address not found" })
    }

    await user.save()

    res.status(200).json({ success: true, message: "Address deleted successfully", addresses: user.addresses })
  } catch (error) {
    console.error("Delete address error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete address",
      error: error.message,
    })
  }
}

// Set Default Address
const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params
    const userId = req.user.id

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const addressIndex = user.addresses.findIndex((addr) => addr._id.toString() === addressId)
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      })
    }

    // Make all addresses non-default
    user.addresses.forEach((addr) => (addr.isDefault = false))

    // Set the selected address as default
    user.addresses[addressIndex].isDefault = true

    await user.save()

    res.status(200).json({
      success: true,
      message: "Default address set successfully",
      data: user.addresses,
    })
  } catch (error) {
    console.error("Set default address error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to set default address",
      error: error.message,
    })
  }
}

// Wishlist handlers
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist", "name price images stock")
    if (!user) return res.status(404).json({ success: false, message: "User not found" })
    res.json({ success: true, wishlist: user.wishlist })
  } catch (e) {
    res.status(500).json({ success: false, message: e.message })
  }
}

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ success: false, message: "User not found" })
    const exists = user.wishlist?.some((id) => id.toString() === productId)
    if (!exists) {
      user.wishlist = [...(user.wishlist || []), productId]
      await user.save()
    }
    res.json({ success: true, message: "Added to wishlist", wishlist: user.wishlist })
  } catch (e) {
    res.status(500).json({ success: false, message: e.message })
  }
}

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ success: false, message: "User not found" })
    user.wishlist = (user.wishlist || []).filter((id) => id.toString() !== productId)
    await user.save()
    res.json({ success: true, message: "Removed from wishlist", wishlist: user.wishlist })
  } catch (e) {
    res.status(500).json({ success: false, message: e.message })
  }
}

module.exports = {
  register,
  optVerification,
  forgetPassword: verifyResetOtp,
  forgetPasswordOTP,
  login,
  editProfile,
  changePassword,
  getInfo,
  uploadProfilePicture,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  verifyResetOtp,
  resetPassword,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
}
