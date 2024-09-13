const Permission = require("../models/permission"); // Import the Permission model
exports.getPermissionsWithTypes = async (req, res) => {
  try {
    const permissions = await Permission.aggregate([
      // Step 1: Group permissions by permissionType
      {
        $group: {
          _id: "$permissionType",
          permissions: {
            $push: {
              id: "$_id",
              name: "$name",
            },
          },
        },
      },

      // Step 2: Reshape the result to create an object with permissionType keys and their permissions
      {
        $project: {
          _id: 0,
          permissionType: "$_id",
          permissions: {
            $map: {
              input: "$permissions",
              as: "perm",
              in: {
                id: "$$perm.id",
                name: "$$perm.name",
              },
            },
          },
        },
      },

      // Step 3: Transform the result into an object with keys for each permissionType
      {
        $group: {
          _id: null,
          permissions: {
            $push: {
              k: "$permissionType",
              v: "$permissions",
            },
          },
        },
      },

      // Step 4: Convert the array of key-value pairs into an object
      {
        $project: {
          _id: 0,
          permissions: {
            $arrayToObject: "$permissions",
          },
        },
      },
    ]);

    // Since we're expecting a single result, return the first item
    const result =
      permissions.length > 0 ? permissions[0] : { permissions: {} };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).json({ message: "Error fetching permissions", error });
  }
};
