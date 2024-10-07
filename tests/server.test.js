// tests/server.test.js
const request = require("supertest");
const app = require("../server");
const redis = require("redis-mock"); // Use redis-mock for mocking Redis

describe("API Endpoints with Redis", () => {
  let redisClient;

  beforeEach(() => {
    redisClient = redis.createClient(); // Create a new Redis client before each test
  });

  afterEach(() => {
    // redisClient.flushAll(); // Clear all mock Redis data between tests
    redisClient.quit(); // Close the Redis client to prevent open handles
  });

  it('should return "Hello World!" on the home route', async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe("Hello World!");
  });

  it("should return JSON data from /api/data and cache the response", async () => {
    const res = await request(app).get("/api/data");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty(
      "message",
      "This is some data from the API"
    );

    redisClient.get("data", (err, reply) => {
      expect(reply).toEqual(
        JSON.stringify({ message: "This is some data from the API" })
      );
    });
  }, 10000);
});
