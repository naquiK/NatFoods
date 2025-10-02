const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      // Super admin bypass (always allow if isAdmin === true)
      if (req.user?.isAdmin === true) {
        return next()
      }

      // Populate role if not already populated
      if (!req.user.role || typeof req.user.role === "string") {
        await req.user.populate("role")
      }

      // Check if user has the required permission
      if (req.user.role && req.user.role.permissions && req.user.role.permissions[resource]) {
        if (req.user.role.permissions[resource][action] === true) {
          return next()
        }
      }

      return res.status(403).json({
        success: false,
        message: `You do not have permission to ${action} ${resource}`,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error checking permissions",
        error: error.message,
      })
    }
  }
}

module.exports = { checkPermission }
