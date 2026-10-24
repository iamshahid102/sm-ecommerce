export function toPaisa(value) {
  return Math.round(Number(value ?? 0) * 100);
}

export function fromPaisa(value) {
  return Number((Number(value ?? 0) / 100).toFixed(2));
}

export function money(value) {
  return Number(Number(value ?? 0).toFixed(2));
}

export function percentDiscount(subtotal, percent) {
  return money((Number(subtotal) * Number(percent)) / 100);
}

export function clampDiscount(discount, subtotal) {
  return money(Math.max(0, Math.min(Number(discount), Number(subtotal))));
}
