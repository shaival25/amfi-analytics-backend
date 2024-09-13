const Bus = require("../models/bus");

exports.getBusName = (macAddress) => {
  // console.log(macAddress);
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
