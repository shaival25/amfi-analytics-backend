const mongoose = require("mongoose");

const userAnalyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: "BnyGeneral", required: true },
  journeyDuration: { type: Number, required: true },
  goalSelected: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});
