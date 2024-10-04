const BnyGeneral = require("../models/bnyGeneral");
const path = require("path");
const uploadsFolder = path.join(__dirname, "../uploads");
const fs = require("fs");
const BusController = require("./busController");

exports.getBnyGeneral = async (req, res) => {
  try {
    const bnyGenerals = await BnyGeneral.find({ deleted_at: null }).sort({
      created_at: -1,
    });
    const modifiedBnyGenerals = bnyGenerals.map(async (fd) => {
      const busName = await BusController.getBusName(fd.macAddress);
      const createdDate = new Date(fd.created_at).toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return {
        ...fd._doc,
        busName,
        date: createdDate,
        image: `/api/bnyGeneral/view/${fd.image}/${fd.macAddress}`,
      };
    });
    const resolvedModifiedBnyGenerals = await Promise.all(modifiedBnyGenerals);
    res.status(200).json(resolvedModifiedBnyGenerals);
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
    const contentType = filename.endsWith(".png") ? "image/png" : "image/jpeg";
    res.writeHead(200, { "Content-Type": contentType });
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
