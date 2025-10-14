const cloudinary = require("cloudinary").v2
const fs = require("fs")

// Provide a sensible default for cloud name to avoid unconfigured errors in development
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME || "dv2armexn"
const CLOUD_API_KEY = process.env.CLOUDINARY_API_KEY || process.env.CLOUD_KEY || process.env.CLOUDINARY_KEY
const CLOUD_API_SECRET = process.env.CLOUDINARY_API_SECRET || process.env.CLOUD_SECRET || process.env.CLOUDINARY_SECRET

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_API_SECRET,
})

const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "eKart",
    })

    // Delete the local file after upload
    fs.unlinkSync(filePath)

    return {
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error) {
    // Delete the local file if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    throw error
  }
}

module.exports = { uploadImage, cloudinary }
