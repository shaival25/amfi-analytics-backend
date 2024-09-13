const Redis = require("ioredis");
require("dotenv").config();

const redis = new Redis();

redis.on("connect", () => {
  redis.flushdb(function (err, succeeded) {
    console.log("Connected to Redis");
  });
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

module.exports = redis;
