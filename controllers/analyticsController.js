const BnyGeneral = require("../models/bnyGeneral");
const GenerateQR = require("../models/generateQR");
const PersonCounter = require("../models/personCounter");
const redis = require("../config/redisClient");
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
    default:
      return exports.getCountForLastHour(req, res);
  }
};

exports.getFaceDetectionCount = async (req, res) => {
  const busIds = req.body.selectedBuses || {};
  const query = {};

  if (busIds[0] !== "all") {
    query.macAddress = { $in: busIds };
  }
  try {
    const count = await BnyGeneral.countDocuments(query);
    res.status(200).json(count);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMascotCount = async (req, res) => {
  const busIds = req.body.selectedBuses || {};

  const query = {};

  if (busIds[0] !== "all") {
    query.macAddress = { $in: busIds };
  }

  const cacheKey = `mascotCount:${busIds.join("").toString()}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    res.status(200).json(JSON.parse(cached));
    return;
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

    await redis.scan(0, "match", "mascotCount:*").then((keys) => {
      for (const key of keys) {
        if (key.length > 0) {
          redis.del(key);
        }
      }
    });

    await redis.setex(cacheKey, 60 * 60, JSON.stringify(response));

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPersonCount = async (req, res) => {
  const busIds = req.body.selectedBuses || {};
  const query = {};

  if (busIds[0] !== "all") {
    query.macAddress = { $in: busIds };
  }
  try {
    const personCount = await PersonCounter.findOne(query);
    res.status(200).json(personCount ? personCount.counter : 0);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getFeedbackCount = async (req, res) => {
  const busIds = req.body.selectedBuses || {};
  const query = {};

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
  const option = req.body.option || "default"; // default, 1-week, 1-month, all-time

  try {
    let dateFilter = {};
    let groupByInterval = {};
    let dateFormat = {};

    const now = new Date();

    switch (option) {
      case "default": // 1 Day, gap of 3 hours
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        dateFilter = { $gte: startOfDay };
        groupByInterval = {
          $dateToString: {
            format: "%Y-%m-%d %H:00", // Format as "YYYY-MM-DD HH:00"
            date: "$created_at",
          },
        };
        break;

      case "1-week": // Last week, gap of 1 day
        const startOfWeek = new Date(now.setDate(now.getDate() - 7));
        dateFilter = { $gte: startOfWeek };
        groupByInterval = {
          $dateToString: {
            format: "%Y-%m-%d", // Format as "YYYY-MM-DD"
            date: "$created_at",
          },
        };
        break;

      case "1-month": // Last month, gap of 1 week
        const startOfMonth = new Date(now.setMonth(now.getMonth() - 1));
        dateFilter = { $gte: startOfMonth };
        groupByInterval = {
          $dateToString: {
            format: "%Y-%m-%d", // Format as "YYYY-MM-DD"
            date: "$created_at",
          },
        };
        break;

      case "all-time": // All time
        groupByInterval = {
          $dateToString: {
            format: "%Y-%m-%d", // Format as "YYYY-MM-DD"
            date: "$created_at",
          },
        };
        break;

      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid option" });
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
      // Project to include the formatted date for grouping
      {
        $project: {
          journeyDuration: 1,
          interval: groupByInterval,
        },
      },
      // Group by the formatted interval
      {
        $group: {
          _id: "$interval",
          totalDuration: { $sum: "$journeyDuration" },
          totalInteractions: { $sum: 1 },
        },
      },
      // Calculate average duration for each interval
      {
        $project: {
          _id: 0,
          interval: "$_id",
          avgDuration: {
            $cond: [
              { $gt: ["$totalInteractions", 0] },
              { $divide: ["$totalDuration", "$totalInteractions"] },
              0,
            ],
          },
        },
      },
    ]);

    // Separate arrays for labels and durations
    const labels = [];
    const durations = [];

    result.forEach((item) => {
      labels.push(item.interval);
      durations.push(item.avgDuration);
    });

    res.status(200).json({
      success: true,
      data: {
        labels,
        durations,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getGoals = async (req, res) => {
  const busIds = req.body.selectedBuses || {};
  const query = {};

  if (busIds[0] !== "all") {
    query.macAddress = { $in: busIds };
  }

  try {
    const goals = await UserAnalytics.find(query, { goalSelected: 1 });

    const dreamHome = goals.filter(
      (gs) => gs.goalSelected === "Dream Home"
    ).length;
    const dreamVacation = goals.filter(
      (gs) => gs.goalSelected === "Dream Vacation"
    ).length;
    const luxuryCar = goals.filter(
      (gs) => gs.goalSelected === "Luxury Car"
    ).length;
    const education = goals.filter(
      (gs) => gs.goalSelected === "Education"
    ).length;
    const marriage = goals.filter(
      (gs) => gs.goalSelected === "Marriage"
    ).length;
    const retirement = goals.filter(
      (gs) => gs.goalSelected === "Retirement"
    ).length;

    const response = {
      totalCount:
        dreamHome +
        dreamVacation +
        luxuryCar +
        education +
        marriage +
        retirement,
      goals: {
        "Dream Home": dreamHome,
        "Dream Vacation": dreamVacation,
        "Luxury Car": luxuryCar,
        Education: education,
        Marriage: marriage,
        Retirement: retirement,
      },
    };

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
