const mongoose = require("mongoose")

const settingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      required: true,
      default: "eKart Store",
    },
    siteDescription: {
      type: String,
      default: "Your premium online shopping destination",
    },
    logo: {
      url: String,
      public_id: String,
    },
    favicon: {
      url: String,
      public_id: String,
    },
    contactInfo: {
      email: String,
      phone: String,
      address: String,
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    theme: {
      primaryColor: {
        type: String,
        default: "#000000",
      },
      secondaryColor: {
        type: String,
        default: "#f5f5f0",
      },
      accentColor: {
        type: String,
        default: "#8b7355",
      },
    },
    features: {
      enableReviews: {
        type: Boolean,
        default: true,
      },
      enableWishlist: {
        type: Boolean,
        default: true,
      },
      enableChat: {
        type: Boolean,
        default: false,
      },
    },
    shipping: {
      freeShippingThreshold: {
        type: Number,
        default: 50,
      },
      standardShippingCost: {
        type: Number,
        default: 5,
      },
    },
    homepageTaglines: {
      type: [String],
      default: [
        "Nature's Best, Delivered to Your Doorstep.",
        "Simple, Organic Goodness. No Chemicals.",
        "Prepared On-Demand.",
      ],
    },
    homepageAbout: {
      type: String,
      default:
        "Nat-Organics, as the name suggests, stands for Natural and Organic foods. We are a team of passionate people who have worked with naturalists and organic harvesters to discover methods, foods, and ingredients that boost energy, health, and nutrition. We're dedicated to helping you and your family achieve a healthy mind and body. We assure you that every order will enrich your nourishment and improve your well-being.",
    },
    homepageCategories: {
      type: [String],
      default: ["Flour", "Pulses", "Edible Oil"],
    },
  },
  {
    timestamps: true,
  },
)

// Ensure only one settings document exists
settingsSchema.statics.getSiteSettings = async function () {
  let settings = await this.findOne()
  if (!settings) {
    settings = await this.create({})
  }
  return settings
}

const Settings = mongoose.model("Settings", settingsSchema)

module.exports = Settings
