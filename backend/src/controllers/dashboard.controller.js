import { getDashboardSummary } from "../services/dashboard.service.js";
import { sendSuccess } from "../utils/http.js";

export async function getDashboard(req, res) {
  const data = await getDashboardSummary();

  return sendSuccess(res, data, { message: "Dashboard loaded." });
}
