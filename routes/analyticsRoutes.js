const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const authenticate = require("../middleware/authMiddleware");
const checkRole = require("../middleware/permissionMiddleware");

router.post(
  "/live-count/:range",
  authenticate,
  checkRole(["analytics:read"]),
  analyticsController.getCountByRange
);
router.post(
  "/mascot-count",
  authenticate,
  checkRole(["analytics:read"]),
  analyticsController.getMascotCount
);

router.post(
  "/full-count",
  authenticate,
  checkRole(["analytics:read"]),
  analyticsController.getFaceDetectionCount
);

router.post(
  "/person-count",
  authenticate,
  checkRole(["analytics:read"]),
  analyticsController.getPersonCount
);

router.post(
  "/feedback-count",
  authenticate,
  checkRole(["analytics:read"]),
  analyticsController.getFeedbackCount
);

module.exports = router;
