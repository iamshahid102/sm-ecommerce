import { rateLimit } from "express-rate-limit";

import { isTest } from "../config/env.js";
import { sendError } from "../utils/http.js";

function handler(req, res) {
  return sendError(res, {
    status: 429,
    error: "Too many requests. Please try again later.",
    code: "RATE_LIMITED",
  });
}

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => isTest,
  handler,
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => isTest,
  handler,
});

export const contactRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => isTest,
  handler,
});
