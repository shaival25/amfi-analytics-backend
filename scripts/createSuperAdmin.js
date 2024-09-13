const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { mongoURI } = require("../config/config");
const User = require("../models/user");
const Role = require("../models/role");
const Permission = require("../models/permission");

// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const createSuperAdmin = async (username, email, password) => {
  try {
    // Fetch all permissions
    const permissions = await Permission.find();

    // Create or find the Super Admin role
    await Role.findOneAndDelete({ name: "superAdmin" });
    console.log("Old Super Admin role deleted");

    let superAdminRole = new Role({
      name: "superAdmin",
      permissions: permissions.map((p) => p._id),
    });
    await superAdminRole.save();
    console.log("Super Admin role created");

    // Create Super Admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    let superAdminUser = await User.findOne({ email });
    if (superAdminUser) {
      superAdminUser.username = username;
      superAdminUser.password = hashedPassword;
      superAdminUser.role = superAdminRole._id;
    } else {
      superAdminUser = new User({
        username,
        email,
        password: hashedPassword,
        role: superAdminRole._id,
      });
    }

    await superAdminUser.save();
    console.log("Super Admin user created");

    mongoose.connection.close();
  } catch (err) {
    console.error(err.message);
    mongoose.connection.close();
  }
};

// Parse command-line arguments
const [, , username, email, password] = process.argv;
if (!username || !email || !password) {
  console.error(
    "Usage: node createSuperAdmin.js <username> <email> <password>"
  );
  process.exit(1);
}

createSuperAdmin(username, email, password);
