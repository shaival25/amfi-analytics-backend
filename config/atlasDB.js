const mongoose = require('mongoose');
const config = require('./config');

const atlasConnection = mongoose.createConnection(config.atlasURI, {});

atlasConnection.on('error', (err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
});

atlasConnection.once('open', () => {
    console.log('Successfully connected to MongoDB Atlas');
});

module.exports = atlasConnection;
