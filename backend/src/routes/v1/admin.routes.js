import { Router } from "express";

import { getDashboard } from "../../controllers/dashboard.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/dashboard", getDashboard);

export default router;
