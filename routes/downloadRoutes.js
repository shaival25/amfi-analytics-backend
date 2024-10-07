const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const checkRole = require("../middleware/permissionMiddleware");
const downloadController = require("../controllers/donwloadImageController");
router.get("/:filename/:macAddress", downloadController.downloadImages);

router.get(
  "/user-data",
  authenticate,
  checkRole(["bnyGeneral:read"]),
  downloadController.getUserData
);

module.exports = router;
