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

router.post(
  "/goals-selected",
  authenticate,
  checkRole(["analytics:read"]),
  analyticsController.getGoals
);

router.post(
  "/user-interactions",
  // authenticate,
  // checkRole(["analytics:read"]),
  analyticsController.getUserInteraction
);

router.post(
  "/feedback-insights",
  // authenticate,
  // checkRole(["analytics:read"]),
  analyticsController.getFeedbackInsights
);
module.exports = router;
