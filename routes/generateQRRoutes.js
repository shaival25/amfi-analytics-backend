const express = require("express");
const router = express.Router();
const generateQRController = require("../controllers/generateQRController");
const uploadImage = require("../middleware/uploadPBImageMiddleware");

// Generate QR code
router.post(
  "/generate-qr",
  uploadImage.uploadImage,
  generateQRController.generateQR
);
router.get("/qr-image/:filename", generateQRController.getQR);
module.exports = router;
