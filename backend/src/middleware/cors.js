import { corsOrigins } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

export function corsOptions() {
  return {
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new ApiError(403, "Origin is not allowed by CORS.", "CORS_REJECTED"),
      );
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    exposedHeaders: ["X-Request-Id", "RateLimit", "RateLimit-Policy"],
    credentials: true,
    maxAge: 86400,
  };
}
