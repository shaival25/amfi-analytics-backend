const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const https = require("https");
const config = require("./config/config");
const connectDB = require("./config/database");
require("./config/redisClient");

// Import routes
const roleRoutes = require("./routes/roleRoutes");
const userRoutes = require("./routes/userRoutes");
const permissionRoutes = require("./routes/permissionRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const generateQrRoutes = require("./routes/generateQRRoutes");
const downloadsRoutes = require("./routes/downloadRoutes");
const busRoutes = require("./routes/busRoutes");
const bnyGeneralRoutes = require("./routes/bnyGeneralRoutes");

// Import sync logic
const syncMiddleware = require('./middleware/syncMiddleware'); // Middleware for syncing models
const atlasDB = require('./config/atlasDB');
const { processSyncQueue } = require('./services/syncService'); // Sync service for processing the queue

// Import models
const bnyGeneral = require('./models/bnyGeneral');
const bus = require('./models/bus');
const feedback = require('./models/feedback');
const generateQR = require('./models/generateQR');
const permission = require('./models/permission');
const personCounter = require('./models/personCounter');
const role = require('./models/role');
const sipCalc = require('./models/sipCalc');
const user = require('./models/user');
const userAnalytics = require('./models/userAnalytics');

// Atlas models (models connected to MongoDB Atlas)
const AtlasBnyGeneral = atlasDB.model('BnyGeneral', bnyGeneral.schema);
const AtlasBus = atlasDB.model('Bus', bus.schema);
const AtlasFeedback = atlasDB.model('Feedback', feedback.schema);
const AtlasGenerateQR = atlasDB.model('GenerateQR', generateQR.schema);
const AtlasPermission = atlasDB.model('Permission', permission.schema);
const AtlasPersonCounter = atlasDB.model('PersonCounter', personCounter.schema);
const AtlasRole = atlasDB.model('Role', role.schema);
const AtlasSipCalc = atlasDB.model('SipCalc', sipCalc.schema);
const AtlasUser = atlasDB.model('User', user.schema);
const AtlasUserAnalytics = atlasDB.model('UserAnalytics', userAnalytics.schema);

// Apply sync middleware to each model
bnyGeneral.schema.plugin(syncMiddleware, ['bnyGeneral', AtlasBnyGeneral]);
bus.schema.plugin(syncMiddleware, ['bus', AtlasBus]);
feedback.schema.plugin(syncMiddleware, ['feedback', AtlasFeedback]);
generateQR.schema.plugin(syncMiddleware, ['generateQR', AtlasGenerateQR]);
permission.schema.plugin(syncMiddleware, ['permission', AtlasPermission]);
personCounter.schema.plugin(syncMiddleware, ['personCounter', AtlasPersonCounter]);
role.schema.plugin(syncMiddleware, ['role', AtlasRole]);
sipCalc.schema.plugin(syncMiddleware, ['sipCalc', AtlasSipCalc]);
user.schema.plugin(syncMiddleware, ['user', AtlasUser]);
userAnalytics.schema.plugin(syncMiddleware, ['userAnalytics', AtlasUserAnalytics]);

// Connect to the local database
connectDB();

// SSL setup for HTTPS
const sslKey = fs.readFileSync(path.join(__dirname, "server.key"), "utf8");
const sslCert = fs.readFileSync(path.join(__dirname, "server.cert"), "utf8");
const credentials = { key: sslKey, cert: sslCert };

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes

app.use("/api/hello", (req, res) => {
  try {
    res.status(200).json({ message: true });
  } catch (err) {
    res.status(500);
  }
});
app.use("/downloads", donwloadsRoutes);
app.use("/api/users", userRoutes);
app.use("/api", roleRoutes);
app.use("/api", permissionRoutes);
app.use("/api", generateQrRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/bus", busRoutes);
app.use("/api/bnyGeneral", bnyGeneralRoutes);

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Sync process: Trigger syncing of queued operations periodically
setInterval(async () => {
  await processSyncQueue(); // Process queued operations for syncing
}, 60000); // Sync every 60 seconds (adjust the interval as needed)

// Start server
httpsServer.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
