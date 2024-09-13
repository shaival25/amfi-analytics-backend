const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const authenticate = require("../middleware/authMiddleware");
const checkRole = require("../middleware/permissionMiddleware");

router.get(
  "/live-count/:range",
  authenticate,
  checkRole(["analytics:read"]),
  analyticsController.getCountByRange
);
router.get(
  "/mascot-count",
  authenticate,
  checkRole(["analytics:read"]),
  analyticsController.getMascotCount
);

router.get(
  "/full-count",
  authenticate,
  checkRole(["analytics:read"]),
  analyticsController.getFaceDetectionCount
);

router.get("/person-count", analyticsController.getPersonCount);
module.exports = router;
