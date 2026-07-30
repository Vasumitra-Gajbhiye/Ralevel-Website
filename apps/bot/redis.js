const Redis = require("ioredis");

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is required");
}

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  // Reconnect with backoff so transient Coolify/Redis blips do not kill the process
  retryStrategy(times) {
    const delay = Math.min(times * 200, 5000);
    console.warn(`[redis] reconnect attempt ${times}, waiting ${delay}ms`);
    return delay;
  },
  enableReadyCheck: true,
});

redis.on("error", (err) => {
  // Log only — do not rethrow; ioredis will reconnect via retryStrategy
  console.error("[redis] connection error:", err.message);
});

redis.on("reconnecting", () => {
  console.warn("[redis] reconnecting…");
});

redis.on("connect", () => {
  console.log("[redis] connected");
});

module.exports = redis;
