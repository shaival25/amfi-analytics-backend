const mongoose = require("mongoose");
const config = require("../config/config");

const sipCalcSchema = new mongoose.Schema({
  goalAmount: { type: Number, required: true },
  investmentDuration: { type: Number, required: true }, // In years
  expectedROR: { type: Number, required: true }, // Expected rate of return
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

module.exports = mongoose.model("SipCalc", sipCalcSchema);
