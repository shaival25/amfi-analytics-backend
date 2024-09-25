const Bus = require("../models/bus");

exports.getBusName = (macAddress) => {
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

exports.getAllBuses = async (req, res) => {
  try {
    const Buses = await Bus.find({}, { macAddress: 1, busName: 1 }).sort({
      busName: 1,
    });
    res.status(200).json(Buses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
