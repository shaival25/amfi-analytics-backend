const path = require("path");
const fs = require("fs");
const BusController = require("../controllers/busController");
const config = require("../config/config");

exports.downloadImages = async (req, res) => {
  const { filename } = req.params;
  const busName = await BusController.getBusName(config.macAddress); // Get the bus name dynamically
  const uploadsFolder = path.join(
    __dirname,
    `../uploads/${busName}/photo-booth-images`
  );
  const filePath = path.join(uploadsFolder, filename);
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error("Image expired!!");
    }
    res.download(filePath);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
