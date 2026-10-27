import { Router } from "express";
import { z } from "zod";

import {
  adminAddOrderNote,
  adminBlockCustomer,
  adminCreateCoupon,
  adminDeleteCoupon,
  adminDeleteReview,
  adminExportCustomers,
  adminExportOrders,
  adminGetCustomer,
  adminGetOrder,
  adminListCoupons,
  adminListCustomers,
  adminListOrders,
  adminListReviews,
  adminModerateReview,
  adminSalesReport,
  adminUpdateCoupon,
  adminUpdateOrderPayment,
  adminUpdateOrderStatus,
} from "../../controllers/admin.controller.js";
import {
  adminCreateBrand,
  adminCreateCategory,
  adminCreateProduct,
  adminDeleteBrand,
  adminDeleteCategory,
  adminDeleteProduct,
  adminGetProduct,
  adminListBrands,
  adminListCategories,
  adminListProducts,
  adminUpdateBrand,
  adminUpdateCategory,
  adminUpdateProduct,
} from "../../controllers/catalog.controller.js";
import {
  adminCreateBanner,
  adminCreateHomeSection,
  adminCreateMenuItem,
  adminCreatePage,
  adminDeleteBanner,
  adminDeleteHomeSection,
  adminDeleteMenuItem,
  adminDeleteMessage,
  adminDeletePage,
  adminExportSubscribers,
  adminGetPage,
  adminGetSettings,
  adminListAudit,
  adminListBanners,
  adminListHomeSections,
  adminListMenu,
  adminListMessages,
  adminListPages,
  adminListSubscribers,
  adminReadMessage,
  adminUpdateBanner,
  adminUpdateHomeSection,
  adminUpdateMenuItem,
  adminUpdatePage,
  adminUpdateSettings,
} from "../../controllers/cms.controller.js";
import { getDashboard } from "../../controllers/dashboard.controller.js";
import { removeUpload, uploadImages } from "../../controllers/upload.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.js";
import { imageUpload } from "../../middleware/upload.js";
import { validate } from "../../middleware/validate.js";
import {
  adminProductListQuerySchema,
  brandSchema,
  categorySchema,
  createProductSchema,
  updateProductSchema,
} from "../../validators/catalog.validator.js";
import {
  bannerSchema,
  cmsPageSchema,
  homeSectionSchema,
  menuItemSchema,
  settingsSchema,
} from "../../validators/cms.validator.js";
import {
  adminAuditQuerySchema,
  adminCouponQuerySchema,
  adminCustomerQuerySchema,
  adminMessageQuerySchema,
  adminNoteSchema,
  adminReviewQuerySchema,
  adminSubscriberQuerySchema,
  couponSchema,
  customerAdminSchema,
  orderListQuerySchema,
  orderStatusSchema,
  paymentStatusSchema,
  readMessageSchema,
  reportQuerySchema,
  reviewModerationSchema,
  uuidSchema,
} from "../../validators/commerce.validator.js";

const router = Router();

const idParams = z.object({ id: uuidSchema });

router.use(requireAuth, requireAdmin);

router.get("/dashboard", getDashboard);

// Catalog.
router.get(
  "/products",
  validate({ query: adminProductListQuerySchema }),
  adminListProducts,
);
router.get("/products/:id", validate({ params: idParams }), adminGetProduct);
router.post(
  "/products",
  validate({ body: createProductSchema }),
  adminCreateProduct,
);
router.patch(
  "/products/:id",
  validate({ params: idParams, body: updateProductSchema }),
  adminUpdateProduct,
);
router.delete(
  "/products/:id",
  validate({ params: idParams }),
  adminDeleteProduct,
);

router.get("/categories", adminListCategories);
router.post(
  "/categories",
  validate({ body: categorySchema }),
  adminCreateCategory,
);
router.patch(
  "/categories/:id",
  validate({ params: idParams, body: categorySchema }),
  adminUpdateCategory,
);
router.delete(
  "/categories/:id",
  validate({ params: idParams }),
  adminDeleteCategory,
);

router.get("/brands", adminListBrands);
router.post("/brands", validate({ body: brandSchema }), adminCreateBrand);
router.patch(
  "/brands/:id",
  validate({ params: idParams, body: brandSchema }),
  adminUpdateBrand,
);
router.delete("/brands/:id", validate({ params: idParams }), adminDeleteBrand);

