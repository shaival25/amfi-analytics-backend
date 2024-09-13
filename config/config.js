const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();

const envFilePath = path.join(__dirname, "../.env");

// Generate a new JWT_SECRET if it doesn't exist
const generateSecret = () => {
  return crypto.randomBytes(64).toString("hex");
};

const getJwtSecret = () => {
  if (!fs.existsSync(envFilePath)) {
    // Create .env file if it doesn't exist
    fs.writeFileSync(envFilePath, `JWT_SECRET=${generateSecret()}\n`);
    return generateSecret();
  }

  const envVars = fs.readFileSync(envFilePath, "utf-8").split("\n");
  const jwtSecret = generateSecret();
  const newEnvVars = envVars.filter((line) => !line.startsWith("JWT_SECRET="));
  newEnvVars.push(`JWT_SECRET=${jwtSecret}`);
  fs.writeFileSync(envFilePath, newEnvVars.join("\n"));

  return jwtSecret;
};

module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: getJwtSecret(),
  mongoURI: process.env.MONGO_URI || "mongodb://localhost:27017/faceAdminDB",
  server_url: process.env.SERVER_URL || "http://192.168.29.177:5000",
  macAddress: process.env.MAC_ADDRESS || "08-71-90-32-8B-2E",
};
