const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const { cloudinary } = require("../config/cloudinary")

// Configure Cloudinary storage for multer using the centrally configured cloudinary instance
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ekart",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov"],
    transformation: [{ width: 1200, height: 1200, crop: "limit", quality: "auto" }],
  },
})

const DEFAULT_MAX = 10 * 1024 * 1024
const MAX_FILE_SIZE = Number(process.env.UPLOAD_MAX_FILE_SIZE || process.env.MAX_UPLOAD_SIZE || DEFAULT_MAX)

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE, // configurable limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "video/mp4", "video/mov"]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type. Only images and videos are allowed."), false)
    }
  },
})

module.exports = { upload, cloudinary }
