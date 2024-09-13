const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissionType: { type: String, required: true },
  description: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

module.exports = mongoose.model("Permission", PermissionSchema);
