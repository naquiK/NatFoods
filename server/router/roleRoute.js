const express = require("express")
const router = express.Router()
const Role = require("../model/role-model")
const User = require("../model/userModel")
const { authMiddleware } = require("../middleware/auth-middleware")
const { adminMiddleware } = require("../middleware/adminMiddleware")
const { checkPermission } = require("../middleware/permission-middleware")

// Apply auth middleware to all routes
router.use(authMiddleware)

// Get all roles
router.get("/", checkPermission("roles", "view"), async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 })
    res.json({ success: true, roles })
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// Get single role
router.get("/:id", checkPermission("roles", "view"), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" })
    }
    res.json({ success: true, role })
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// Create new role
router.post("/", checkPermission("roles", "create"), async (req, res) => {
  try {
    const { name, description, permissions } = req.body

    // Check if role already exists
    const existingRole = await Role.findOne({ name })
    if (existingRole) {
      return res.status(400).json({ success: false, message: "Role with this name already exists" })
    }

    const role = await Role.create({
      name,
      description,
      permissions,
      isSystem: false,
    })

    res.status(201).json({ success: true, message: "Role created successfully", role })
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// Update role
router.put("/:id", checkPermission("roles", "update"), async (req, res) => {
  try {
    const { name, description, permissions, isActive } = req.body

    const role = await Role.findById(req.params.id)
    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" })
    }

    // Prevent editing system roles
    if (role.isSystem) {
      return res.status(403).json({ success: false, message: "Cannot edit system roles" })
    }

    // Update fields
    if (name) role.name = name
    if (description !== undefined) role.description = description
    if (permissions) role.permissions = permissions
    if (isActive !== undefined) role.isActive = isActive

    await role.save()

    res.json({ success: true, message: "Role updated successfully", role })
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// Delete role
router.delete("/:id", checkPermission("roles", "delete"), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" })
    }

    // Prevent deleting system roles
    if (role.isSystem) {
      return res.status(403).json({ success: false, message: "Cannot delete system roles" })
    }

    // Check if any users have this role
    const usersWithRole = await User.countDocuments({ role: role._id })
    if (usersWithRole > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role. ${usersWithRole} user(s) are assigned to this role`,
      })
    }

    await role.deleteOne()

    res.json({ success: true, message: "Role deleted successfully" })
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// Assign role to user
router.post("/assign", checkPermission("roles", "update"), async (req, res) => {
  try {
    const { userId, roleId } = req.body

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    const role = await Role.findById(roleId)
    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" })
    }

    if (!role.isActive) {
      return res.status(400).json({ success: false, message: "Cannot assign inactive role" })
    }

    user.role = roleId
    await user.save()

    res.json({ success: true, message: "Role assigned successfully", user })
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// Remove role from user
router.post("/unassign", checkPermission("roles", "update"), async (req, res) => {
  try {
    const { userId } = req.body

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    user.role = null
    await user.save()

    res.json({ success: true, message: "Role removed successfully", user })
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// Initialize default roles
router.post("/initialize", adminMiddleware, async (req, res) => {
  try {
    await Role.getAdminRole()
    await Role.getModeratorRole()

    res.json({ success: true, message: "Default roles initialized successfully" })
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

module.exports = router
