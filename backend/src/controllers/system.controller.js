import { getHealth, getReadiness } from "../services/system.service.js";
import { sendSuccess, sendError } from "../utils/http.js";

export async function health(req, res) {
  const data = await getHealth();
  return sendSuccess(res, data, { message: "Service is healthy." });
}

export async function readiness(req, res) {
  const data = await getReadiness();

  if (!data.ready) {
    return sendError(res, {
      status: 503,
      error: "Service is not ready.",
      code: "NOT_READY",
      details: data,
    });
  }

  return sendSuccess(res, data, { message: "Service is ready." });
}
