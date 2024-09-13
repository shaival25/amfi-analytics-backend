const mongoose = require("mongoose");
const Role = require("../models/role");
const permission = require("../models/permission");
const User = require("../models/user");
const redis = require("../config/redisClient");

// Get all roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find({ deleted_at: null }).populate("permissions");
    res.status(200).json(roles);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Create a new role
exports.createRole = async (req, res) => {
  const { name, permissions } = req.body;
  if (!permissions || permissions.length === 0) {
    return res.status(400).json({ msg: "Permissions array cannot be empty" });
  }
  const per = [];
  try {
    // Check if role with the same name already exists
    const existingRole = await Role.findOne({ name });
    if (await Role.findOne({ name }).exec()) {
      return res
        .status(409)
        .json({ msg: "Role with the same name already exists" });
    }

    // Find the IDs of the specified permissions
    const foundPermissions = await permission.find({
      name: { $in: Object.values(permissions).flat() },
    });

    foundPermissions.forEach((p) => per.push(p._id));

    const newRole = new Role({ name, permissions: per });
    await newRole.save();
    res.status(201).json(newRole);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Update role
exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body; // Array of permission IDs
  const per = [];
  try {
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ msg: "Role not found" });
    }
    Object.keys(permissions).map((items) => {
      for (let i of permissions[items]) {
        per.push(i.name);
      }
      return null;
    });
    const foundPermissions = await permission.find({
      name: { $in: Object.values(per).flat() },
    });
    const per1 = [];
    foundPermissions.forEach((p) => per1.push(p._id));
    role.permissions = per1;
    role.updated_at = Date.now();
    await role.save();
    // role.__v = role.__v + 1;

    // Invalidate the cache for this role
    const redisKey = `role_permissions:${id}`;
    await redis.del(redisKey);
    await redis.del(`role_grouped_permissions:${id}`);

    res
      .status(200)
      .json({ msg: "Role permissions updated and cache invalidated" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Delete a role
exports.deleteRole = async (req, res) => {
  const { id } = req.params;

  try {
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ msg: "Role not found" });
    }

    const user = await User.findOne({ role: id });
    if (user) {
      return res
        .status(409)
        .json({ msg: "Role is assigned to a user, cannot delete" });
    }

    await Role.findByIdAndUpdate(id, { deleted_at: Date.now() }, { new: true });

    // Invalidate the cache for this role
    const redisKey = `role_permissions:${id}`;
    await redis.del(redisKey);

    res.status(200).json({ msg: "Role deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Get role by ID

// Assuming Role and Permission models are already defined

exports.getRoleWithGroupedPermissions = async (req, res) => {
  const roleId = req.params.id;
  try {
    // Validate roleId before proceeding
    if (!mongoose.Types.ObjectId.isValid(roleId)) {
      throw new Error("Invalid role ID");
    }
    const cachedRole = await redis.get(`role_grouped_permissions:${roleId}`);
    if (cachedRole) {
      return res.status(200).json(JSON.parse(cachedRole));
    }

    const roleData = await Role.aggregate([
      // Step 1: Match the Role by its ID
      { $match: { _id: new mongoose.Types.ObjectId(roleId) } },

      // Step 2: Lookup to join permissions from the Permission collection
      {
        $lookup: {
          from: "permissions", // Collection name of the 'Permission' documents
          localField: "permissions", // Field in Role that references Permission IDs
          foreignField: "_id", // Field in Permission schema to match
          as: "permissionDetails", // Field to store the joined permission data
        },
      },

      // Step 3: Unwind the permissionDetails array to get each permission document
      { $unwind: "$permissionDetails" },

      // Step 4: Group permissions by permissionType and aggregate the relevant fields
      {
        $group: {
          _id: {
            roleid: "$_id",
            rolename: "$name",
            permissionType: "$permissionDetails.permissionType",
          },
          permissions: {
            $push: {
              id: "$permissionDetails._id",
              name: "$permissionDetails.name",
            },
          },
        },
      },

      // Step 5: Reshape data to aggregate permissions into a single object per permissionType
      {
        $group: {
          _id: { roleid: "$_id.roleid", rolename: "$_id.rolename" },
          permissions: {
            $push: {
              k: "$_id.permissionType",
              v: {
                $map: {
                  input: "$permissions",
                  as: "perm",
                  in: {
                    _id: "$$perm.id",
                    name: "$$perm.name",
                  },
                },
              },
            },
          },
        },
      },

      // Step 6: Convert permissions array to an object
      {
        $project: {
          _id: 0,
          roleid: "$_id.roleid",
          rolename: "$_id.rolename",
          permissions: {
            $arrayToObject: {
              $map: {
                input: "$permissions",
                as: "perm",
                in: {
                  k: "$$perm.k",
                  v: "$$perm.v",
                },
              },
            },
          },
        },
      },
    ]);

    // Since we're expecting a single role, return the first result
    const role = roleData.length > 0 ? roleData[0] : null;
    redis.set(
      `role_grouped_permissions:${roleId}`,
      JSON.stringify(role),
      "EX",
      3600
    );

    res.status(200).json(role);
  } catch (error) {
    // Return the object or null if not foundcatch (error) {
    console.error("Error fetching role with permissions:", error);
    throw error;
  }
};
