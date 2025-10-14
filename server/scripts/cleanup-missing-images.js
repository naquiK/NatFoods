#!/usr/bin/env node
/**
 * scripts/cleanup-missing-images.js
 *
 * Scans `products` collection for image public_ids and checks Cloudinary for existence.
 * Usage:
 *   node scripts/cleanup-missing-images.js         # dry-run (report only)
 *   node scripts/cleanup-missing-images.js --remove  # remove dangling image entries from products
 *
 * Ensure your .env or environment contains MONGO_URI (or DATABASE_URL) and CLOUDINARY_* vars.
 */

const mongoose = require('mongoose')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const Product = require('../model/product-model')
const { cloudinary } = require('../config/cloudinary')

const MONGO = process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.MONGO_URL
if (!MONGO) {
  console.error('Missing Mongo connection string. Set MONGO_URI or DATABASE_URL in environment or .env')
  process.exit(1)
}

async function checkResource(publicId) {
  try {
    // cloudinary.api.resource will throw if resource not found
    const res = await cloudinary.api.resource(publicId)
    if (res && res.public_id) return true
    return false
  } catch (err) {
    // If Cloudinary returns an HTTP error for not found, treat as missing
    return false
  }
}

;(async () => {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  console.log('Connected to mongo')

  const removeMode = process.argv.includes('--remove')
  const products = await Product.find().lean()
  const dangling = []

  for (const p of products) {
    const images = Array.isArray(p.images) ? p.images : []
    for (const img of images) {
      const pub = img.public_id || img.publicId || img.filename
      if (!pub) continue
      const exists = await checkResource(pub)
      if (!exists) {
        dangling.push({ productId: p._id.toString(), public_id: pub })
      }
    }
  }

  console.log(`Found ${dangling.length} dangling image refs.`)
  if (dangling.length > 0) console.table(dangling.slice(0, 200))

  if (removeMode && dangling.length) {
    console.log('Removing dangling refs from products...')
    for (const d of dangling) {
      try {
        await Product.updateOne(
          { _id: d.productId },
          { $pull: { images: { public_id: d.public_id } } }
        )
        console.log('Removed', d.public_id, 'from product', d.productId)
      } catch (err) {
        console.error('Failed to remove', d, err && err.message)
      }
    }
    console.log('Removal complete')
  } else if (dangling.length) {
    console.log('Run with --remove to remove these entries from DB')
  }

  await mongoose.disconnect()
  process.exit(0)
})().catch((err) => {
  console.error('Script failed:', err && err.message)
  process.exit(2)
})
