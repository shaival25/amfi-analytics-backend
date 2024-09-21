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
const heatMapRoutes = require("./routes/heatMapRoutes");
const uploadRoutes = require('./routes/uploadRoutes');

// Connect to the database
connectDB();

const sslKey = fs.readFileSync(path.join(__dirname, "server.key"), "utf8");
const sslCert = fs.readFileSync(path.join(__dirname, "server.cert"), "utf8");

// Setup HTTPS credentials
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
app.use("/downloads", downloadsRoutes);
app.use("/api/users", userRoutes);
app.use("/api", roleRoutes);
app.use("/api", permissionRoutes);
app.use("/api", generateQrRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/bus", busRoutes);
app.use("/api/bnyGeneral", bnyGeneralRoutes);
app.use("/api/heat-map", heatMapRoutes);
app.use('/api/uploads', uploadRoutes);


// Create HTTPS server

const httpsServer = https.createServer(credentials, app);
// Start server

if (process.env.PROD === "test") {
  console.log("Starting server in test mode...");
  httpsServer.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
} else {
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}
