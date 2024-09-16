const QRCode = require("qrcode");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const formidable = require("formidable");
const BusController = require("../controllers/busController");
const generateQR = require("../models/generateQR");
const redis = require("../config/redisClient");
const config = require("../config/config");

exports.uploadImage = async (req, res) => {
  console.log("here");
  const form = new formidable.IncomingForm({
    keepExtensions: true, // Keep file extensions
    uploadDir: path.join(__dirname, "../temp"), // Relative path for temporary file upload
    filename: (name, ext, part, form) => {
      // Generate random filename with the same extension
      return crypto.randomBytes(16).toString("hex") + ext;
    },
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "File upload failed", details: err });
    }

    const macAddress = fields.macAddress; // Extract macAddress from body
    if (!macAddress) {
      return res.status(400).json({ error: "macAddress is required" });
    }

    try {
      // Get the bus name dynamically using the provided macAddress
      const busName = await BusController.getBusName(macAddress);
      if (!busName) {
        return res
          .status(400)
          .json({ error: "Bus name not found for macAddress" });
      }

      const uploadsFolder = path.join(
        __dirname,
        `../uploads/${busName}/photo-booth-images`
      );

      // Ensure the upload directory exists
      if (!fs.existsSync(uploadsFolder)) {
        fs.mkdirSync(uploadsFolder, { recursive: true });
      }

      // Access the single file with the field name 'image'
      const fileArray = files.image; // This is an array
      if (fileArray && fileArray.length > 0) {
        const file = fileArray[0];
        if (file.filepath) {
          const fileExt = path.extname(file.originalFilename);
          const newFilename = crypto.randomBytes(16).toString("hex") + fileExt;
          const newPath = path.join(uploadsFolder, newFilename);

          try {
            fs.renameSync(file.filepath, newPath); // Move the file to the new location
            file.newFilename = newFilename; // Update filename
          } catch (moveError) {
            console.error("Error moving file:", moveError);
            return res
              .status(500)
              .json({ error: "Error moving file", details: moveError });
          }
          const image = file.newFilename;
          const url =
            config.server_url + `/downloads/${image}/${fields.macAddress[0]}`;
          const qrCodeImage = await QRCode.toDataURL(url);
          const filename = crypto.randomBytes(16).toString("hex") + ".png";
          const qrFolderPath = path.join(__dirname, "../uploads");
          const folderPath = path.join(qrFolderPath, "qrcodes");

          if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
          }

          const filePath = path.join(folderPath, filename);
          fs.writeFileSync(
            filePath,
            Buffer.from(qrCodeImage.split(",")[1], "base64")
          );

          let newQR = new generateQR({
            originalImageUrl: image,
            qrImageUrl: filename,
            mascot: fields.mascot[0],
            macAddress: fields.macAddress[0],
          });
          await newQR.save();
          await redis.del("mascot_count");

          res.status(201).json({
            qrImageUrl: `${config.server_url}/api/qr-image/${filename}`,
          });
        } else {
          return res.status(400).json({ error: "File data is missing" });
        }
      } else {
        return res.status(400).json({ error: "No files uploaded" });
      }
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ error: "An error occurred", details: err });
    }
  });
};
