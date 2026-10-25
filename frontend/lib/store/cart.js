"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

function sameLine(item, productId, variantId) {
  return (
    item.product_id === productId &&
    (item.variant_id ?? null) === (variantId ?? null)
  );
}

export function guestLineId(productId, variantId) {
  return `guest:${productId}:${variantId ?? "base"}`;
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      addItem: (item) => {
        const quantity = Math.max(1, Math.min(99, Number(item.quantity) || 1));
        const items = get().items;
        const existing = items.find((line) =>
          sameLine(line, item.product_id, item.variant_id),
        );

        if (existing) {
          set({
            items: items.map((line) =>
              sameLine(line, item.product_id, item.variant_id)
                ? {
                    ...line,
                    quantity: Math.min(
                      99,
                      line.quantity + quantity,
                      line.available_stock || 99,
                    ),
                  }
                : line,
            ),
          });
          return;
        }

        set({
          items: [
            ...items,
            {
              ...item,
              id: guestLineId(item.product_id, item.variant_id),
              quantity,
            },
          ],
        });
      },

      updateQuantity: (productId, variantId, quantity) => {
        const next = Math.max(1, Math.min(99, Number(quantity) || 1));
        set({
          items: get().items.map((line) =>
            sameLine(line, productId, variantId)
              ? {
                  ...line,
                  quantity: Math.min(next, line.available_stock || 99),
                }
              : line,
          ),
        });
      },

      removeItem: (productId, variantId) => {
        set({
          items: get().items.filter(
            (line) => !sameLine(line, productId, variantId),
          ),
        });
      },

      clear: () => set({ items: [] }),
    }),
    {
      name: "sm-store-cart",
      version: 2,
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export function guestCartItems(items) {
  return items.map((item) => ({
    product_id: item.product_id,
    variant_id: item.variant_id ?? null,
    quantity: item.quantity,
  }));
}
