const mongoose = require("mongoose");

const userAnalyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: "BnyGeneral", required: true },
  emailSent: { type: Boolean, default: false },
  journeyStarted: { type: Date, default: null },
  journeyEnded: { type: Date, default: null },
  journeyDuration: { type: Number, default: null },
  goalSelected: { type: String, default: null },
  stepsCompleted: { type: Number, required: true, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

module.exports = mongoose.model("UserAnalytics", userAnalyticsSchema);
