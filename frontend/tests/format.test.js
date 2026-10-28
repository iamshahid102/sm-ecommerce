import test from "node:test";
import assert from "node:assert/strict";

import {
  firstName,
  formatCurrency,
  formatDate,
  initials,
} from "../lib/format.js";

test("currency values are formatted with grouping", () => {
  assert.match(formatCurrency(1234), /1,234/);
  assert.match(formatCurrency("5000"), /5,000/);
});

test("invalid currency values become zero", () => {
  assert.match(formatCurrency("not-a-number"), /0/);
  assert.match(formatCurrency(null), /0/);
});

test("invalid or missing dates show an em dash", () => {
  assert.equal(formatDate(null), "—");
  assert.equal(formatDate("not-a-date"), "—");
  assert.notEqual(formatDate("2026-10-24T12:00:00.000Z"), "—");
});

test("first name extracts the first name part", () => {
  assert.equal(firstName("Muhammad Ali"), "Muhammad");
  assert.equal(firstName("  Sana  "), "Sana");
  assert.equal(firstName("Ayesha"), "Ayesha");
  assert.equal(firstName(""), "");
  assert.equal(firstName(null), "");
});

test("initials prefer the first two name parts", () => {
  assert.equal(initials("Muhammad Ali"), "MA");
  assert.equal(initials("Sana", "sana@example.com"), "SA");
  assert.equal(initials("", "customer@example.com"), "CU");
  assert.equal(initials("", ""), "?");
});
