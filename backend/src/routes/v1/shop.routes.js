import { Router } from "express";
import { z } from "zod";

import {
  getAddresses,
  patchAddress,
  postAddress,
  removeAddress,
} from "../../controllers/shop.controller.js";
import {
  deleteAllCartItems,
  deleteCartItem,
  deleteWishlistItem,
  getMyCart,
  getMyOrder,
  getMyOrders,
  getMyReviews,
  getWishlist,
  patchCartItem,
  patchReview,
  postCancelOrder,
  postCartItem,
  postMergeCart,
  postOrder,
  postReview,
  postWishlist,
  removeReview,
  validateCouponCode,
} from "../../controllers/shop.controller.js";
import { requireAuth, requireCustomer } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  addressSchema,
  cartItemSchema,
  cartMergeSchema,
  couponValidateSchema,
  orderListQuerySchema,
  placeOrderSchema,
  reviewSchema,
  reviewUpdateSchema,
  uuidSchema,
  wishlistSchema,
} from "../../validators/commerce.validator.js";

const router = Router();

const idParams = z.object({ id: uuidSchema });
const productParams = z.object({ productId: uuidSchema });
const quantityBody = z.object({ quantity: z.coerce.number().int().min(1).max(99) });

// Addresses.
router.get("/addresses", requireAuth, requireCustomer, getAddresses);
router.post(
  "/addresses",
  requireAuth, requireCustomer,
  validate({ body: addressSchema }),
  postAddress,
);
router.patch(
  "/addresses/:id",
  requireAuth, requireCustomer,
  validate({ params: idParams, body: addressSchema }),
  patchAddress,
);
router.delete(
  "/addresses/:id",
  requireAuth, requireCustomer,
  validate({ params: idParams }),
  removeAddress,
);

// Cart.
router.get("/cart", requireAuth, requireCustomer, getMyCart);
router.post(
  "/cart/items",
  requireAuth, requireCustomer,
  validate({ body: cartItemSchema }),
  postCartItem,
);
router.patch(
  "/cart/items/:id",
  requireAuth, requireCustomer,
  validate({ params: idParams, body: quantityBody }),
  patchCartItem,
);
router.delete(
  "/cart/items/:id",
  requireAuth, requireCustomer,
  validate({ params: idParams }),
  deleteCartItem,
);
router.delete("/cart", requireAuth, requireCustomer, deleteAllCartItems);
router.post(
  "/cart/merge",
  requireAuth, requireCustomer,
  validate({ body: cartMergeSchema }),
  postMergeCart,
);

// Wishlist.
router.get("/wishlist", requireAuth, requireCustomer, getWishlist);
router.post(
  "/wishlist",
  requireAuth, requireCustomer,
  validate({ body: wishlistSchema }),
  postWishlist,
);
router.delete(
  "/wishlist/:productId",
  requireAuth, requireCustomer,
  validate({ params: productParams }),
  deleteWishlistItem,
);

// Coupons.
router.post(
  "/coupons/validate",
  requireAuth, requireCustomer,
  validate({ body: couponValidateSchema }),
  validateCouponCode,
);

// Orders.
router.get(
  "/orders",
  requireAuth, requireCustomer,
  validate({ query: orderListQuerySchema }),
  getMyOrders,
);
router.post(
  "/orders",
  requireAuth, requireCustomer,
  validate({ body: placeOrderSchema }),
  postOrder,
);
router.get(
  "/orders/:id",
  requireAuth, requireCustomer,
  validate({ params: idParams }),
  getMyOrder,
);
router.post(
  "/orders/:id/cancel",
  requireAuth, requireCustomer,
  validate({ params: idParams }),
  postCancelOrder,
);

// Reviews.
router.get("/reviews", requireAuth, requireCustomer, getMyReviews);
router.post(
  "/reviews",
  requireAuth, requireCustomer,
  validate({ body: reviewSchema }),
  postReview,
);
router.patch(
  "/reviews/:id",
  requireAuth, requireCustomer,
  validate({ params: idParams, body: reviewUpdateSchema }),
  patchReview,
);
router.delete(
  "/reviews/:id",
  requireAuth, requireCustomer,
  validate({ params: idParams }),
  removeReview,
);

export default router;
