import { Router } from "express";

import adminRoutes from "./admin.routes.js";
import meRoutes from "./me.routes.js";
import systemRoutes from "./system.routes.js";

const router = Router();

router.use(systemRoutes);
router.use("/me", meRoutes);
router.use("/admin", adminRoutes);

router.get("/", (req, res) => {
  res.json({
    success: true,
    data: {
      name: "SM Store API",
      version: "v1",
      documentation: "/api/v1/health",
    },
    message: "OK",
  });
});

export default router;
