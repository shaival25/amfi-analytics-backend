const mongoose = require('mongoose');

const syncQueueSchema = new mongoose.Schema({
    operation: { type: String, enum: ['update', 'delete'], required: true },
    modelName: { type: String, required: true },
    document: { type: mongoose.Schema.Types.Mixed, required: true },
    synced: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    synced_at: { type: Date, default: null },
});

module.exports = mongoose.model('SyncQueue', syncQueueSchema);
