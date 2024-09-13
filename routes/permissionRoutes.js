const express = require("express");
const router = express.Router();
const permissionController = require("../controllers/permissionController");
const authenticate = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

// Get permissions
router.get(
  "/permissions",
  // authenticate,
  // checkPermission("permissions:read"),
  permissionController.getPermissionsWithTypes
);

module.exports = router;
