const config = require("../config/config");
const Bus = require("../models/bus");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
function askBusName() {
  return new Promise((resolve) => {
    rl.question("Enter bus name: ", (answer) => {
      resolve(answer);
    });
  });
}
exports.initialize = async () => {
  try {
    if (!config.macAddress) {
      console.log("No macAddress provided. Exiting.");
      process.exit(1);
    }
    // Check if the config string exists in the collection
    const existingEntry = await Bus.findOne({
      macAddress: config.macAddress,
    });

    if (existingEntry) {
      console.log(`Binded ${existingEntry.busName} with macAddress`);
    } else {
      const busName = await askBusName();

      // Store new entry in the database
      const newBus = new Bus({ busName, macAddress: config.macAddress });
      await newBus.save();
      console.log(
        `Saved new bus ${busName} with macAddress ${config.macAddress} to the database.`
      );
    }

    rl.close(); // Close readline interface
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
};

exports.getBusName = (macAddress) => {
  console.log(macAddress);
  return new Promise((resolve, reject) => {
    Bus.findOne({ macAddress })
      .then((bus) => {
        if (!bus) {
          reject(new Error("Bus not found"));
        } else {
          resolve(bus.busName);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};
