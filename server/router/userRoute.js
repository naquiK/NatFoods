const express = require("express")
const router = express.Router()

const { authMiddleware } = require("../middleware/auth-middleware")


const upload = require("../middleware/multer-middleware")
const { adminMiddleware } = require("../middleware/adminMiddleware")
const { register } = require("module")
const { login, getInfo, editProfile } = require("../controllers/user-Conntroller")


// Public routes
router.post("/register", register)
router.post("/login", login)

// Protected routes
router.get("/profile", authMiddleware, getInfo)
router.put("/profile", authMiddleware, editProfile)
router.post("/profile/picture", authMiddleware, upload.single("profilePic"), uploadProfilePicture)

// Address routes
router.post("/addresses", authMiddleware, addAddress)
router.put("/addresses/:addressId", authMiddleware, updateAddress)
router.delete("/addresses/:addressId", authMiddleware, deleteAddress)
router.put("/addresses/:addressId/default", authMiddleware, setDefaultAddress)



module.exports = router
