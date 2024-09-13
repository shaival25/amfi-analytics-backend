const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const BusController = require("../controllers/busController");
const config = require("../config/config");

// Setup storage for images with encrypted filenames
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const busName = await BusController.getBusName(config.macAddress); // Get the bus name dynamically
      const uploadsFolder = path.join(
        __dirname,
        `../uploads/${busName}/photo-booth-images`
      );

      // Check if the directory exists, if not create it
      if (!fs.existsSync(uploadsFolder)) {
        fs.mkdirSync(uploadsFolder, { recursive: true }); // Create folder recursively
      }

      cb(null, uploadsFolder);
    } catch (err) {
      cb(err, null);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = crypto.randomBytes(16).toString("hex") + ext;
    req.imageName = filename;
    cb(null, filename);
  },
});

const upload = multer({ storage });

exports.uploadImage = upload.single("image"); // Middleware for handling image uploads
