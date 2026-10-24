import { createApp } from "./app.js";
import {
  assertRequiredProductionConfig,
  env,
} from "./config/env.js";
import { logger } from "./utils/logger.js";

assertRequiredProductionConfig();

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(
    { port: env.PORT, environment: env.NODE_ENV },
    "SM Store API listening",
  );
});

function shutdown(signal) {
  logger.info({ signal }, "Shutting down gracefully");

  server.close((error) => {
    if (error) {
      logger.error({ err: error }, "Error while closing the server");
      process.exit(1);
    }

    logger.info("Server closed");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "Unhandled promise rejection");
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught exception");
  shutdown("uncaughtException");
});
