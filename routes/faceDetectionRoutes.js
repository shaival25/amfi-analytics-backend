const express = require("express");
const router = express.Router();
const faceDetectionController = require("../controllers/faceDetectionController");
const authenticate = require("../middleware/authMiddleware");
const checkRole = require("../middleware/permissionMiddleware");

// Apply role-based authentication middleware dynamically

router.get(
  "/",
  authenticate,
  checkRole(["faceDetection:read"]),
  faceDetectionController.getFaceDetections
);

router.delete(
  "/",
  authenticate,
  checkRole(["faceDetection:delete"]),
  faceDetectionController.deleteFaceDetection
);

router.get(
  "/view/:filename/:macAddress",
  // authenticate,
  // checkRole(["faceDetection:read"]),
  faceDetectionController.getImages
);

module.exports = router;
