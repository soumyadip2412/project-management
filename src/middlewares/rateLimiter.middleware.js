import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { createClient } from "redis";

// Create a Redis client
const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

let store;
(async () => {
    try {
        await redisClient.connect();
        console.log("Redis connected successfully for rate limiting");
        store = new RedisStore({
            sendCommand: (...args) => redisClient.sendCommand(args),
        });
    } catch (error) {
        console.warn("Redis store unavailable for rate limiting, falling back to memory store");
    }
})();

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    store: store || undefined,
    message: {
        success: false,
        message: "Too many requests, please try again later"
    }
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Strict limit of 20 auth attempts per 15 minutes per IP
    standardHeaders: true,
    legacyHeaders: false,
    store: store || undefined,
    message: {
        success: false,
        message: "Too many authentication attempts. Please try again after 15 minutes."
    }
});
