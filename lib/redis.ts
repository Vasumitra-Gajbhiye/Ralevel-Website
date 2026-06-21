import Redis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var redisClient: Redis | null | undefined;
  // eslint-disable-next-line no-var
  var redisUnavailableLogged: boolean | undefined;
}

const REDIS_ENABLED = process.env.REDIS_ENABLED !== "false";

function createClient(): Redis | null {
  if (!REDIS_ENABLED) return null;

  const url = process.env.REDIS_URL;
  if (!url) {
    if (!global.redisUnavailableLogged) {
      console.warn("[redis] REDIS_URL not set — caching and rate limiting disabled");
      global.redisUnavailableLogged = true;
    }
    return null;
  }

  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableOfflineQueue: false,
  });

  client.on("error", (err) => {
    if (!global.redisUnavailableLogged) {
      console.warn("[redis] connection error:", err.message);
      global.redisUnavailableLogged = true;
    }
  });

  return client;
}

export function getRedis(): Redis | null {
  if (!REDIS_ENABLED) return null;

  if (global.redisClient === undefined) {
    global.redisClient = createClient();
  }

  return global.redisClient;
}

export async function isRedisReady(): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;

  try {
    if (client.status === "wait") {
      await client.connect();
    }
    const pong = await client.ping();
    global.redisUnavailableLogged = false;
    return pong === "PONG";
  } catch {
    return false;
  }
}
