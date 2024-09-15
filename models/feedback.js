const mongoose = require("mongoose");
const config = require("../config/config");

const feedbackSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    enum: ["excellent", "good", "average", "poor"], // Restrict the options to these values
    required: true,
  },
  macAddress: {
    type: String,
    ref: "Bus",
    required: true,
    default: config.macAddress,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
});

exports.Feedback = mongoose.model("Feedback", feedbackSchema);
