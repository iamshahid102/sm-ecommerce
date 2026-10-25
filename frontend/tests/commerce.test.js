import test from "node:test";
import assert from "node:assert/strict";

import {
  NEXT_ORDER_STATUSES,
  ORDER_STATUSES,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  paymentMethodLabel,
  productVariantLabel,
  statusLabel,
  statusStyle,
} from "../lib/commerce.js";

test("every order status has a label and a visual style", () => {
  for (const status of ORDER_STATUSES) {
    assert.equal(typeof statusLabel(status), "string");
    assert.ok(statusStyle(status).length > 0);
  }
});

test("unknown statuses fall back to the raw value and returned styling", () => {
  assert.equal(statusLabel("archived"), "archived");
  assert.equal(statusStyle("archived"), statusStyle("returned"));
});

test("order transitions never leave a terminal status", () => {
  assert.deepEqual(NEXT_ORDER_STATUSES.cancelled, []);
  assert.deepEqual(NEXT_ORDER_STATUSES.returned, []);
  assert.ok(NEXT_ORDER_STATUSES.pending.includes("confirmed"));
  assert.ok(NEXT_ORDER_STATUSES.shipped.includes("delivered"));
});

test("payment labels are friendly and fall back to the raw method", () => {
  assert.equal(paymentMethodLabel("cod"), PAYMENT_METHOD_LABELS.cod);
  assert.equal(paymentMethodLabel("card"), PAYMENT_METHOD_LABELS.card);
  assert.equal(paymentMethodLabel("wallet"), "wallet");
  assert.equal(PAYMENT_STATUS_LABELS.paid, "Paid");
});

test("variant labels join only populated size and colour values", () => {
  assert.equal(productVariantLabel(null), "");
  assert.equal(productVariantLabel({ size: "M", color: "Blue" }), "M / Blue");
  assert.equal(productVariantLabel({ size: "M" }), "M");
  assert.equal(productVariantLabel({ color: "Blue" }), "Blue");
  assert.equal(productVariantLabel({}), "");
});
