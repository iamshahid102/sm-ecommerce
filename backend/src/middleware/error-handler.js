import { ZodError } from "zod";

import { isProduction, isTest } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";
import { logger } from "../utils/logger.js";
import { sendError } from "../utils/http.js";

function normalizeZodError(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "body",
    message: issue.message,
    code: issue.code,
  }));
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof ZodError) {
    return sendError(res, {
      status: 422,
      error: "Validation failed.",
      code: "VALIDATION_ERROR",
      details: normalizeZodError(error),
    });
  }

  if (error instanceof ApiError) {
    if (error.statusCode >= 500) {
      logger.error({ err: error, requestId: req.id }, "Operational error");
    }

    return sendError(res, {
      status: error.statusCode,
      error: error.message,
      code: error.code,
      details: error.details,
    });
  }

  if (error?.type === "entity.too.large") {
    return sendError(res, {
      status: 413,
      error: "Request body is too large.",
      code: "PAYLOAD_TOO_LARGE",
    });
  }

  if (error instanceof SyntaxError && "body" in error) {
    return sendError(res, {
      status: 400,
      error: "Malformed JSON body.",
      code: "INVALID_JSON",
    });
  }

  logger.error(
    { err: error, requestId: req.id, path: req.originalUrl },
    "Unhandled error",
  );

  return sendError(res, {
    status: 500,
    error: isProduction ? "Internal server error." : error.message,
    code: "INTERNAL_ERROR",
    details:
      !isProduction && !isTest && error.stack
        ? { stack: error.stack.split("\n").slice(0, 8) }
        : undefined,
  });
}