// Orders.
router.get(
  "/orders",
  validate({ query: orderListQuerySchema }),
  adminListOrders,
);
router.get("/orders/:id", validate({ params: idParams }), adminGetOrder);
router.patch(
  "/orders/:id/status",
  validate({ params: idParams, body: orderStatusSchema }),
  adminUpdateOrderStatus,
);
router.patch(
  "/orders/:id/payment",
  validate({ params: idParams, body: paymentStatusSchema }),
  adminUpdateOrderPayment,
);
router.patch(
  "/orders/:id/note",
  validate({ params: idParams, body: adminNoteSchema }),
  adminAddOrderNote,
);

// Reviews.
router.get(
  "/reviews",
  validate({ query: adminReviewQuerySchema }),
  adminListReviews,
);
router.patch(
  "/reviews/:id",
  validate({ params: idParams, body: reviewModerationSchema }),
  adminModerateReview,
);
router.delete("/reviews/:id", validate({ params: idParams }), adminDeleteReview);

// Customers.
router.get(
  "/customers",
  validate({ query: adminCustomerQuerySchema }),
  adminListCustomers,
);
router.get("/customers/:id", validate({ params: idParams }), adminGetCustomer);
router.patch(
  "/customers/:id/block",
  validate({ params: idParams, body: customerAdminSchema }),
  adminBlockCustomer,
);

// Coupons.
router.get(
  "/coupons",
  validate({ query: adminCouponQuerySchema }),
  adminListCoupons,
);
router.post("/coupons", validate({ body: couponSchema }), adminCreateCoupon);
router.patch(
  "/coupons/:id",
  validate({ params: idParams, body: couponSchema }),
  adminUpdateCoupon,
);
router.delete("/coupons/:id", validate({ params: idParams }), adminDeleteCoupon);

// Settings and CMS.
router.get("/settings", adminGetSettings);
router.put("/settings", validate({ body: settingsSchema }), adminUpdateSettings);

router.get("/cms/banners", adminListBanners);
router.post(
  "/cms/banners",
  validate({ body: bannerSchema }),
  adminCreateBanner,
);
router.patch(
  "/cms/banners/:id",
  validate({ params: idParams, body: bannerSchema }),
  adminUpdateBanner,
);
router.delete(
  "/cms/banners/:id",
  validate({ params: idParams }),
  adminDeleteBanner,
);

router.get("/cms/home-sections", adminListHomeSections);
router.post(
  "/cms/home-sections",
  validate({ body: homeSectionSchema }),
  adminCreateHomeSection,
);
router.patch(
  "/cms/home-sections/:id",
  validate({ params: idParams, body: homeSectionSchema }),
  adminUpdateHomeSection,
);
router.delete(
  "/cms/home-sections/:id",
  validate({ params: idParams }),
  adminDeleteHomeSection,
);

router.get("/cms/pages", adminListPages);
router.post("/cms/pages", validate({ body: cmsPageSchema }), adminCreatePage);
router.get("/cms/pages/:id", validate({ params: idParams }), adminGetPage);
router.patch(
  "/cms/pages/:id",
  validate({ params: idParams, body: cmsPageSchema }),
  adminUpdatePage,
);
router.delete("/cms/pages/:id", validate({ params: idParams }), adminDeletePage);

router.get("/cms/menu", adminListMenu);
router.post(
  "/cms/menu",
  validate({ body: menuItemSchema }),
  adminCreateMenuItem,
);
router.patch(
  "/cms/menu/:id",
  validate({ params: idParams, body: menuItemSchema }),
  adminUpdateMenuItem,
);
router.delete("/cms/menu/:id", validate({ params: idParams }), adminDeleteMenuItem);

// Contact, newsletter, audit.
router.get(
  "/messages",
  validate({ query: adminMessageQuerySchema }),
  adminListMessages,
);
router.patch(
  "/messages/:id",
  validate({ params: idParams, body: readMessageSchema }),
  adminReadMessage,
);
router.delete(
  "/messages/:id",
  validate({ params: idParams }),
  adminDeleteMessage,
);

router.get(
  "/subscribers",
  validate({ query: adminSubscriberQuerySchema }),
  adminListSubscribers,
);
router.get("/subscribers/export", adminExportSubscribers);
router.get(
  "/audit-logs",
  validate({ query: adminAuditQuerySchema }),
  adminListAudit,
);

// Reports and exports.
router.get(
  "/reports/sales",
  validate({ query: reportQuerySchema }),
  adminSalesReport,
);
router.get(
  "/reports/orders.csv",
  validate({ query: reportQuerySchema }),
  adminExportOrders,
);
router.get("/reports/customers.csv", adminExportCustomers);

// Uploads.
router.post(
  "/uploads",
  imageUpload.array("images", 8),
  uploadImages,
);
router.delete("/uploads", removeUpload);

export default router;
