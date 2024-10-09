const BnyGeneral = require("../models/bnyGeneral");
const GenerateQR = require("../models/generateQR");
const Feedback = require("../models/feedback");
const UserAnalytics = require("../models/userAnalytics");
const Bus = require("../models/bus");
exports.getCountForLastHour = async (req, res) => {
  const busIds = req.body.selectedBuses || {};
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 60 * 60 * 1000); // 1 hour ago

  // Generate 10-minute intervals for the last hour
  const intervals = [];
  const labels = [];
  let current = new Date(startTime);

  while (current < endTime) {
    const startInterval = new Date(current);
    const endInterval = new Date(current.getTime() + 10 * 60 * 1000); // End of the 10-minute interval

    intervals.push({ start: startInterval, end: endInterval });
    labels.push(
      new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata", // IST timezone
      }).format(endInterval)
    );

    current = new Date(current.getTime() + 10 * 60 * 1000); // Move to the next 10-minute interval
  }

  // Query the database for each interval
  const counts = await Promise.all(
    intervals.map(async ({ start, end }) => {
      let query = {
        created_at: { $gte: start, $lt: end },
      };

      // If busIds is provided and not empty, add it to the query
      if (busIds[0] !== "all") {
        query.macAddress = { $in: busIds };
      }

      const count = await BnyGeneral.countDocuments(query);
      return count;
    })
  );

  res.json({ labels, counts });
};

exports.getCountForLastSixHours = async (req, res) => {
  const busIds = req.body.selectedBuses || {};
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 5 * 60 * 60 * 1000); // 6 hours ago

  // Generate time intervals (1-hour intervals for the last 6 hours)
  const intervals = [];
  const labels = [];
  let current = new Date(startTime);

  while (current < endTime) {
    const startInterval = new Date(current);
    const endInterval = new Date(current.getTime() + 60 * 60 * 1000); // End of the current hour

    intervals.push({ start: startInterval, end: endInterval });
    labels.push(
      new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata", // IST timezone
      }).format(endInterval)
    );

    current = new Date(current.getTime() + 60 * 60 * 1000); // Move to the next hour
  }

  // Query the database for each interval
  const counts = await Promise.all(
    intervals.map(async ({ start, end }) => {
      let query = {
        created_at: { $gte: start, $lt: end },
      };

      // If busIds is provided and not empty, add it to the query
      if (busIds[0] !== "all") {
        query.macAddress = { $in: busIds };
      }

      const count = await BnyGeneral.countDocuments(query);
      return count;
    })
  );

  res.json({ labels, counts });
};

exports.getCountForLastTwentyFourHours = async (req, res) => {
  const busIds = req.body.selectedBuses || {};
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 23 * 60 * 60 * 1000); // 24 hours ago

  // Generate 1-hour intervals for the last 24 hours
  const intervals = [];
  const labels = [];
  let current = new Date(startTime);

  while (current <= endTime) {
    const startInterval = new Date(current);
    const endInterval = new Date(current.getTime() + 60 * 60 * 1000); // End of the 1-hour interval

    intervals.push({ start: startInterval, end: endInterval });
    labels.push(
      new Intl.DateTimeFormat("en-US", {
        // day: "2-digit",
        // month: "short",

        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata", // IST timezone
      }).format(endInterval)
    );

    current = new Date(current.getTime() + 60 * 60 * 1000); // Move to the next 1-hour interval
  }

  // Query the database for each interval
  const counts = await Promise.all(
    intervals.map(async ({ start, end }) => {
      let query = {
        created_at: { $gte: start, $lt: end },
      };

      // If busIds is provided and not empty, add it to the query
      if (busIds[0] !== "all") {
        query.macAddress = { $in: busIds };
      }

      const count = await BnyGeneral.countDocuments(query);
      return count;
    })
  );

  res.json({ labels, counts });
};

