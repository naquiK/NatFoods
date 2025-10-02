const express = require("express")
const router = express.Router()

const { authMiddleware } = require("../middleware/auth-middleware")
const upload = require("../middleware/multer-middleware")
const {
  register,
  login,
  getInfo,
  editProfile,
  forgetPassword: verifyResetOtpLegacy,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  forgetPasswordOTP,
  verifyResetOtp,
  resetPassword,
  getWishlist, // import
  addToWishlist, // import
  removeFromWishlist, // import
} = require("../controllers/user-Conntroller")

// Public routes
router.post("/register", register)
router.post("/login", login)
router.post("/forgot-password", forgetPasswordOTP)
router.post("/verify-reset-otp", verifyResetOtp) // new
router.post("/reset-password", resetPassword) // new

// Protected routes
router.get("/profile", authMiddleware, getInfo)
router.put("/profile", authMiddleware, editProfile)
router.post("/profile/picture", authMiddleware, upload.single("profilePic"))

// Address routes
router.post("/addresses", authMiddleware, addAddress)
router.put("/addresses/:addressId", authMiddleware, updateAddress)
router.delete("/addresses/:addressId", authMiddleware, deleteAddress)
router.put("/addresses/:addressId/default", authMiddleware, setDefaultAddress)

// Wishlist routes
router.get("/wishlist", authMiddleware, getWishlist)
router.post("/wishlist/:productId", authMiddleware, addToWishlist)
router.delete("/wishlist/:productId", authMiddleware, removeFromWishlist)

module.exports = router
