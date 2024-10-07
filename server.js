// server.js
const express = require("express");
const redis = require("redis");

const app = express();
const redisClient = redis.createClient();

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});


// Middleware function to check Redis cache
function cache(req, res, next) {
  if (!redisClient || !redisClient.connect) {
    return next(); // Skip cache if Redis is not connected
  }

  redisClient.get("data", (err, data) => {
    if (err) throw err;

    if (data) {
      res.status(200).json(JSON.parse(data));
    } else {
      next();
    }
  });
}

// Routes
app.get("/api/data", cache, (req, res) => {
  try {
    const apiResponse = { message: "This is some data from the API" };

    // Set Redis cache for the response (expires in 60 seconds)
    redisClient.setEx("data", 60, JSON.stringify(apiResponse), (err, reply) => {
      if (err) {
        console.error("Redis setEx error:", err); // Log Redis errors
        return res.status(500).json({ error: "Internal Server Error" });
      }
    });

    res.status(200).json(apiResponse);
  } catch (error) {
    console.error("Error in /api/data route:", error); // Log server errors
    res.status(500).json({ error: "Internal Server Error" });
  }
});


const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
