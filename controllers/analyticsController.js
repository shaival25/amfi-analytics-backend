const FaceDetection = require("../models/faceDetection");
const GenerateQR = require("../models/generateQR");
const PersonCounter = require("../models/personCounter");
const redis = require("../config/redisClient");
exports.getCountForLastHour = async (req, res) => {
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
      const count = await FaceDetection.countDocuments({
        created_at: { $gte: start, $lt: end },
      });
      return count;
    })
  );

  res.json({ labels, counts });
};

exports.getCountForLastSixHours = async (req, res) => {
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
      const count = await FaceDetection.countDocuments({
        created_at: { $gte: start, $lt: end },
      });
      return count;
    })
  );

  res.json({ labels, counts });
};

exports.getCountForLastTwentyFourHours = async (req, res) => {
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
      const count = await FaceDetection.countDocuments({
        created_at: { $gte: start, $lt: end },
      });
      return count;
    })
  );

  res.json({ labels, counts });
};

exports.getCountForLastMonth = async (req, res) => {
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
      const count = await FaceDetection.countDocuments({
        created_at: { $gte: start, $lt: end },
      });
      return count;
    })
  );

  res.json({ labels, counts });
};

exports.getCountForLastYear = async (req, res) => {
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
      const count = await FaceDetection.countDocuments({
        created_at: { $gte: start, $lt: end },
      });
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
  try {
    const cachedData = await redis.get("full_count");
    if (cachedData) {
      res.status(200).json(JSON.parse(cachedData));
      return;
    }
    const count = await FaceDetection.countDocuments();
    await redis.set("full_count", JSON.stringify(count), "EX", 3600);
    res.status(200).json(count);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMascotCount = async (req, res) => {
  try {
    const cachedData = await redis.get("mascot_count");
    if (cachedData) {
      res.status(200).json(JSON.parse(cachedData));
      return;
    }
    const generateQR = await GenerateQR.find({}, { mascot: 1 });
    const sachinCount = generateQR.filter((fd) => fd.mascot === 0).length;
    const rohitCount = generateQR.filter((fd) => fd.mascot === 1).length;
    const dhoniCount = generateQR.filter((fd) => fd.mascot === 2).length;

    await redis.set(
      "mascot_count",
      JSON.stringify({
        totalCount: generateQR.length,
        cricketer: {
          sachin: sachinCount,
          rohit: rohitCount,
          dhoni: dhoniCount,
        },
      })
    );

    res
      .status(200)
      .json({ sachin: sachinCount, rohit: rohitCount, dhoni: dhoniCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPersonCount = async (req, res) => {
  try {
    const cachedData = await redis.get("person_count");
    if (cachedData) {
      res.status(200).json(JSON.parse(cachedData));
      return;
    }
    const personCount = await PersonCounter.findOne();
    await redis.set("person_count", JSON.stringify(personCount), "EX", 3600);
    res.status(200).json(personCount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
