const PersonCounter = require("../models/personCounter");

const redis = require("../config/redisClient");

exports.IncreasePersonCounter = async (req, res) => {
  const { counter } = req.params;
  try {
    const personCounter = await PersonCounter.findOneAndUpdate(
      {},
      { $inc: { counter: counter } },
      { new: true }
    );
    await redis.del("personCounter");
    res.status(200).json(personCounter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
