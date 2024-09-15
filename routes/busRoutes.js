const express = require("express");
const router = express.Router();
const busController = require("../controllers/busController");
const authenticate = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.get(
  "/",
  authenticate,
  checkPermission("analytics:read"),
  busController.getAllBuses
);
module.exports = router;
