import { Router } from "express";
import { z } from "zod";

import {
  getBanners,
  getBrands,
  getCategories,
  getHome,
  getMenu,
  getProduct,
  getProductReviews,
  getProducts,
  getPublishedPage,
  getPublishedPages,
  getStoreSettings,
} from "../../controllers/catalog.controller.js";
import {
  postContact,
  postNewsletter,
  postUnsubscribe,
} from "../../controllers/cms.controller.js";
import { contactRateLimiter } from "../../middleware/rate-limit.js";
import { validate } from "../../middleware/validate.js";
import {
  contactSchema,
  newsletterSchema,
  newsletterUnsubscribeSchema,
  reviewListQuerySchema,
} from "../../validators/commerce.validator.js";
import { productListQuerySchema } from "../../validators/catalog.validator.js";

const router = Router();

const slugParams = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

const idParams = z.object({ id: z.string().uuid() });

router.get("/home", getHome);

router.get(
  "/products",
  validate({ query: productListQuerySchema }),
  getProducts,
);
router.get(
  "/products/:id/reviews",
  validate({ params: idParams, query: reviewListQuerySchema }),
  getProductReviews,
);
router.get("/products/:slug", validate({ params: slugParams }), getProduct);

router.get("/categories", getCategories);
router.get("/brands", getBrands);
router.get("/settings", getStoreSettings);
router.get("/banners", getBanners);
router.get("/menu", getMenu);
router.get("/pages", getPublishedPages);
router.get("/pages/:slug", validate({ params: slugParams }), getPublishedPage);

router.post(
  "/contact",
  contactRateLimiter,
  validate({ body: contactSchema }),
  postContact,
);
router.post(
  "/newsletter",
  contactRateLimiter,
  validate({ body: newsletterSchema }),
  postNewsletter,
);
router.post(
  "/newsletter/unsubscribe",
  validate({ body: newsletterUnsubscribeSchema }),
  postUnsubscribe,
);

export default router;
