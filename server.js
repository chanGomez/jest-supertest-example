// Import required modules
import express from "express";
import { createClient } from "redis";

// Initialize Express app
const app = express();
const port = 3000;

// Create Redis client
const redisClient = createClient();

redisClient.on("error", (err) => console.error("Redis Client Error:", err));

// Connect Redis client
async function connectRedis() {
  await redisClient.connect();
}

connectRedis();

// Middleware to parse JSON request bodies
app.use(express.json());

// Route to set a key-value pair in Redis
app.post("/set", async (req, res) => {
  let { key, value } = req.body;
  key = "hell";
  value = "yeah";
  if (!key || !value) {
    return res.status(400).json({ message: "Key and value are required" });
  }

  try {
    await redisClient.set(key, value);
    res.status(200).json({ message: `Key "${key}" set successfully!` });
  } catch (err) {
    res.status(500).json({ message: "Error setting key", error: err.message });
  }
});
app.get("/set", async (req, res) => {
  let key = "hell2";
  let value = "yeah2";
  if (!key || !value) {
    return res.status(400).json({ message: "Key and value are required" });
  }

  try {
    await redisClient.set(key, value);
    res.status(200).json({ message: `Key "${key}" set successfully!` });
  } catch (err) {
    res.status(500).json({ message: "Error setting key", error: err.message });
  }
});

async function cache(req, res, next) {
  const { key } = req.params;
  console.log("hi");
  console.log(redisClient.get);
  const data = await redisClient.get(key);
  if (!data) {
    next();
  } else {
    res.send(data);
  }
}
// Route to get a value by key from Redis
app.get("/get/:key", cache, async (req, res) => {
  const { key } = req.params;
  console.log("nope");
  try {
    //request to db to retrieve data and then saving that to redisClient for live memory
    //query to DB
    //redisClient.set(key, data(data from query to DB ))
    res.status(200).json({ key, value });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving key", error: err.message });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
