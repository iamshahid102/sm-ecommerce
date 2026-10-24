import { Router } from "express";

import { health, readiness } from "../../controllers/system.controller.js";

const router = Router();

router.get("/health", health);
router.get("/health/ready", readiness);

export default router;
