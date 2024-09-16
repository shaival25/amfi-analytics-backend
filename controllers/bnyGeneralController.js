const BnyGeneral = require("../models/bnyGeneral");
const path = require("path");
const uploadsFolder = path.join(__dirname, "../uploads");
const fs = require("fs");
const BusController = require("./busController");

exports.getBnyGeneral = async (req, res) => {
  try {
    const bnyGenerals = await BnyGeneral.find({ deleted_at: null });
    const modifiedBnyGenerals = bnyGenerals.map((fd) => {
      return {
        ...fd._doc,
        image: `/api/bnyGeneral/view/${fd.image}/${fd.macAddress}`,
      };
    });
    res.status(200).json(modifiedFaceDetections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getImages = async (req, res) => {
  const filename = req.params.filename;
  const macAddress = req.params.macAddress;
  const busName = await BusController.getBusName(macAddress);
  const filePath = path.join(
    uploadsFolder + `/${busName}/face-detection-images`,
    filename
  );

  try {
    const image = fs.readFileSync(filePath);
    res.writeHead(200, { "Content-Type": "image/png" });
    res.end(image);
  } catch (err) {
    if (err.code === "ENOENT") {
      res.status(404).json({ message: "Image not found" });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
};

exports.deleteBnyGeneral = async (req, res) => {
  try {
    const { selectedRows } = req.body;

    await BnyGeneral.updateMany(
      { _id: { $in: selectedRows } },
      { $set: { deleted_at: Date.now() } }
    );
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
