const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const checkRole = require("../middleware/permissionMiddleware");
const bnyGeneralController = require("../controllers/bnyGeneralController");

router.get(
  "/",
  authenticate,
  checkRole(["bnyGeneral:read"]),
  bnyGeneralController.getBnyGeneral
);

router.delete(
  "/",
  authenticate,
  checkRole(["bnyGeneral:delete"]),
  bnyGeneralController.deleteBnyGeneral
);

router.get(
  "/view/:filename/:macAddress",
  authenticate,
  checkRole(["bnyGeneral:read"]),
  bnyGeneralController.getImages
);

module.exports = router;
