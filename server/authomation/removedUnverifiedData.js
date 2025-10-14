const cron = require("node-cron")
const User = require("../model/userModel")

module.exports = () => {
  cron.schedule("*/30 * * * *", async () => {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000) // minus, not plus
      const result = await User.deleteMany({
        isVerified: false, // correct field from user model
        isAdmin: { $ne: true }, // never delete admins
        createdAt: { $lt: thirtyMinutesAgo }, // really older than 30 mins
        $or: [
          // only accounts still in verification flow
          { verificationCode: { $exists: true, $ne: "" } },
          { verificationToken: { $exists: true, $ne: "" } },
        ],
      })
      console.log("cleanup unverified users deleted:", result?.deletedCount || 0)
    } catch (err) {
      console.log("cleanup unverified users error:", err?.message)
    }
  })
}
