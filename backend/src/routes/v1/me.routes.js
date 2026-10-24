import { Router } from "express";

import {
  getMe,
  updateMe,
  updatePassword,
} from "../../controllers/profile.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { authRateLimiter } from "../../middleware/rate-limit.js";
import { validate } from "../../middleware/validate.js";
import {
  changePasswordSchema,
  updateProfileSchema,
} from "../../validators/profile.validator.js";

const router = Router();

router.use(requireAuth);

router.get("/", getMe);

router.put("/", validate({ body: updateProfileSchema }), updateMe);

router.post(
  "/password",
  authRateLimiter,
  validate({ body: changePasswordSchema }),
  updatePassword,
);

export default router;
