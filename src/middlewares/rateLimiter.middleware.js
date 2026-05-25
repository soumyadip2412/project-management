import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { createClient } from "redis";

// Create a Redis client
const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

// Connect to Redis
(async () => {
    try {
        await redisClient.connect();
        console.log("Redis connected successfully for rate limiting");
    } catch (error) {
        console.error("Redis connection failed", error);
    }
})();

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
    }),
    message: {
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes"
    }
});
