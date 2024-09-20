const express = require("express");
const router = express.Router();
const checkRole = require("../middleware/permissionMiddleware");
const heatMapController = require("../controllers/heatMapController");
const authenticate = require("../middleware/authMiddleware");

router.post(
  "/",
  authenticate,
  checkRole(["analytics:read"]),
  heatMapController.getHeatMap
);

module.exports = router;
