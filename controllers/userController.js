const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/config");
const redis = require("../config/redisClient");
const role = require("../models/role");
// Register user
exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const userByEmail = await User.findOne({ email });
    if (userByEmail) {
      return res.status(409).json({ msg: "Email already exists!" });
    }

    const userByUsername = await User.findOne({ username });
    if (userByUsername) {
      return res.status(409).json({ msg: "Username already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    await redis.del("users"); // Clear redis for users
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, deleted_at: null });
    if (!user) return res.status(409).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(409).json({ msg: "Invalid credentials" });

    const permissions = await role
      .findById(user.role._id)
      .populate("permissions", "name");
    const token = jwt.sign({ user: { id: user.id } }, jwtSecret, {
      expiresIn: "1h",
    });
    res.json({
      token,
      userName: user.username,
      email: user.email,
      id: user._id,
      permissions: permissions.permissions,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await redis.get("users");
    if (users) {
      res.status(200).json(JSON.parse(users));
    } else {
      const usersFromDB = await User.find().populate("role");
      await redis.set("users", JSON.stringify(usersFromDB), "EX", 3600);
      res.status(200).json(usersFromDB);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByIdAndUpdate(userId, {
      deleted_at: Date.now(),
    });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const usersFromDB = await User.find().populate("role");
    await redis.set("users", JSON.stringify(usersFromDB), "EX", 3600);
    res.status(200).json(usersFromDB);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  const { username, email, role, password } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    user.username = username;
    user.email = email;
    user.role = role;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }
    user.updated_at = Date.now();
    await user.save();
    await redis.del("users"); // Clear redis for users
    res.status(200).json({ msg: "User updated" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId, "_id username email").populate(
      "role",
      "name"
    );
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
};
