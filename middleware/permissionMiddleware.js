const Role = require("../models/role");
const redis = require("../config/redisClient");
const CACHE_EXPIRATION = 3600; // Cache expiration time in seconds (e.g., 1 hour)
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = req.user; // Assuming req.user is set after authentication
      if (!user?.role) {
        return res.status(403).json({ msg: "Access denied: No role assigned" });
      }

      const roleId = user.role._id.toString();

      // Define Redis key for the role's permissions
      const redisKey = `role_permissions:${roleId}`;

      // Try fetching permissions from Redis
      let permissions = await redis.get(redisKey);

      if (permissions) {
        // Permissions found in cache, parse them
        permissions = JSON.parse(permissions);
        console.log(
          `Permissions for role ${user.role.name} fetched from Redis`
        );
      } else {
        // Permissions not in cache, fetch from MongoDB
        const role = await Role.findById(roleId).populate("permissions");
        if (!role) {
          return res.status(403).json({ msg: "Access denied: Role not found" });
        }
        permissions = role.permissions.map((p) => {
          return p.name;
        });

        // Cache the permissions in Redis
        await redis.set(
          redisKey,
          JSON.stringify(permissions),
          "EX",
          CACHE_EXPIRATION
        );
        // console.log(
        //   `Permissions for role ${role.name} fetched from DB and cached`
        // );
      }

      // Check if the required permission exists
      if (!permissions.includes(requiredPermission.toString())) {
        return res
          .status(403)
          .json({ msg: "Access denied: Insufficient permissions" });
      }
      next();
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  };
};

module.exports = checkPermission;
