const express = require("express");
const router = express.Router();
const downloadController = require("../controllers/donwloadImageController");
router.get("/:filename", downloadController.downloadImages);

module.exports = router;
