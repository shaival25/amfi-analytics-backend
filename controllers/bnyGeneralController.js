const BnyGeneral = require("../models/bnyGeneral");
const path = require("path");
const uploadsFolder = path.join(__dirname, "../uploads");
const fs = require("fs");
const BusController = require("./busController");

exports.getBnyGeneral = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 20; // Default to 20 documents per page
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    const bnyGenerals = await BnyGeneral.find({ deleted_at: null })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit); // Apply pagination

    const modifiedBnyGenerals = bnyGenerals.map(async (fd) => {
      const busName = await BusController.getBusName(fd.macAddress);
      const createdDate = new Date(fd.created_at).toLocaleString("en-IN", {
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

    const totalDocuments = await BnyGeneral.countDocuments({
      deleted_at: null,
    }); // Get total count of documents
    const totalPages = Math.ceil(totalDocuments / limit); // Calculate total pages

    res.status(200).json({
      data: resolvedModifiedBnyGenerals,
      currentPage: page,
      totalPages,
      totalDocuments,
    });
  } catch (err) {
    console.log(err);
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

exports.searchBnyGeneral = async (req, res) => {
  try {
    const { searchText } = req.body;
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 20; // Default to 20 documents per page
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    const query = {
      deleted_at: null,
    };
    if (searchText) {
      if (!isNaN(searchText)) {
        query.$or = [{ contactNumber: parseInt(searchText) }];
      } else {
        // If it's a string, search in fullName and email
        query.$or = [
          { fullName: { $regex: searchText, $options: "i" } },
          { email: { $regex: searchText, $options: "i" } },
        ];
      }
    }

    // Check if searchText is a number or a string

    const bnyGenerals = await BnyGeneral.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit); // Apply pagination

    const modifiedBnyGenerals = bnyGenerals.map(async (fd) => {
      const busName = await BusController.getBusName(fd.macAddress);
      const createdDate = new Date(fd.created_at).toLocaleString("en-IN", {
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
    const totalDocuments = await BnyGeneral.countDocuments({
      ...query,
      deleted_at: null,
    });

    const resolvedModifiedBnyGenerals = await Promise.all(modifiedBnyGenerals);
    const totalPages = Math.ceil(totalDocuments / limit); // Calculate total pages

    res.status(200).json({
      data: resolvedModifiedBnyGenerals,
      currentPage: page,
      totalPages,
      totalDocuments,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
