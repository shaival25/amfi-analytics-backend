const express = require("express");
const app = express();
const cors = require("cors");

const connectDB = require("./config/database");

const config = require("./config/config");
require("./config/redisClient");

const roleRoutes = require("./routes/roleRoutes");
const userRoutes = require("./routes/userRoutes");
const permissionRoutes = require("./routes/permissionRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const faceDetectionRoutes = require("./routes/faceDetectionRoutes");
const generateQrRoutes = require("./routes/generateQRRoutes");
const donwloadsRoutes = require("./routes/downloadRoutes");
const busRoutes = require("./routes/busRoutes");

const fs = require("fs");
const path = require("path");

const https = require("https");

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

app.use("/downloads", donwloadsRoutes);
app.use("/api/users", userRoutes);
app.use("/api", roleRoutes);
app.use("/api", permissionRoutes);
app.use("/api/face-detection", faceDetectionRoutes);
app.use("/api", generateQrRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/bus", busRoutes);

// Create HTTPS server

// app.listen(() => console.log(`Server started on port ${config.port}`));
const httpsServer = https.createServer(credentials, app);
// Start server
httpsServer.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
