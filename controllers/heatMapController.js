const fs = require("fs");
const path = require("path");
const { format } = require("date-fns");
const HeatMap = require("../models/heatMap");
const busController = require("./busController");

exports.getHeatMap = async (req, res) => {
  try {
    const {
      selectedBuses = [],
      selectedDate,
      selectedTimeSlots = [],
    } = req.body;
    const query = {};
    if (selectedTimeSlots.length === 0) {
      return res.status(200).json({ heatMaps: [] });
    }

    if (selectedBuses[0] !== "all") {
      query.macAddress = { $in: selectedBuses };
    }

    // Convert selectedDate and selectedTimeSlots to a range of timestamps
    if (selectedDate && selectedTimeSlots.length > 0) {
      const timeRanges = selectedTimeSlots.map((time) => {
        const start = new Date(`${selectedDate}T${time}`);
        const end = new Date(start);
        end.setHours(end.getHours() + 1); // Each slot is 1 hour long
        return { start, end };
      });

      // Match created_at with one of the time ranges
      query.$or = timeRanges.map((range) => ({
        created_at: { $gte: range.start, $lt: range.end },
      }));
    }

    // Fetch all matching documents without grouping by macAddress
    const heatMapData = await HeatMap.find(query).sort({
      macAddress: 1,
      created_at: -1,
    });

    if (!heatMapData || heatMapData.length === 0) {
      return res.status(200).json({ heatMaps: [] });
    }

    const heatMapImages = await Promise.all(
      heatMapData.map(async (data) => {
        // Ensure createdAt is a valid Date object
        let formattedDate = "Invalid date";
        let formattedTime = "Invalid time";
        if (data.created_at) {
          try {
            const dateObj = new Date(data.created_at);
            formattedDate = format(dateObj, "dd/MM/yyyy");
            formattedTime = format(dateObj, "HH:mm:ss");
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
            date: formattedDate, // Add formatted date and time
            time: formattedTime,
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
