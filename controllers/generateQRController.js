const crypto = require("crypto");
const generateQR = require("../models/generateQR");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const config = require("../config/config");
const uploadsFolder = path.join(__dirname, "../uploads");
const redis = require("../config/redisClient");
module.exports = {
  generateQR: async (req, res) => {
    try {
      const image = req.imageName;
      const mascot = req.body.mascot;
      const url = config.server_url + `/downloads/${image}`;
      const qrCodeImage = await QRCode.toDataURL(url);
      const filename = crypto.randomBytes(16).toString("hex") + ".png";
      const folderPath = path.join(uploadsFolder, "qrcodes");

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
        mascot,
      });
      await newQR.save();
      await redis.del("mascot_count");

      res.status(201).json({
        qrImageUrl: `${config.server_url}/api/qr-image/${filename}`,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getQR: async (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(uploadsFolder + "/qrcodes", filename);
      const image = fs.readFileSync(filePath);
      res.writeHead(200, { "Content-Type": "image/png" });
      res.end(image);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
};
