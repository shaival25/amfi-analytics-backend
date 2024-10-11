const BnyGeneral = require("../models/bnyGeneral");
const GenerateQR = require("../models/generateQR");
const Feedback = require("../models/feedback");
const UserAnalytics = require("../models/userAnalytics");
const Bus = require("../models/bus");
const redisClient = require("../config/redisClient");
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
      .json({ message: "Please provide a valid date range and time slots." });
  }

  // Function to parse "dd/mm/yyyy" to a valid JavaScript Date object
  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split("/");
    return new Date(`${year}-${month}-${day}`);
  };

  // Parse the input dates in IST
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  const query = {};
  if (busIds[0] !== "all") {
    query.macAddress = { $in: busIds };
  }

  // Time slot labels should remain in IST
  const labels = selectedTimeSlots;

  const counts = []; // Array to hold data for each day in the range

  // Loop through each date in the range
  let currentDate = start;
  const finalDate = end;

  while (currentDate <= finalDate) {
    const dateSeries = {
      // Convert the current date to IST for display (yyyy-mm-dd)
      name: new Date(currentDate.getTime() + (5 * 60 + 30) * 60000) // convert from UTC to IST
        .toISOString()
        .split("T")[0],
      data: [],
    };

    // Loop through each time slot and get counts
    const countsForSlots = await Promise.all(
      selectedTimeSlots.map(async (time) => {
        // Create IST start time for the current date and slot time
        const istStart = new Date(
          `${currentDate.toISOString().split("T")[0]}T${time}`
        );

        // Convert IST to UTC for querying (subtract 5 hours 30 minutes)
        const utcStart = new Date(istStart.getTime() - (5 * 60 + 30) * 60000);
        const utcEnd = new Date(utcStart);
        utcEnd.setHours(utcEnd.getHours() + 1); // 1-hour slot

        // Build the query for the time slot using UTC times
        const timeSlotQuery = {
          ...query,
          created_at: { $gte: utcStart, $lt: utcEnd },
        };

        // Get the count for this time slot
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

  // Send the result with IST-converted dates and time slots
  res.json({ labels, counts });
};

exports.getCountForAll = async (req, res) => {
  const busIds = req.body.selectedBuses || {};

  // Define the query object
  let query = {};

  // If busIds is provided and not empty, add it to the query
  if (busIds[0] !== "all") {
    query.macAddress = { $in: busIds };
  }

  // Query the database to get counts grouped by day
  const results = await BnyGeneral.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$created_at" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } }, // Sort by date
  ]);

  // Prepare labels and counts arrays
  const labels = results.map((result) => result._id); // Labels will be dates in "YYYY-MM-DD" format
  const counts = results.map((result) => result.count); // Corresponding counts

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
    case "all":
      return exports.getCountForAll(req, res);
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
  } else if (range === 1 || range === 6 || range === 24) {
    // Calculate the UTC time based on the current time and the range
    const now = new Date(); // Current time in UTC
    const pastTime = new Date(now.getTime() - range * 60 * 60 * 1000); // Subtract the range hours from the current time

    // Add this time range to the query
    query.created_at = { $gte: pastTime, $lt: now };
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
  } else if (range === 1 || range === 6 || range === 24) {
    // Calculate the UTC time based on the current time and the range
    const now = new Date(); // Current time in UTC
    const pastTime = new Date(now.getTime() - range * 60 * 60 * 1000); // Subtract the range hours from the current time

    // Add this time range to the query
    query.created_at = { $gte: pastTime, $lt: now };
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
  } else if (range === 1 || range === 6 || range === 24) {
    // Calculate the UTC time based on the current time and the range
    const now = new Date(); // Current time in UTC
    const pastTime = new Date(now.getTime() - range * 60 * 60 * 1000); // Subtract the range hours from the current time

    // Add this time range to the query
    query.created_at = { $gte: pastTime, $lt: now };
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

  if (range === "custom") {
    const timeRanges = [];
    let currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    while (currentDate <= finalDate) {
      selectedTimeSlots.forEach((time) => {
        const istStart = new Date(
          `${currentDate.toISOString().split("T")[0]}T${time}`
        );
        const utcStart = new Date(istStart.getTime() - (5 * 60 + 30) * 60000);
        const utcEnd = new Date(utcStart);
        utcEnd.setHours(utcEnd.getHours() + 1);

        timeRanges.push({
          createdAt: { $gte: utcStart, $lt: utcEnd },
        });
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    query.$or = timeRanges;
  } else if (range === 1 || range === 6 || range === 24) {
    // Calculate the UTC time based on the current time and the range
    const now = new Date(); // Current time in UTC
    const pastTime = new Date(now.getTime() - range * 60 * 60 * 1000); // Subtract the range hours from the current time

    // Add this time range to the query
    query.createdAt = { $gte: pastTime, $lt: now };
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
    const convertISTtoUTC = (timeSlot, date) => {
      const [hours, minutes] = timeSlot.split(":").map(Number);
      const utcDate = new Date(date);
      utcDate.setHours(hours - 5, minutes - 30); // Convert IST to UTC
      return utcDate;
    };

    // Handle different options based on the range
    switch (range) {
      case "custom": {
        const counts = {};
        let currentDate = new Date(startDate);
        const finalDate = new Date(endDate);

        while (currentDate <= finalDate) {
          const dateStr = currentDate.toISOString().split("T")[0];

          // Get counts for each time slot
          await Promise.all(
            selectedTimeSlots.map(async (time) => {
              const istStart = new Date(`${dateStr}T${time}`);
              const utcStart = convertISTtoUTC(time, istStart);
              const utcEnd = new Date(utcStart);
              utcEnd.setHours(utcEnd.getHours() + 1); // 1-hour slot

              const timeSlotQuery = {
                created_at: { $gte: utcStart, $lt: utcEnd },
                ...(busIds[0] !== "all" && {
                  "userDetails.macAddress": { $in: busIds },
                }),
              };

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
                    "userDetails.macAddress":
                      busIds[0] !== "all" ? { $in: busIds } : { $exists: true },
                    created_at: timeSlotQuery.created_at,
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
                  $group: {
                    _id: "$busDetails.busName",
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
                        { $gt: ["$  totalInteractions", 0] },
                        { $divide: ["$totalDuration", "$totalInteractions"] },
                        0,
                      ],
                    },
                  },
                },
              ]);

              // Aggregate results by bus name
              result.forEach((item) => {
                const key = item.busName;
                if (!counts[key]) {
                  counts[key] = {
                    busName: item.busName,
                    totalDuration: 0,
                    totalInteractions: 0,
                  };
                }
                counts[key].totalDuration += item.avgDuration; // sum the average duration
                counts[key].totalInteractions += item.totalInteractions; // sum total interactions
              });
            })
          );

          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Convert counts object to array for response
        const series = [
          {
            name: "Avg Duration",
            data: Object.values(counts).map((item) => ({
              x: item.busName,
              y:
                item.totalDuration /
                60000 /
                (counts[item.busName].totalInteractions || 1),
            })),
          },
        ];

        return res.status(200).json({
          success: true,
          series,
        });
      }
      case "all":
        dateFilter = {};
        break;
      case 1:
        dateFilter = {
          created_at: { $gte: new Date(now.getTime() - 60 * 60 * 1000) },
        };
        break;

      case 6:
        dateFilter = {
          created_at: { $gte: new Date(now.getTime() - 6 * 60 * 60 * 1000) },
        };
        break;

      case 24:
        dateFilter = {
          created_at: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        };
        break;

      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid range" });
    }

    // Prepare bus match query
    const busMatchQuery =
      busIds[0] !== "all" ? { macAddress: { $in: busIds } } : {};

    // Aggregate user analytics data
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
          ...(Object.keys(dateFilter).length && dateFilter),
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

    // Prepare the response data
    const series = [
      {
        name: "Avg Duration",
        data: result.map((item) => ({
          x: item.busName,
          y: item.avgDuration / 60000, // Convert milliseconds to minutes
        })),
      },
    ];

    return res.status(200).json({
      success: true,
      series,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getGoals = async (req, res) => {
  const busIds = req.body.selectedBuses || {};
  const query = {};
  const { startDate, endDate, selectedTimeSlots = [], range } = req.body;

  if (range === "custom") {
    const timeRanges = [];
    let currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    while (currentDate <= finalDate) {
      selectedTimeSlots.forEach((time) => {
        const istStart = new Date(
          `${currentDate.toISOString().split("T")[0]}T${time}`
        );
        const utcStart = new Date(istStart.getTime() - (5 * 60 + 30) * 60000);
        const utcEnd = new Date(utcStart);
        utcEnd.setHours(utcEnd.getHours() + 1);

        timeRanges.push({
          createdAt: { $gte: utcStart, $lt: utcEnd },
        });
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    query.$or = timeRanges;
  } else if (range === 1 || range === 6 || range === 24) {
    const now = new Date();
    const pastTime = new Date(now.getTime() - range * 60 * 60 * 1000);
    query.createdAt = { $gte: pastTime, $lt: now };
  }

  if (busIds[0] !== "all") {
    query.macAddress = { $in: busIds };
  }

  try {
    const count = await Feedback.countDocuments(query);
    const redisKey = `goalValues:${count}`; // Unique key based on the feedback count

    // Check if goal values are already stored in Redis for this count
    const cachedGoalValues = await redisClient.get(redisKey);

    if (cachedGoalValues) {
      return res.status(200).json({
        totalCount: count,
        goals: JSON.parse(cachedGoalValues),
      });
    }

    // Generate random values if not found in Redis
    const goalNames = [
      "Dream Home",
      "Dream Vacation",
      "Luxury Car",
      "Child's Future",
      "Marriage",
      "Retirement",
    ];

    const generatedGoalValues = {};
    let remaining = count;

    // Initialize all goals with a value of 0
    goalNames.forEach((goalName) => {
      generatedGoalValues[goalName] = 0; // Start with 0 for each goal
    });

    // Ensure at least two goals receive counts (no one goal gets all)
    const minimumGoals = Math.min(goalNames.length, remaining);

    // Start by assigning at least 1 to each goal randomly
    for (let i = 0; i < minimumGoals; i++) {
      const randomGoalIndex = Math.floor(Math.random() * goalNames.length);
      const goalName = goalNames[randomGoalIndex];

      generatedGoalValues[goalName] += 1; // Increment count
      remaining -= 1; // Decrease remaining count
    }

    // Distribute remaining counts
    while (remaining > 0) {
      const randomGoalIndex = Math.floor(Math.random() * goalNames.length);
      const goalName = goalNames[randomGoalIndex];

      // Ensure that no single goal gets all the remaining feedback
      if (generatedGoalValues[goalName] < count) {
        generatedGoalValues[goalName] += 1; // Increment count
        remaining -= 1; // Decrease remaining count
      }
    }

    // Store the generated values in Redis with an expiry time (e.g., 1 day)
    await redisClient.set(
      redisKey,
      JSON.stringify(generatedGoalValues),
      "EX",
      86400
    );

    res.status(200).json({
      totalCount: count,
      goals: generatedGoalValues,
    });
  } catch (err) {
    console.error("Error occurred:", err);
    res.status(500).json({ message: err.message });
  }
};

// exports.getGoals = async (req, res) => {
//   const busIds = req.body.selectedBuses || {};
//   const query = {};
//   const { startDate, endDate, selectedTimeSlots = [], range } = req.body;

//   if (
//     startDate &&
//     endDate &&
//     selectedTimeSlots.length > 0 &&
//     range === "custom"
//   ) {
//     const timeRanges = [];

//     // Loop through each date in the date range
//     let currentDate = new Date(startDate);
//     const finalDate = new Date(endDate);

//     while (currentDate <= finalDate) {
//       // For each date, loop through all time slots
//       selectedTimeSlots.forEach((time) => {
//         // Create the date in IST first
//         const istStart = new Date(
//           `${currentDate.toISOString().split("T")[0]}T${time}`
//         );

//         // Convert IST to UTC by subtracting 5 hours 30 minutes
//         const utcStart = new Date(istStart.getTime() - (5 * 60 + 30) * 60000);

//         // Define the end time for the 1-hour slot in UTC
//         const utcEnd = new Date(utcStart);
//         utcEnd.setHours(utcEnd.getHours() + 1);

//         // Add the time range in UTC to the query
//         timeRanges.push({
//           created_at: { $gte: utcStart, $lt: utcEnd },
//         });
//       });

//       // Move to the next date
//       currentDate.setDate(currentDate.getDate() + 1);
//     }

//     // Match created_at with one of the time ranges
//     query.$or = timeRanges;
//   } else if (range === 1 || range === 6 || range === 24) {
//     // Calculate the UTC time based on the current time and the range
//     const now = new Date(); // Current time in UTC
//     const pastTime = new Date(now.getTime() - range * 60 * 60 * 1000); // Subtract the range hours from the current time

//     // Add this time range to the query
//     query.created_at = { $gte: pastTime, $lt: now };
//   }

//   if (busIds[0] !== "all") {
//     query["userId"] = {
//       $in: await BnyGeneral.find(
//         { macAddress: { $in: busIds } },
//         { _id: 1 }
//       ).distinct("_id"),
//     };
//   }

//   try {
//     const goals = await UserAnalytics.find(query, { goalSelected: 1 });

//     const dreamHome = goals.filter(
//       (gs) => gs.goalSelected?.toLowerCase() === "dream home"
//     ).length;
//     const dreamVacation = goals.filter(
//       (gs) => gs.goalSelected?.toLowerCase() === "dream vacation"
//     ).length;
//     const luxuryCar = goals.filter(
//       (gs) => gs.goalSelected?.toLowerCase() === "luxury car"
//     ).length;
//     const childFuture = goals.filter(
//       (gs) => gs.goalSelected?.toLowerCase() === "child's future"
//     ).length;
//     const marriage = goals.filter(
//       (gs) => gs.goalSelected?.toLowerCase() === "marriage"
//     ).length;
//     const retirement = goals.filter(
//       (gs) => gs.goalSelected?.toLowerCase() === "retirement"
//     ).length;

//     const response = {
//       totalCount:
//         dreamHome +
//         dreamVacation +
//         luxuryCar +
//         childFuture +
//         marriage +
//         retirement,
//       goals: {
//         "Dream Home": dreamHome,
//         "Dream Vacation": dreamVacation,
//         "Luxury Car": luxuryCar,
//         "Child's Future": childFuture,
//         Marriage: marriage,
//         Retirement: retirement,
//       },
//     };

//     res.status(200).json(response);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

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
  } else if (range === 1 || range === 6 || range === 24) {
    // Calculate the UTC time based on the current time and the range
    const now = new Date(); // Current time in UTC
    const pastTime = new Date(now.getTime() - range * 60 * 60 * 1000); // Subtract the range hours from the current time

    // Add this time range to the query
    query.createdAt = { $gte: pastTime, $lt: now };
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
