import rateLimit from "express-rate-limit";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

export const generalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later"
  },
  handler: (_req, res) => {
    res.status(429).json(ApiError.tooManyRequests());
  }
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(ApiError.tooManyRequests("Too many auth attempts, please try again later"));
  }
});

export const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(ApiError.tooManyRequests("Search rate limit exceeded"));
  }
});
