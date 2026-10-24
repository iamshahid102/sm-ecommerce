import { Router } from "express";

import systemRoutes from "./system.routes.js";

const router = Router();

router.use(systemRoutes);

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
