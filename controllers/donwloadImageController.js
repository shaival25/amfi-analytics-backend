const path = require("path");
const fs = require("fs");
const BusController = require("../controllers/busController");
const config = require("../config/config");
const moment = require("moment-timezone");
const ExcelJS = require("exceljs");
const UserAnalytics = require("../models/userAnalytics");
const Sipcalcs = require("../models/sipCalc");
const Feedbacks = require("../models/feedback");
const BnyGeneral = require("../models/bnyGeneral");
const redis = require("../config/redisClient");

function convertMillisecondsToMinutes(milliseconds) {
  // Convert milliseconds to total seconds
  const totalSeconds = Math.floor(milliseconds / 1000);

  // Get the minutes and remaining seconds
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Return formatted as "minutes:seconds", ensuring seconds are always two digits
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

exports.downloadImages = async (req, res) => {
  const { filename } = req.params;
  const { macAddress } = req.params;

  const busName = await BusController.getBusName(macAddress); // Get the bus name dynamically
  const uploadsFolder = path.join(
    __dirname,
    `../uploads/${busName}/photo-booth-images`
  );
  const filePath = path.join(uploadsFolder, filename);
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error("Image expired!!");
    }
    res.download(filePath);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.getUserData = async (req, res) => {
  try {
    // Fetch all documents from bnygeneral
    const generalDocs = await BnyGeneral.find({}).sort({ created_at: -1 });

    // Collecting all user IDs for batch fetching
    const userIds = generalDocs.map((doc) => doc._id);

    // Fetching data in batches
    const userAnalyticsMap = await UserAnalytics.find({
      userId: { $in: userIds },
    }).lean();
    const sipCalcsMap = await Sipcalcs.find({
      userId: { $in: userIds },
    }).lean();
    const feedbacksMap = await Feedbacks.find({
      userId: { $in: userIds },
    }).lean();

    // Maps for lookup
    const userAnalyticsLookup = {};
    const sipCalcsLookup = {};
    const feedbacksLookup = {};

    userAnalyticsMap.forEach((ua) => {
      userAnalyticsLookup[ua.userId] = ua;
    });

    sipCalcsMap.forEach((sc) => {
      sipCalcsLookup[sc.userId] = sc;
    });

    feedbacksMap.forEach((fb) => {
      feedbacksLookup[fb.userId] = fb;
    });

    // Preparing Excel data
    const dataForExcel = await Promise.all(
      generalDocs.map(async (doc) => {
        const age = moment().diff(moment(doc.dob), "years");
        const istDate = moment(doc.created_at).tz("Asia/Kolkata");
        const formattedDate = istDate.format("DD-MM-YYYY");
        const formattedTime = istDate.format("HH:mm:ss");
        const busName = await BusController.getBusName(doc.macAddress);

        // Lookup related data
        const userAnalytics = userAnalyticsLookup[doc._id] || {};
        const sipCalcs = sipCalcsLookup[doc._id] || {};
        const feedbacks = feedbacksLookup[doc._id];
        const question1 = feedbacks?.responses[0]?.response || "N/A";
        const question2 = feedbacks?.responses[1]?.response || "N/A";
        const question3 = feedbacks?.responses[2]?.response || "N/A";
        return {
          busName,
          date: formattedDate,
          city: doc.city,
          state: doc.state,
          fullname: doc.fullName,
          email: doc.email,
          contactNumber: doc.contactNumber,
          gender: doc.gender,
          dob: doc.dob,
          age,
          time: formattedTime,
          goalOption: userAnalytics.goalSelected || "N/A",
          goalAmount: sipCalcs.maturityAmount || "N/A",
          investmentDuration: sipCalcs.investmentDuration
            ? (sipCalcs.investmentDuration / 12).toFixed(1)
            : "N/A",
          expectedROR: sipCalcs.expectedROR
            ? (sipCalcs.expectedROR * 100).toFixed(1)
            : "N/A",
          totalInvestment: sipCalcs.totalInvestment
            ? sipCalcs.totalInvestment.toFixed(1)
            : "N/A",
          monthlyInvestment: sipCalcs.monthlyInvestment || "N/A",
          feedbacks: feedbacks ? "Y" : "N",
          emailSent:
            userAnalytics.goalSelected && sipCalcs
              ? userAnalytics.emailSent
                ? "Y"
                : "N"
              : "N/A",
          interactionDuration: userAnalytics.journeyDuration
            ? convertMillisecondsToMinutes(userAnalytics.journeyDuration)
            : "N/A",
          question1,
          question2,
          question3,
        };
      })
    );

    // Excel Creation
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Data");

    // Sheet Headers
    worksheet.columns = [
      { header: "Bus Name", key: "busName" },
      { header: "Date", key: "date" },
      { header: "City", key: "city" },
      { header: "State", key: "state" },
      { header: "Visitor Name", key: "fullname" },
      { header: "Email Id", key: "email" },
      { header: "Phone No", key: "contactNumber" },
      { header: "Gender M/F", key: "gender" },
      { header: "DOB", key: "dob" },
      { header: "Age", key: "age" },
      { header: "Time", key: "time" },
      { header: "Goal Option", key: "goalOption" },
      { header: "Goal Amnt", key: "goalAmount" },
      { header: "Investment Duration", key: "investmentDuration" },
      { header: "Rate of Return", key: "expectedROR" },
      { header: "Monthly SIP Amount", key: "monthlyInvestment" },
      { header: "Total Investment", key: "totalInvestment" },
      { header: "Feedback Y/N", key: "feedbacks" },
      { header: "Email Sent Y/N", key: "emailSent" },
      { header: "Interaction Duration", key: "interactionDuration" },
      { header: "How was your Overall Experience", key: "question1" },
      {
        header: "Did you find the information provided useful?",
        key: "question2",
      },
      {
        header:
          "How likely are you to recommend mutual funds to friends or family?",
        key: "question3",
      },
    ];

    // Add Data Rows
    dataForExcel.forEach((user) => {
      worksheet.addRow(user);
    });

    // Set response headers for Excel file
    const today = new Date();
    const dateString = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=User_Data-${dateString}.xlsx`
    );

    // Stream Excel
    await workbook.xlsx.write(res);

    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
