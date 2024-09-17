const { getUnsyncedOperations, markAsSynced } = require('./syncQueue');
const atlasDB = require('../config/atlasDB'); // Atlas connection
const { checkInternet } = require('../helpers/internetHelper'); // Import the new internet check function

// Function to sync a document to MongoDB Atlas
async function syncDocumentToAtlas(atlasModel, localDoc) {
    try {
        await atlasModel.updateOne(
            { _id: localDoc._id },
            localDoc,
            { upsert: true }
        );
        console.log(`Synced document with _id: ${localDoc._id} to Atlas.`);
    } catch (error) {
        console.error('Failed to sync document to Atlas:', error);
        throw error;
    }
}

// Function to delete a document from MongoDB Atlas
async function deleteDocumentFromAtlas(atlasModel, localDoc) {
    try {
        await atlasModel.deleteOne({ _id: localDoc._id });
        console.log(`Deleted document with _id: ${localDoc._id} from Atlas.`);
    } catch (error) {
        console.error('Failed to delete document from Atlas:', error);
        throw error;
    }
}

// Function to process the sync queue
async function processSyncQueue() {
    const unsyncedOperations = await getUnsyncedOperations();
    const isOnline = await checkInternet();

    if (isOnline && unsyncedOperations.length > 0) {
        console.log('Started Syncing queued operations to Atlas...');
        for (const queueItem of unsyncedOperations) {
            const { operation, modelName, document, _id } = queueItem;
            const atlasModel = atlasDB.model(modelName, document.schema);

            try {
                if (operation === 'update') {
                    await syncDocumentToAtlas(atlasModel, document);
                } else if (operation === 'delete') {
                    await deleteDocumentFromAtlas(atlasModel, document);
                }
                await markAsSynced(_id);
            } catch (error) {
                console.error('Error during sync operation:', error);
            }
        }
    } else {
        console.log('Offline or no operations to sync.');
    }
}

module.exports = { processSyncQueue };
