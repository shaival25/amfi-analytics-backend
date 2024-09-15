const mongoose = require("mongoose");
const config = require("../config/config");

const bnyGeneralSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gender: { type: String, required: true },
  dob: { type: String, required: true },
  contactNumber: { type: Number, required: true, length: 10 },
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

module.exports = mongoose.model("BnyGeneral", bnyGeneralSchema);
