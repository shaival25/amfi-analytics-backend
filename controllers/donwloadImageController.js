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
    const dataForExcel = [];

    for (const doc of generalDocs) {
      // Calculate Age from DOB
      const age = moment().diff(moment(doc.dob), "years");

      // Convert created_at from UTC to IST
      const istDate = moment(doc.created_at).tz("Asia/Kolkata");
      const formattedDate = istDate.format("DD-MM-YYYY");
      const formattedTime = istDate.format("HH:mm:ss");

      // Get Bus Name using macAddress
      const busName = await BusController.getBusName(doc.macAddress);

      // Fetch related data from useranalytics, sipcalcs, feedbacks using doc._id
      const userAnalytics = await UserAnalytics.findOne({ userId: doc._id });
      const sipCalcs = await Sipcalcs.findOne({ userId: doc._id });
      const feedbacks = await Feedbacks.findOne({ userId: doc._id });

      // Create a single object with all required fields
      const combinedData = {
        busName: busName,
        date: formattedDate,
        city: doc.city,
        state: doc.state,
        fullname: doc.fullName,
        email: doc.email,
        contactNumber: doc.contactNumber,
        gender: doc.gender,
        dob: doc.dob,
        age: age,
        time: formattedTime,
        goalOption:
          userAnalytics && userAnalytics.goalSelected
            ? userAnalytics.goalSelected
            : "N/A",
        goalAmount: sipCalcs ? sipCalcs.maturityAmount : "N/A",
        investmentDuration: sipCalcs ? sipCalcs.investmentDuration / 12 : "N/A",
        monthlyInvestment: sipCalcs ? sipCalcs.monthlyInvestment : "N/A",
        feedbacks: feedbacks ? "Y" : "N",
        emailSent:
          userAnalytics && userAnalytics.goalSelected && sipCalcs
            ? userAnalytics.emailSent
              ? "Y"
              : "N"
            : "N/A",
      };

      dataForExcel.push(combinedData);
    }

    // Create Excel sheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Data");

    // Add Header Row
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
      { header: "Calculator Amnt", key: "goalAmount" },
      { header: "No of years", key: "investmentDuration" },
      { header: "SIP Amount", key: "monthlyInvestment" },
      { header: "Feedback Y/N", key: "feedbacks" },
      { header: "Email Y/N", key: "emailSent" },
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

    // Send Excel file
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
