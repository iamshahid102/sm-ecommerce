import pino from "pino";

import { env, isProduction, isTest } from "../config/env.js";

const transport =
  !isProduction && !isTest
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined;

export const logger = pino({
  level: isTest ? "silent" : env.LOG_LEVEL,
  base: {
    service: "sm-store-api",
    environment: env.NODE_ENV,
  },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers['set-cookie']",
      "*.password",
      "*.token",
      "*.access_token",
      "*.refresh_token",
    ],
    censor: "[redacted]",
  },
  transport,
});
