import cors from "cors";
import express from "express";
import helmet from "helmet";

import { isProduction } from "./config/env.js";
import { corsOptions } from "./middleware/cors.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { globalRateLimiter } from "./middleware/rate-limit.js";
import { requestLogger } from "./middleware/request-logger.js";
import v1Routes from "./routes/v1/index.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(requestLogger);

  app.use(
    helmet({
      contentSecurityPolicy: isProduction
        ? undefined
        : { directives: { defaultSrc: ["'self'"] } },
      crossOriginResourcePolicy: { policy: "cross-origin" },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    }),
  );

  app.use(cors(corsOptions()));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  app.use(globalRateLimiter);

  app.get("/", (req, res) => {
    res.json({
      success: true,
      data: {
        name: "SM Store API",
        version: "0.1.0",
        health: "/api/v1/health",
      },
      message: "OK",
    });
  });

  app.use("/api/v1", v1Routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
