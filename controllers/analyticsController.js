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
    const personCount = await BnyGeneral.countDocuments(query);
    res.status(200).json(personCount);
    // const personCount = await PersonCounter.findOne(query);
    // res.status(200).json(personCount ? personCount.counter : 0);
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
            format: "%d-%m-%Y %H:00", // Format as "YYYY-MM-DD HH:00"
            date: "$created_at",
          },
        };
        break;

      case "1-week": // Last week, gap of 1 day
        const startOfWeek = new Date(now.setDate(now.getDate() - 7));
        dateFilter = { $gte: startOfWeek };
        groupByInterval = {
          $dateToString: {
            format: "%d-%m-%Y", // Format as "YYYY-MM-DD"
            date: "$created_at",
          },
        };
        break;

      case "1-month": // Last month, gap of 1 week
        const startOfMonth = new Date(now.setMonth(now.getMonth() - 1));
        dateFilter = { $gte: startOfMonth };
        groupByInterval = {
          $dateToString: {
            format: "%d-%m-%Y", // Format as "YYYY-MM-DD"
            date: "$created_at",
          },
        };
        break;

      case "all-time": // All time
        groupByInterval = {
          $dateToString: {
            format: "%d-%m-%Y", // Format as "YYYY-MM-DD"
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
          busName: "$busDetails.busName",
          journeyDuration: 1,
          interval: groupByInterval,
        },
      },
      // Group by bus and the formatted interval
      {
        $group: {
          _id: {
            busName: "$busName",
            interval: "$interval",
          },
          totalDuration: { $sum: "$journeyDuration" },
          totalInteractions: { $sum: 1 },
        },
      },
      // Calculate average duration for each bus in each interval
      {
        $project: {
          _id: 0,
          busName: "$_id.busName",
          interval: "$_id.interval",
          avgDuration: {
            $cond: [
              { $gt: ["$totalInteractions", 0] },
              { $divide: ["$totalDuration", "$totalInteractions"] },
              0,
            ],
          },
        },
      },
      // Sort the results by interval
      {
        $sort: {
          interval: 1,
        },
      },
    ]);

    // Prepare the data for the response
    const labelsSet = new Set();
    const datasets = {};

    // Populate datasets
    result.forEach((item) => {
      labelsSet.add(item.interval);

      if (!datasets[item.busName]) {
        datasets[item.busName] = [];
      }

      datasets[item.busName].push({
        interval: item.interval,
        avgDuration: item.avgDuration,
      });
    });

    const labels = Array.from(labelsSet).sort(); // Sorted labels array
    const datasetArray = Object.keys(datasets).map((busName) => {
      const dataForBus = new Array(labels.length).fill(0);

      // Populate the data array for each bus, ensuring alignment with labels
      datasets[busName].forEach((item) => {
        const index = labels.indexOf(item.interval);
        dataForBus[index] = (item.avgDuration / 1000).toFixed(2);
      });

      return {
        label: busName,
        data: dataForBus,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        labels,
        datasets: datasetArray,
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
