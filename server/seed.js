import mongoose from "mongoose"
import bcrypt from "bcryptjs"

// CJS models export via module.exports => default import works in ESM
import Product from "../server/model/product-model.js"
import User from "../server/model/userModel.js"

// Use same connection as the app (fallback to app’s hardcoded URI if env is missing)
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://nknaqui72:FzdPhKosvnnW36AK@cluster0.bppdevl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

async function ensureUser({ name, email, password, isAdmin = false }) {
  let user = await User.findOne({ email })
  if (!user) {
    const hashed = await bcrypt.hash(password, 10)
    user = await User.create({
      name,
      email,
      password: hashed,
      isAdmin,
      isVerified: true,
    })
    console.log(`[seed] Created user: ${email}${isAdmin ? " (admin)" : ""}`)
  } else {
    console.log(`[seed] User exists: ${email}`)
  }
  return user
}

async function ensureProduct(p) {
  const existing = await Product.findOne({ name: p.name })
  if (existing) {
    console.log(`[seed] Product exists: ${p.name}`)
    return existing
  }
  const created = await Product.create(p)
  console.log(`[seed] Created product: ${p.name}`)
  return created
}

async function run() {
  try {
    console.log("[seed] connecting to MongoDB...")
    await mongoose.connect(MONGODB_URI)
    console.log("[seed] connected")

    // Users
    await ensureUser({ name: "Admin", email: "admin@natfood.local", password: "Admin@123", isAdmin: true })
    await ensureUser({ name: "Alice", email: "alice@natfood.local", password: "Password@123" })
    await ensureUser({ name: "Bob", email: "bob@natfood.local", password: "Password@123" })

    // Products (basic shape compatible with product-model: name, description, category, price, stock, brand, images)
    const products = [
      {
        name: "Whole Wheat Flour 5kg",
        description: "Stone-ground whole wheat atta for soft, nutritious rotis.",
        category: "Flour",
        brand: "NatFood",
        price: 320,
        stock: 200,
        images: [{ url: "/whole-wheat-flour.png", public_id: "seed_flour_1" }],
      },
      {
        name: "Besan (Gram Flour) 1kg",
        description: "Premium gram flour ideal for savory snacks and sweets.",
        category: "Flour",
        brand: "NatFood",
        price: 120,
        stock: 300,
        images: [{ url: "/besan-gram-flour.jpg", public_id: "seed_flour_2" }],
      },
      {
        name: "Toor Dal 1kg",
        description: "Polished split pigeon peas, rich in protein.",
        category: "Pulses",
        brand: "NatFood",
        price: 180,
        stock: 250,
        images: [{ url: "/toor-dal.png", public_id: "seed_pulse_1" }],
      },
      {
        name: "Chana Dal 1kg",
        description: "Split Bengal gram with uniform grains.",
        category: "Pulses",
        brand: "NatFood",
        price: 150,
        stock: 220,
        images: [{ url: "/chana-dal.jpg", public_id: "seed_pulse_2" }],
      },
      {
        name: "Sunflower Oil 1L",
        description: "Refined sunflower oil for everyday cooking.",
        category: "Edible Oil",
        brand: "NatFood",
        price: 160,
        stock: 350,
        images: [{ url: "/sunflower-oil.png", public_id: "seed_oil_1" }],
      },
      {
        name: "Mustard Oil 1L",
        description: "Cold-pressed mustard oil with authentic aroma.",
        category: "Edible Oil",
        brand: "NatFood",
        price: 190,
        stock: 300,
        images: [{ url: "/mustard-oil.jpg", public_id: "seed_oil_2" }],
      },
    ]

    for (const p of products) {
      await ensureProduct(p)
    }

    console.log("[seed] done")
    process.exit(0)
  } catch (err) {
    console.error("[seed] error:", err)
    process.exit(1)
  }
}

run()
