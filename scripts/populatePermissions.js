const mongoose = require("mongoose");
const Permission = require("../models/permission");
const { mongoURI } = require("../config/config");

// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const permissions = [
  {
    name: "users:write",
    permissionType: "users",
    description: "Write user accounts",
  },
  {
    name: "users:read",
    permissionType: "users",
    description: "Read user accounts",
  },
  {
    name: "users:update",
    permissionType: "users",
    description: "Update user accounts",
  },
  {
    name: "users:delete",
    permissionType: "users",
    description: "Delete user accounts",
  },
  {
    name: "roles:read",
    permissionType: "roles",
    description: "Read user roles",
  },
  {
    name: "roles:write",
    permissionType: "roles",
    description: "Write user roles",
  },
  {
    name: "roles:delete",
    permissionType: "roles",
    description: "Delete roles",
  },
  {
    name: "roles:update",
    permissionType: "roles",
    description: "Update roles",
  },
  {
    name: "permissions:read",
    permissionType: "permissions",
    description: "Read permissions",
  },
  //   {
  //     name: "faceDetection:write",
  //     description: "Add face detections data",
  //   },
  {
    name: "faceDetection:read",
    permissionType: "faceDetection",
    description: "Read face detections data",
  },
  {
    name: "faceDetection:delete",
    permissionType: "faceDetection",
    description: "Delete face detections data",
  },
  {
    name: "analytics:read",
    permissionType: "analytics",
    description: "Read analytics data",
  },
  // Add more permissions as needed
];

const populatePermissions = async () => {
  try {
    for (const perm of permissions) {
      const existingPerm = await Permission.findOne({ name: perm.name });
      if (!existingPerm) {
        await new Permission(perm).save();
        console.log(`Permission "${perm.name}" added`);
      } else {
        console.log(`Permission "${perm.name}" already exists`);
      }
    }
    mongoose.connection.close();
  } catch (err) {
    console.error(err.message);
    mongoose.connection.close();
  }
};

populatePermissions();
