import {
  createAddress,
  deleteAddress,
  listAddresses,
  updateAddress,
} from "../services/address.service.js";
import {
  addCartItem,
  clearCart,
  getCart,
  mergeCart,
  removeCartItem,
  updateCartItem,
} from "../services/cart.service.js";
import { validateCoupon } from "../services/coupon.service.js";
import {
  cancelOrderForUser,
  getOrderForUser,
  listOrdersForUser,
  placeOrder,
} from "../services/order.service.js";
import {
  createReview,
  deleteReview,
  listMyReviews,
  updateReview,
} from "../services/review.service.js";
import {
  addWishlist,
  listWishlist,
  removeWishlist,
} from "../services/wishlist.service.js";
import { sendSuccess } from "../utils/http.js";

export async function getAddresses(req, res) {
  const addresses = await listAddresses(req.user.id);
  return sendSuccess(res, addresses, { message: "Addresses loaded." });
}

export async function postAddress(req, res) {
  const address = await createAddress(req.user.id, req.validated.body);
  return sendSuccess(res, address, {
    status: 201,
    message: "Address saved.",
  });
}

export async function patchAddress(req, res) {
  const address = await updateAddress(
    req.user.id,
    req.validated.params.id,
    req.validated.body,
  );
  return sendSuccess(res, address, { message: "Address updated." });
}

export async function removeAddress(req, res) {
  const result = await deleteAddress(req.user.id, req.validated.params.id);
  return sendSuccess(res, result, { message: "Address deleted." });
}

export async function getMyCart(req, res) {
  const cart = await getCart(req.user.id);
  return sendSuccess(res, cart, { message: "Cart loaded." });
}

export async function postCartItem(req, res) {
  const cart = await addCartItem(req.user.id, req.validated.body);
  return sendSuccess(res, cart, { message: "Item added to cart." });
}

export async function patchCartItem(req, res) {
  const cart = await updateCartItem(
    req.user.id,
    req.validated.params.id,
    req.validated.body.quantity,
  );
  return sendSuccess(res, cart, { message: "Cart updated." });
}

export async function deleteCartItem(req, res) {
  const cart = await removeCartItem(req.user.id, req.validated.params.id);
  return sendSuccess(res, cart, { message: "Item removed from cart." });
}

export async function deleteAllCartItems(req, res) {
  const cart = await clearCart(req.user.id);
  return sendSuccess(res, cart, { message: "Cart cleared." });
}

export async function postMergeCart(req, res) {
  const cart = await mergeCart(req.user.id, req.validated.body.items);
  return sendSuccess(res, cart, { message: "Cart merged." });
}

export async function getWishlist(req, res) {
  const items = await listWishlist(req.user.id);
  return sendSuccess(res, items, { message: "Wishlist loaded." });
}

export async function postWishlist(req, res) {
  const result = await addWishlist(req.user.id, req.validated.body.product_id);
  return sendSuccess(res, result, {
    status: result.already_exists ? 200 : 201,
    message: result.already_exists
      ? "Product is already in your wishlist."
      : "Product added to wishlist.",
  });
}

export async function deleteWishlistItem(req, res) {
  const result = await removeWishlist(
    req.user.id,
    req.validated.params.productId,
  );
  return sendSuccess(res, result, {
    message: "Product removed from wishlist.",
  });
}

export async function validateCouponCode(req, res) {
  const result = await validateCoupon({
    code: req.validated.body.code,
    subtotal: req.validated.body.subtotal,
    userId: req.user.id,
  });
  return sendSuccess(res, result, { message: "Coupon applied." });
}

export async function getMyOrders(req, res) {
  const result = await listOrdersForUser(req.user.id, req.validated.query);
  return sendSuccess(res, result.items, {
    message: "Orders loaded.",
    meta: result.meta,
  });
}

export async function getMyOrder(req, res) {
  const order = await getOrderForUser(req.user.id, req.validated.params.id);
  return sendSuccess(res, order, { message: "Order loaded." });
}

export async function postOrder(req, res) {
  const order = await placeOrder(req.user.id, req.validated.body);
  return sendSuccess(res, order, {
    status: 201,
    message: "Order placed successfully.",
  });
}

export async function postCancelOrder(req, res) {
  const order = await cancelOrderForUser(req.user.id, req.validated.params.id);
  return sendSuccess(res, order, { message: "Order cancelled." });
}

export async function getMyReviews(req, res) {
  const reviews = await listMyReviews(req.user.id);
  return sendSuccess(res, reviews, { message: "Reviews loaded." });
}

export async function postReview(req, res) {
  const review = await createReview(req.user.id, req.validated.body);
  return sendSuccess(res, review, {
    status: 201,
    message: "Review submitted.",
  });
}

export async function patchReview(req, res) {
  const review = await updateReview(
    req.user.id,
    req.validated.params.id,
    req.validated.body,
  );
  return sendSuccess(res, review, { message: "Review updated." });
}

export async function removeReview(req, res) {
  const result = await deleteReview(req.user.id, req.validated.params.id);
  return sendSuccess(res, result, { message: "Review deleted." });
}
