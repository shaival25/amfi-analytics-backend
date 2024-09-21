const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const uploadController = require('../controllers/uploadController');
const verifyApiSecret = require('../middleware/verifyApiSecret');
const router = express.Router();

// Multer memory storage - Use memory storage since we manually handle writing in the controller
const storage = multer.memoryStorage();

// Set up multer with memory storage
const upload = multer({ storage: storage });

// POST route to sync file to the server
router.post('/sync', verifyApiSecret, upload.single('file'), uploadController.syncFile);
router.delete('/delete', verifyApiSecret, uploadController.deleteFile);



module.exports = router;
