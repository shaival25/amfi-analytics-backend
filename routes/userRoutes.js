const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticate = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.post(
  "/register",
  authenticate,
  checkPermission("users:write"),
  userController.register
);
router.post("/login", userController.login);
router.get(
  "/",
  authenticate,
  checkPermission("users:read"),
  userController.getUsers
);
router.delete(
  "/:userId",
  authenticate,
  checkPermission("users:delete"),
  userController.deleteUser
);

router.get(
  "/:userId",
  authenticate,
  checkPermission("users:read"),
  userController.getUserById
);

router.put(
  "/:userId",
  authenticate,
  checkPermission("users:update"),
  userController.updateUser
);
module.exports = router;