exports.getCountForLastMonth = async (req, res) => {
  const busIds = req.body.selectedBuses || {};
  const endTime = new Date();
  const startTime = new Date(
    endTime.getFullYear(),
    endTime.getMonth() - 1,
    endTime.getDate()
  ); // 1 month ago

  // Generate 4-hour intervals for the last month
  const intervals = [];
  const labels = [];
  let current = new Date(startTime);

  while (current < endTime) {
    const startInterval = new Date(current);
    const endInterval = new Date(current.getTime() + 24 * 60 * 60 * 1000);

    intervals.push({ start: startInterval, end: endInterval });
    labels.push(
      new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "short",
        hour12: false,
        timeZone: "Asia/Kolkata", // IST timezone
      }).format(startInterval)
    );

    current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
  }

  // Query the database for each interval
  const counts = await Promise.all(
    intervals.map(async ({ start, end }) => {
      let query = {
        created_at: { $gte: start, $lt: end },
      };

      // If busIds is provided and not empty, add it to the query
      if (busIds[0] !== "all") {
        query.macAddress = { $in: busIds };
      }

      const count = await BnyGeneral.countDocuments(query);
      return count;
    })
  );

  res.json({ labels, counts });
};

exports.getCountForLastYear = async (req, res) => {
  const busIds = req.body.selectedBuses || {};

  const endTime = new Date(); // Current date
  const startTime = new Date(
    endTime.getFullYear() - 1,
    endTime.getMonth() + 1,
    1
  );

  // Generate time points (1-month intervals for the last year)
  const intervals = [];
  const labels = [];
  let current = new Date(startTime);

  while (current < endTime) {
    const startInterval = new Date(current);
    const endInterval = new Date(
      current.getFullYear(),
      current.getMonth() + 1,
      1
    ); // Start of the next month

    intervals.push({ start: startInterval, end: endInterval });
    labels.push(
      new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        timeZone: "Asia/Kolkata",
      }).format(startInterval)
    );

    current.setMonth(current.getMonth() + 1); // Move to the next month
  }

  // Query the database for each interval
  const counts = await Promise.all(
    intervals.map(async ({ start, end }) => {
      let query = {
        created_at: { $gte: start, $lt: end },
      };

      // If busIds is provided and not empty, add it to the query
      if (busIds[0] !== "all") {
        query.macAddress = { $in: busIds };
      }

      const count = await BnyGeneral.countDocuments(query);
      return count;
    })
  );

  res.json({ labels, counts });
};

exports.getCustomTimeSlotCounts = async (req, res) => {
  const busIds = req.body.selectedBuses || {};
  const { startDate, endDate, selectedTimeSlots = [] } = req.body;

  if (!startDate || !endDate || selectedTimeSlots.length === 0) {
    return res
      .status(200)
      .json({ message: "Please provide valid date range and time slots." });
  }

  const query = {};
  if (busIds[0] !== "all") {
    query.macAddress = { $in: busIds };
  }

  const labels = selectedTimeSlots; // Time slots will be used as labels for the spine chart

  const counts = []; // Array to hold data for each day in the range

  // Loop through each date in the range
  let currentDate = new Date(startDate);
  const finalDate = new Date(endDate);

  while (currentDate <= finalDate) {
    const dateSeries = {
      name: currentDate.toISOString().split("T")[0], // Add the current date to the series
      data: [],
    };

    // Loop through each time slot and get counts
    const countsForSlots = await Promise.all(
      selectedTimeSlots.map(async (time) => {
        // Create IST start time
        const istStart = new Date(
          `${currentDate.toISOString().split("T")[0]}T${time}`
        );
        // Convert IST to UTC (subtract 5 hours 30 minutes)
        const utcStart = new Date(istStart.getTime() - (5 * 60 + 30) * 60000);
        const utcEnd = new Date(utcStart);
        utcEnd.setHours(utcEnd.getHours() + 1); // 1-hour slot

        // Build query for the time slot
        const timeSlotQuery = {
          ...query,
          created_at: { $gte: utcStart, $lt: utcEnd },
        };

        // Get count for this time slot
        const count = await BnyGeneral.countDocuments(timeSlotQuery);
        return count;
      })
    );

    // Add counts for each time slot to the series for this date
    dateSeries.data = countsForSlots;

    // Push the series for this date
    counts.push(dateSeries);

    // Move to the next date
    currentDate.setDate(currentDate.getDate() + 1);
  }

  res.json({ labels, counts });
};

