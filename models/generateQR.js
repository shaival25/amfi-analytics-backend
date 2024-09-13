const mongoose = require("mongoose");
const config = require("../config/config");

const generateQRSchema = new mongoose.Schema({
  originalImageUrl: { type: String, required: true }, // Store the filename of the image
  qrImageUrl: { type: String, required: true },
  mascot: { type: Number, required: true },
  macAddress: {
    type: String,
    ref: "Bus",
    required: true,
    default: config.macAddress,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

module.exports = mongoose.model("GenerateQR", generateQRSchema);
