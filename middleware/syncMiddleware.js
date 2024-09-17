const { addToQueue } = require('../services/syncQueue');

module.exports = function (schema, atlasModelName) {
    schema.post('save', function (doc) {
        addToQueue('update', atlasModelName, doc.toObject());
    });

    schema.post('remove', function (doc) {
        addToQueue('delete', atlasModelName, doc.toObject());
    });
};
