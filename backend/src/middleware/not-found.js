import { sendError } from "../utils/http.js";

export function notFoundHandler(req, res) {
  return sendError(res, {
    status: 404,
    error: `Route ${req.method} ${req.originalUrl} was not found.`,
    code: "NOT_FOUND",
  });
}
