const mongoose = require("mongoose");

const BusSchema = new mongoose.Schema({
  busName: { type: String, required: true },
  macAddress: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

module.exports = mongoose.model("Bus", BusSchema);
