const mongoose = require("mongoose");
const config = require("../config/config");

const FaceDetectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  email: { type: String, required: true },
  counter: { type: Number, required: true },
  gender: { type: String, required: true },
  image: { type: String, required: true },
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

module.exports = mongoose.model("FaceDetection", FaceDetectionSchema);
