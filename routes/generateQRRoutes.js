const express = require("express");
const router = express.Router();
const generateQRController = require("../controllers/generateQRController");
const uploadImageObj = require("../middleware/uploadPBImageMiddleware");

// Generate QR code
router.post("/generate-qr", uploadImageObj.uploadImage);
router.get("/qr-image/:filename/", generateQRController.getQR);
module.exports = router;
