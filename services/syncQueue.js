const SyncQueue = require('../models/syncQueue');
async function addToQueue(operation, modelName, document) {
    try {
        await SyncQueue.create({
            operation,
            modelName,
            document,
        });
        console.log(`Added ${operation} operation to the sync queue for model: ${modelName}`);
    } catch (error) {
        console.error('Error adding operation to sync queue:', error);
    }
}
async function getUnsyncedOperations() {
    return await SyncQueue.find({ synced: false }).sort({ createdAt: 1 }).exec();
} async function markAsSynced(queueId) {
    await SyncQueue.findByIdAndUpdate(queueId, { synced: true, synced_at: new Date() });
}

module.exports = { addToQueue, getUnsyncedOperations, markAsSynced };
