const mongoose = require("mongoose");

const personCounterSchema = new mongoose.Schema({
  counter: { type: Number, required: true },
  macAddress: { type: String, ref: "Bus", required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

module.exports = mongoose.model("PersonCounter", personCounterSchema);
