const fs = require("fs");
const path = require("path");
const { format } = require("date-fns");
const HeatMap = require("../models/heatMap");
const busController = require("./busController");

exports.getHeatMap = async (req, res) => {
  try {
    const busIds = req.body.selectedBuses || [];
    const query = {};

    if (busIds[0] !== "all") {
      query.macAddress = { $in: busIds };
    }

    // Use aggregation to get the latest document for each macAddress
    const heatMapData = await HeatMap.aggregate([
      // Match documents based on the query
      { $match: query },
      // Sort by macAddress and createdAt (or the relevant timestamp field)
      { $sort: { macAddress: 1, created_at: -1 } }, // Assuming 'createdAt' is the timestamp field

      // Group by macAddress and select the first document (latest)
      {
        $group: {
          _id: "$macAddress",
          latestEntry: { $first: "$$ROOT" },
        },
      },
    ]);

    if (!heatMapData || heatMapData.length === 0) {
      return res.status(404).json({ message: "Heat map not found." });
    }

    // Read and encode images for each entry, awaiting all promises
    const heatMapImages = await Promise.all(
      heatMapData.map(async (group) => {
        const data = group.latestEntry;

        // Ensure createdAt is a valid Date object
        let formattedDate = "Invalid date";
        let formattedTime = "Invalid time";
        if (data.created_at) {
          try {
            const dateObj = new Date(data.created_at);
            if (!isNaN(dateObj)) {
              // Check if dateObj is a valid date
              formattedDate = format(dateObj, "dd/MM/yyyy");
              formattedTime = format(dateObj, "HH:mm:ss");
            }
          } catch (error) {
            console.error("Date formatting error:", error);
          }
        }

        // Get busName using getBusName
        const busName = await busController.getBusName(data.macAddress);

        // Construct the file path
        const imagePath = path.join(
          __dirname,
          "../uploads",
          busName, // Use busName obtained from getBusName
          "heat-map-images",
          data.heatMap
        );

        // Check if the file exists
        if (fs.existsSync(imagePath)) {
          // Read the file and convert it to a base64 string
          const imageBase64 = fs.readFileSync(imagePath, {
            encoding: "base64",
          });
          return {
            busName: busName, // Use busName from getBusName
            date: formattedDate,
            time: formattedTime,
            image: `data:image/png;base64,${imageBase64}`, // Assuming the image is a PNG, change MIME type if needed
          };
        } else {
          return {
            busName: busName, // Use busName from getBusName
            createdAt: formattedDate, // Add formatted date and time
            image: null,
          };
        }
      })
    );

    // Sort the array by bus name
    heatMapImages.sort((a, b) => a.busName.localeCompare(b.busName));

    // Send the response with the images
    res.status(200).json({ heatMaps: heatMapImages });
  } catch (error) {
    console.error("Error fetching heat map:", error);
    res.status(500).json({ message: "Server error." });
  }
};