exports.getCountByRange = async (req, res) => {
  switch (req.params.range) {
    case "1":
      return exports.getCountForLastHour(req, res);
    case "6":
      return exports.getCountForLastSixHours(req, res);
    case "24":
      return exports.getCountForLastTwentyFourHours(req, res);
    case "720":
      return exports.getCountForLastMonth(req, res);
    case "8760":
      return exports.getCountForLastYear(req, res);
    case "custom":
      return exports.getCustomTimeSlotCounts(req, res);
    default:
      return exports.getCountForLastHour(req, res);
  }
};

exports.getFaceDetectionCount = async (req, res) => {
  const busIds = req.body.selectedBuses || {};
  const query = {};
  const { startDate, endDate, selectedTimeSlots = [], range } = req.body;

  if (busIds[0] !== "all") {
    query.macAddress = { $in: busIds };
  }

  if (
    startDate &&
    endDate &&
    selectedTimeSlots.length > 0 &&
    range === "custom"
  ) {
    const timeRanges = [];

    // Loop through each date in the date range
    let currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    while (currentDate <= finalDate) {
      // For each date, loop through all time slots
      selectedTimeSlots.forEach((time) => {
        // Create the date in IST first
        const istStart = new Date(
          `${currentDate.toISOString().split("T")[0]}T${time}`
        );

        // Convert IST to UTC by subtracting 5 hours 30 minutes
        const utcStart = new Date(istStart.getTime() - (5 * 60 + 30) * 60000);

        // Define the end time for the 1-hour slot in UTC
        const utcEnd = new Date(utcStart);
        utcEnd.setHours(utcEnd.getHours() + 1);

        // Add the time range in UTC to the query
        timeRanges.push({
          created_at: { $gte: utcStart, $lt: utcEnd },
        });
      });

      // Move to the next date
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Match created_at with one of the time ranges
    query.$or = timeRanges;
  }

  try {
    const count = await BnyGeneral.countDocuments(query);
    res.status(200).json(count);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMascotCount = async (req, res) => {
  const query = {};
  const { startDate, endDate, selectedTimeSlots = [], range } = req.body;

  if (
    (startDate && endDate && selectedTimeSlots.length > 0, range === "custom")
  ) {
    const timeRanges = [];

    // Loop through each date in the date range
    let currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    while (currentDate <= finalDate) {
      // For each date, loop through all time slots
      selectedTimeSlots.forEach((time) => {
        // Create the date in IST first
        const istStart = new Date(
          `${currentDate.toISOString().split("T")[0]}T${time}`
        );

        // Convert IST to UTC by subtracting 5 hours 30 minutes
        const utcStart = new Date(istStart.getTime() - (5 * 60 + 30) * 60000);

        // Define the end time for the 1-hour slot in UTC
        const utcEnd = new Date(utcStart);
        utcEnd.setHours(utcEnd.getHours() + 1);

        // Add the time range in UTC to the query
        timeRanges.push({
          created_at: { $gte: utcStart, $lt: utcEnd },
        });
      });

      // Move to the next date
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Match created_at with one of the time ranges
    query.$or = timeRanges;
  }

  try {
    const generateQR = await GenerateQR.find(query, { mascot: 1 });
    const sachinCount = generateQR.filter((fd) => fd.mascot === 0).length;
    const rohitCount = generateQR.filter((fd) => fd.mascot === 1).length;
    const dhoniCount = generateQR.filter((fd) => fd.mascot === 2).length;

    const response = {
      totalCount: generateQR.length,
      cricketer: {
        Sachin: sachinCount,
        Rohit: rohitCount,
        Dhoni: dhoniCount,
      },
    };

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPersonCount = async (req, res) => {
  const busIds = req.body.selectedBuses || {};
  const query = {};
  const { startDate, endDate, selectedTimeSlots = [], range } = req.body;

  if (
    (startDate && endDate && selectedTimeSlots.length > 0, range === "custom")
  ) {
    const timeRanges = [];

    // Loop through each date in the date range
    let currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    while (currentDate <= finalDate) {
      // For each date, loop through all time slots
      selectedTimeSlots.forEach((time) => {
        // Create the date in IST first
        const istStart = new Date(
          `${currentDate.toISOString().split("T")[0]}T${time}`
        );

        // Convert IST to UTC by subtracting 5 hours 30 minutes
        const utcStart = new Date(istStart.getTime() - (5 * 60 + 30) * 60000);

        // Define the end time for the 1-hour slot in UTC
        const utcEnd = new Date(utcStart);
        utcEnd.setHours(utcEnd.getHours() + 1);

        // Add the time range in UTC to the query
        timeRanges.push({
          created_at: { $gte: utcStart, $lt: utcEnd },
        });
      });

      // Move to the next date
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Match created_at with one of the time ranges
    query.$or = timeRanges;
  }

  if (busIds[0] !== "all") {
    query.macAddress = { $in: busIds };
  }
  try {
    const personCount = await BnyGeneral.countDocuments(query);
    res.status(200).json(Math.floor(personCount * 1.2));
    // const personCount = await PersonCounter.findOne(query);
    // res.status(200).json(personCount ? personCount.counter : 0);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFeedbackCount = async (req, res) => {
  const busIds = req.body.selectedBuses || {};
  const query = {};

  const { startDate, endDate, selectedTimeSlots = [], range } = req.body;

  if (
    startDate &&
    endDate &&
    selectedTimeSlots.length > 0 &&
    range === "custom"
  ) {
    const timeRanges = [];

    // Loop through each date in the date range
    let currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    while (currentDate <= finalDate) {
      // For each date, loop through all time slots
      selectedTimeSlots.forEach((time) => {
        // Create the date in IST first
        const istStart = new Date(
          `${currentDate.toISOString().split("T")[0]}T${time}`
        );

        // Convert IST to UTC by subtracting 5 hours 30 minutes
        const utcStart = new Date(istStart.getTime() - (5 * 60 + 30) * 60000);

        // Define the end time for the 1-hour slot in UTC
        const utcEnd = new Date(utcStart);
        utcEnd.setHours(utcEnd.getHours() + 1);

        // Add the time range in UTC to the query
        timeRanges.push({
          createdAt: { $gte: utcStart, $lt: utcEnd },
        });
      });

      // Move to the next date
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Match created_at with one of the time ranges
    query.$or = timeRanges;
  }

  if (busIds[0] !== "all") {
    query.macAddress = { $in: busIds };
  }
  try {
    const count = await Feedback.countDocuments(query);
    res.status(200).json(count);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserInteraction = async (req, res) => {
  const busIds = req.body.selectedBuses || [];

  const { startDate, endDate, selectedTimeSlots = [], range } = req.body;

  try {
    let dateFilter = {};
    const now = new Date();

    // Function to convert IST to UTC
    const convertISTtoUTC = (timeSlot) => {
      const [hours, minutes] = timeSlot.split(":").map(Number);
      const utcDate = new Date(date); // Set the date
      utcDate.setHours(hours, minutes, 0, 0);
      utcDate.setHours(utcDate.getHours() - 5); // Subtract 5 hours
      utcDate.setMinutes(utcDate.getMinutes() - 30); // Subtract 30 minutes
      return utcDate.toISOString().substr(11, 5); // Return in HH:mm format
    };

    // Handle different options
    switch (range) {
      case "custom": {
        // Prepare date range based on selected date and time slots
        const startDate1 = new Date(startDate);
        startDate1.setHours(0, 0, 0, 0);
        const endDate1 = new Date(endDate);
        endDate1.setHours(23, 59, 59, 999);

        // Use time slots to create a filter
        const utcTimeSlots = selectedTimeSlots.map(convertISTtoUTC);
        dateFilter = {
          created_at: {
            $gte: startDate1,
            $lte: endDate1,
          },
          $or: utcTimeSlots.map((utcTime) => ({
            $expr: {
              $and: [
                {
                  $eq: [
                    { $hour: "$created_at" },
                    parseInt(utcTime.split(":")[0]),
                  ],
                },
                {
                  $eq: [
                    { $minute: "$created_at" },
                    parseInt(utcTime.split(":")[1]),
                  ],
                },
              ],
            },
          })),
        };
        break;
      }
      case 1: {
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        dateFilter = { $gte: oneHourAgo };
        break;
      }

      case 6: {
        const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        dateFilter = { $gte: sixHoursAgo };
        break;
      }

      case 24: {
        const twentyFourHoursAgo = new Date(
          now.getTime() - 24 * 60 * 60 * 1000
        );
        dateFilter = { $gte: twentyFourHoursAgo };
        break;
      }

      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid range" });
    }

    // Get the BnyGeneral documents that match the selected buses' macAddresses
    const busMatchQuery = {};
    if (busIds[0] !== "all") {
      busMatchQuery.macAddress = { $in: busIds };
    }

    // Aggregate the user analytics data with buses
    const result = await UserAnalytics.aggregate([
      {
        $lookup: {
          from: "bnygenerals",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $match: {
          "userDetails.macAddress": busMatchQuery.macAddress || {
            $exists: true,
          },
          ...(Object.keys(dateFilter).length && { created_at: dateFilter }),
        },
      },
      {
        $lookup: {
          from: "buses",
          localField: "userDetails.macAddress",
          foreignField: "macAddress",
          as: "busDetails",
        },
      },
      { $unwind: "$busDetails" },
      {
        $project: {
          busName: "$busDetails.busName",
          journeyDuration: 1,
        },
      },
      {
        $group: {
          _id: "$busName",
          totalDuration: { $sum: "$journeyDuration" },
          totalInteractions: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          busName: "$_id",
          avgDuration: {
            $cond: [
              { $gt: ["$totalInteractions", 0] },
              { $divide: ["$totalDuration", "$totalInteractions"] },
              0,
            ],
          },
        },
      },
      {
        $sort: {
          busName: 1,
        },
      },
    ]);

    // Prepare the data for the response
    const labels = [];
    const datasets = {};

    result.forEach((item) => {
      if (!datasets[item.busName]) {
        datasets[item.busName] = [];
      }
      datasets[item.busName].push(item.avgDuration / 60000); // Convert from milliseconds to minutes
      labels.push(item.busName);
    });

    const responseData = {
      labels: [...new Set(labels)], // Unique labels
      datasets: Object.keys(datasets).map((busName) => ({
        label: busName,
        data: datasets[busName],
      })),
    };

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getGoals = async (req, res) => {
  const busIds = req.body.selectedBuses || {};
  const query = {};
  const { startDate, endDate, selectedTimeSlots = [], range } = req.body;

  if (
    startDate &&
    endDate &&
    selectedTimeSlots.length > 0 &&
    range === "custom"
  ) {
    const timeRanges = [];

    // Loop through each date in the date range
    let currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    while (currentDate <= finalDate) {
      // For each date, loop through all time slots
      selectedTimeSlots.forEach((time) => {
        // Create the date in IST first
        const istStart = new Date(
          `${currentDate.toISOString().split("T")[0]}T${time}`
        );

        // Convert IST to UTC by subtracting 5 hours 30 minutes
        const utcStart = new Date(istStart.getTime() - (5 * 60 + 30) * 60000);

        // Define the end time for the 1-hour slot in UTC
        const utcEnd = new Date(utcStart);
        utcEnd.setHours(utcEnd.getHours() + 1);

        // Add the time range in UTC to the query
        timeRanges.push({
          created_at: { $gte: utcStart, $lt: utcEnd },
        });
      });

      // Move to the next date
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Match created_at with one of the time ranges
    query.$or = timeRanges;
  }

  if (busIds[0] !== "all") {
    query["userId"] = {
      $in: await BnyGeneral.find(
        { macAddress: { $in: busIds } },
        { _id: 1 }
      ).distinct("_id"),
    };
  }

  try {
    const goals = await UserAnalytics.find(query, { goalSelected: 1 });

    const dreamHome = goals.filter(
      (gs) => gs.goalSelected?.toLowerCase() === "dream home"
    ).length;
    const dreamVacation = goals.filter(
      (gs) => gs.goalSelected?.toLowerCase() === "dream vacation"
    ).length;
    const luxuryCar = goals.filter(
      (gs) => gs.goalSelected?.toLowerCase() === "luxury car"
    ).length;
    const childFuture = goals.filter(
      (gs) => gs.goalSelected?.toLowerCase() === "child's future"
    ).length;
    const marriage = goals.filter(
      (gs) => gs.goalSelected?.toLowerCase() === "marriage"
    ).length;
    const retirement = goals.filter(
      (gs) => gs.goalSelected?.toLowerCase() === "retirement"
    ).length;

    const response = {
      totalCount:
        dreamHome +
        dreamVacation +
        luxuryCar +
        childFuture +
        marriage +
        retirement,
      goals: {
        "Dream Home": dreamHome,
        "Dream Vacation": dreamVacation,
        "Luxury Car": luxuryCar,
        "Child's Future": childFuture,
        Marriage: marriage,
        Retirement: retirement,
      },
    };

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFeedbackInsights = async (req, res) => {
  const busIds = req.body.selectedBuses || {};
  const query = {};

  const { startDate, endDate, selectedTimeSlots = [], range } = req.body;

  if (
    startDate &&
    endDate &&
    selectedTimeSlots.length > 0 &&
    range === "custom"
  ) {
    const timeRanges = [];

    // Loop through each date in the date range
    let currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    while (currentDate <= finalDate) {
      // For each date, loop through all time slots
      selectedTimeSlots.forEach((time) => {
        // Create the date in IST first
        const istStart = new Date(
          `${currentDate.toISOString().split("T")[0]}T${time}`
        );

        // Convert IST to UTC by subtracting 5 hours 30 minutes
        const utcStart = new Date(istStart.getTime() - (5 * 60 + 30) * 60000);

        // Define the end time for the 1-hour slot in UTC
        const utcEnd = new Date(utcStart);
        utcEnd.setHours(utcEnd.getHours() + 1);

        // Add the time range in UTC to the query
        timeRanges.push({
          createdAt: { $gte: utcStart, $lt: utcEnd },
        });
      });

      // Move to the next date
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Match created_at with one of the time ranges
    query.$or = timeRanges;
  }

  if (busIds[0] !== "all") {
    query.macAddress = { $in: busIds };
  }

  try {
    // Fetch all feedback
    const feedback = await Feedback.find(query);

    // Initialize counters for each response type per question
    const question1Responses = { Poor: 0, Average: 0, Good: 0, Excellent: 0 };
    const question2Responses = {
      "Not Very Useful": 0,
      Neutral: 0,
      Useful: 0,
      "Extremely Useful": 0,
    };
    const question3Responses = {
      Unlikely: 0,
      Neutral: 0,
      Likely: 0,
      "Very Likely": 0,
    };

    // Iterate over all feedback and increment response counts
    feedback.forEach((fb) => {
      fb.responses.forEach((response) => {
        if (response.question === "How was your Overall Experience") {
          question1Responses[response.response] += 1;
        } else if (
          response.question === "Did you find the information provided useful?"
        ) {
          question2Responses[response.response] += 1;
        } else if (
          response.question ===
          "How likely are you to recommend mutual funds to friends or family?"
        ) {
          question3Responses[response.response] += 1;
        }
      });
    });

    // Format the data for each question
    const data = {
      question1: {
        labels: ["Poor", "Average", "Good", "Excellent"],
        datasets: [
          {
            label: "How was your Overall Experience?",
            data: [
              question1Responses["Poor"],
              question1Responses["Average"],
              question1Responses["Good"],
              question1Responses["Excellent"],
            ],
          },
        ],
      },
      question2: {
        labels: ["Not Very Useful", "Neutral", "Useful", "Extremely Useful"],
        datasets: [
          {
            label: "Did you find the information provided useful?",
            data: [
              question2Responses["Not Very Useful"],
              question2Responses["Neutral"],
              question2Responses["Useful"],
              question2Responses["Extremely Useful"],
            ],
          },
        ],
      },
      question3: {
        labels: ["Unlikely", "Neutral", "Likely", "Very Likely"],
        datasets: [
          {
            label:
              "How likely are you to recommend mutual funds to friends or family?",
            data: [
              question3Responses["Unlikely"],
              question3Responses["Neutral"],
              question3Responses["Likely"],
              question3Responses["Very Likely"],
            ],
          },
        ],
      },
    };

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
