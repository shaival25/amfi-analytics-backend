const mongoose = require("mongoose");
const ExcelJS = require("exceljs");
const moment = require("moment-timezone");
const BusController = require("../controllers/busController"); // Assuming you have this controller
const cron = require("node-cron");
const postmark = require("postmark");
const config = require("../config/config");
const UserAnalytics = require("../models/userAnalytics");
const Sipcalcs = require("../models/sipCalc");
const Feedbacks = require("../models/feedback");
const BnyGeneral = require("../models/bnyGeneral");

// MongoDB URI
const MONGODB_URI = config.mongoURI;

// Function to connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process with failure
  }
}

function convertMillisecondsToMinutes(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

// Initialize Postmark client
const postmarkClient = new postmark.ServerClient(config.POSTMARK_API_KEY);

// Email configuration
const emailRecipientsBcc = [];

const emailRecipients = [];

// Function to create the Excel file
const generateExcelFile = async () => {
  try {
    const generalDocs = await BnyGeneral.find({}).sort({ created_at: -1 });
    const userIds = generalDocs.map((doc) => doc._id);

    const userAnalyticsMap = await UserAnalytics.find({
      userId: { $in: userIds },
    }).lean();
    const sipCalcsMap = await Sipcalcs.find({
      userId: { $in: userIds },
    }).lean();
    const feedbacksMap = await Feedbacks.find({
      userId: { $in: userIds },
    }).lean();

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

    const dataForExcel = await Promise.all(
      generalDocs.map(async (doc) => {
        const age = moment().diff(moment(doc.dob), "years");
        const istDate = moment(doc.created_at).tz("Asia/Kolkata");
        const formattedDate = istDate.format("DD-MM-YYYY");
        const busName = await BusController.getBusName(doc.macAddress);

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
          feedbacks: feedbacks ? "Y" : "N",
          emailSent:
            userAnalytics.goalSelected && sipCalcs
              ? userAnalytics.emailSent
                ? "Y"
                : "N"
              : "N/A",
          startTime: userAnalytics?.journeyStarted
            ? userAnalytics?.journeyStarted?.toLocaleTimeString("en-US", {
                timeZone: "Asia/Kolkata",
              })
            : "N/A",
          endTime: userAnalytics?.journeyEnded
            ? userAnalytics?.journeyEnded?.toLocaleTimeString("en-US", {
                timeZone: "Asia/Kolkata",
              })
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

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Data");

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
      { header: "Goal Option", key: "goalOption" },
      { header: "Goal Amnt", key: "goalAmount" },
      { header: "Investment Duration", key: "investmentDuration" },
      { header: "Rate of Return", key: "expectedROR" },
      { header: "Monthly SIP Amount", key: "monthlyInvestment" },
      { header: "Total Investment", key: "totalInvestment" },
      { header: "Feedback Y/N", key: "feedbacks" },
      { header: "Email Sent Y/N", key: "emailSent" },
      { header: "Start Time", key: "startTime" },
      { header: "End Time", key: "endTime" },
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

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Function to send email with the Excel attachment
const sendEmail = async (excelBuffer) => {
  const today = new Date();
  const dateString = `${today.getDate().toString().padStart(2, "0")}-${(
    today.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${today.getFullYear()}`;

  const attachment = {
    Name: `User_Data_${dateString}.xlsx`,
    Content: excelBuffer.toString("base64"), // Convert buffer to base64
    ContentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };

  try {
    await postmarkClient.sendEmail({
      From: "info@bharatniveshyatra.com",
      To: emailRecipients.join(","),
      Bcc: emailRecipientsBcc.join(","),
      Subject: `Daily Report - ${dateString}`,
      TextBody: `Attached is the ${dateString} User Data.`,
      Attachments: [attachment],
      MessageStream: "outbound",
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Schedule the task to run daily at 3:25 PM IST
cron.schedule(
  "0 22 * * *",
  async () => {
    await connectToDatabase();

    console.log("Generating Excel file...");
    try {
      const excelBuffer = await generateExcelFile();
      await sendEmail(excelBuffer);
    } catch (error) {
      console.error("Error in cron job:", error);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);
