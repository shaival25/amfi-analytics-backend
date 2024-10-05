const UserAnalytics = require("../models/userAnalytics");
const BnyGeneral = require("../models/bnyGeneral"); // Assuming you have a User model that contains email IDs
const SipCalc = require("../models/sipCalc"); // Assuming the sipCalc model contains investment-related data
const postmark = require("postmark");
const fs = require("fs");
const path = require("path");
const config = require("../config/config");

const templatePath = path.join(__dirname, "..", "email-images", "emailer.html");
const emailTemplate = fs.readFileSync(templatePath, "utf8");

// Initialize Postmark client
const client = new postmark.ServerClient(config.POSTMARK_API_KEY);

const formatIndianCurrency = (amount) => {
  if (amount === undefined || amount === null) return "N/A";
  const [integerPart, decimalPart] = amount.toString().split(".");
  const formattedIntegerPart = integerPart.replace(
    /(\d)(?=(\d\d)+\d$)/g,
    "$1,"
  );
  return `${formattedIntegerPart}${
    decimalPart ? "." + decimalPart.slice(0, 2) : ""
  }`;
};

async function sendEmail() {
  try {
    // Find users in UserAnalytics where emailSent is false
    const analyticsUsers = await UserAnalytics.find({ emailSent: false });

    if (analyticsUsers.length === 0) {
      console.log("No users found with emailSent set to false");
      return;
    }

    // Loop through each user analytics entry
    for (const analyticsUser of analyticsUsers) {
      // Find the corresponding user by userId in the BnyGeneral model
      const user = await BnyGeneral.findById(analyticsUser.userId);

      if (!user) {
        console.log(`No user found for userId: ${analyticsUser.userId}`);
        continue;
      }

      // Find the corresponding investment details from SipCalc using userId
      const sipCalcData = await SipCalc.findOne({
        userId: analyticsUser.userId,
      });

      if (!sipCalcData) {
        console.log(`No SIP data found for userId: ${analyticsUser.userId}`);
        continue;
      }

      // Extract the fields from sipCalcData
      const {
        monthlyInvestment,
        totalInvestment,
        expectedROR,
        investmentDuration,
        maturityAmount,
        goalSelected,
      } = sipCalcData;

      // Replace template placeholders with actual values
      let emailReplacedTemplate = emailTemplate
        .replace("{{name}}", user.fullName || "Valued Customer")
        .replace(
          "{{monthlyInvestment}}",
          formatIndianCurrency(monthlyInvestment)
        )
        .replace("{{monthlyInvestment}}", monthlyInvestment)
        .replace("{{totalInvestment}}", formatIndianCurrency(totalInvestment))
        .replace("{{expectedROR}}", expectedROR || "N/A")
        .replace("{{investmentDuration}}", investmentDuration || "N/A")
        .replace("{{goalAmount}}", formatIndianCurrency(maturityAmount))
        .replace("{{goalSelected}}", goalSelected || "Your Goal");

      if (user && user.email) {
        try {
          // Send email using Postmark
          await client.sendEmail({
            From: "info@bharatniveshyatra.com",
            To: user.email,
            Subject: "Your Personalized Plan from Bharat Nivesh Yatra awaits!",
            HtmlBody: emailReplacedTemplate,
            TextBody: emailReplacedTemplate,
            MessageStream: "outbound",
          });

          // Update emailSent to true after sending the email
          await UserAnalytics.findByIdAndUpdate(analyticsUser._id, {
            emailSent: true,
          });
          console.log(`Email sent to: ${user.email}`);
        } catch (emailError) {
          console.error(`Failed to send email to ${user.email}:`, emailError);
        }
      } else {
        console.log(
          `BnyGeneral not found or email missing for userId: ${analyticsUser.userId}`
        );
      }
    }
  } catch (error) {
    console.error("Error in the email sending process: ", error);
  }
}

module.exports = {
  sendEmail,
};
