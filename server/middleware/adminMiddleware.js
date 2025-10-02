const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    // Fast path for classic admins
    if (req.user.isAdmin === true) {
      return next()
    }

    // Role-based staff (e.g., Moderator) with permission: dashboard.view
    try {
      if (!req.user.role || typeof req.user.role === "string") {
        await req.user.populate("role")
      }
      const canViewDashboard =
        req.user.role &&
        req.user.role.permissions &&
        req.user.role.permissions.dashboard &&
        req.user.role.permissions.dashboard.view === true

      if (canViewDashboard) {
        return next()
      }
    } catch (e) {
      // ignore, will fall through to 403
    }

    return res.status(403).json({
      success: false,
      message: "Admin or Moderator access required",
    })
  } catch (error) {
    console.error("Admin middleware error:", error)
    res.status(500).json({
      success: false,
      message: "Server error in admin middleware",
      error: error.message,
    })
  }
}

module.exports = { adminMiddleware }
