const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/config");
const User = require("../models/user");

module.exports = async (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = await User.findById(decoded.user.id).populate("role");
    next();
  } catch (err) {
    res.status(400).json({ msg: "Token is not valid" });
  }
};
