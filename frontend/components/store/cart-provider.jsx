"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/client";
import { guestCartItems, guestLineId, useCartStore } from "@/lib/store/cart";

const CartContext = createContext(null);

function calculateGuestSummary(items, settings) {
  const subtotal = Number(
    items
      .reduce((sum, item) => sum + Number(item.unit_price) * item.quantity, 0)
      .toFixed(2),
  );
  const threshold = settings?.free_shipping_threshold;
  const shipping =
    threshold !== null &&
    threshold !== undefined &&
    subtotal >= Number(threshold)
      ? 0
      : Number(settings?.shipping_fee ?? 0);
  const tax = Number(
    ((subtotal * Number(settings?.tax_percent ?? 0)) / 100).toFixed(2),
  );

  return {
    subtotal,
    shipping_fee: shipping,
    tax,
    tax_percent: Number(settings?.tax_percent ?? 0),
    discount: 0,
    total: Number((subtotal + shipping + tax).toFixed(2)),
    currency: settings?.currency ?? "PKR",
    free_shipping_threshold: threshold ?? null,
  };
}

export function CartProvider({ children, role, settings }) {
  const guestItems = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const addGuestItem = useCartStore((state) => state.addItem);
  const updateGuestQuantity = useCartStore((state) => state.updateQuantity);
  const removeGuestItem = useCartStore((state) => state.removeItem);
  const clearGuest = useCartStore((state) => state.clear);

  const [user, setUser] = useState(undefined);
  const [serverCart, setServerCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mergedFor = useRef(null);
  const isAdmin = role === "admin";

  const loadServerCart = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const cart = await apiFetch("/cart");
      setServerCart(cart);
      return cart;
    } catch (loadError) {
      setError(loadError.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active) setUser(data.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user || isAdmin) {
      return undefined;
    }

    let active = true;

    async function sync() {
      setLoading(true);
      setError("");

      try {
        const currentGuestItems = useCartStore.getState().items;

        if (currentGuestItems.length > 0 && mergedFor.current !== user.id) {
          const merged = await apiFetch("/cart/merge", {
            method: "POST",
            body: { items: guestCartItems(currentGuestItems) },
          });
          mergedFor.current = user.id;
          useCartStore.getState().clear();
          if (active) setServerCart(merged);
          return;
        }

        const cart = await apiFetch("/cart");
        if (active) setServerCart(cart);
      } catch (syncError) {
        if (active) setError(syncError.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    sync();

    return () => {
      active = false;
    };
  }, [user, isAdmin]);

  const addItem = useCallback(
    async (item, quantity = 1) => {
      if (isAdmin) {
        toast.error("Administrator accounts cannot shop.");
        return false;
      }

      if (user) {
        try {
          const cart = await apiFetch("/cart/items", {
            method: "POST",
            body: {
              product_id: item.product_id,
              variant_id: item.variant_id ?? null,
              quantity,
            },
          });
          setServerCart(cart);
          toast.success("Added to cart.");
          return true;
        } catch (addError) {
          toast.error(addError.message);
          return false;
        }
      }

      addGuestItem({ ...item, quantity });
      toast.success("Added to cart.");
      return true;
    },
    [addGuestItem, isAdmin, user],
  );

  const updateQuantity = useCallback(
    async (line, quantity) => {
      if (user) {
        try {
          const cart = await apiFetch(`/cart/items/${line.id}`, {
            method: "PATCH",
            body: { quantity },
          });
          setServerCart(cart);
        } catch (updateError) {
          toast.error(updateError.message);
        }
        return;
      }

      updateGuestQuantity(line.product_id, line.variant_id, quantity);
    },
    [updateGuestQuantity, user],
  );

  const removeItem = useCallback(
    async (line) => {
      if (user) {
        try {
          const cart = await apiFetch(`/cart/items/${line.id}`, {
            method: "DELETE",
          });
          setServerCart(cart);
        } catch (removeError) {
          toast.error(removeError.message);
        }
        return;
      }

      removeGuestItem(line.product_id, line.variant_id);
    },
    [removeGuestItem, user],
  );

  const clear = useCallback(async () => {
    if (user) {
      try {
        const cart = await apiFetch("/cart", { method: "DELETE" });
        setServerCart(cart);
      } catch (clearError) {
        toast.error(clearError.message);
      }
      return;
    }

    clearGuest();
  }, [clearGuest, user]);

  const items = useMemo(() => {
    if (isAdmin) return [];
    if (user) return serverCart?.items ?? [];
    return guestItems.map((item) => ({
      ...item,
      id: item.id ?? guestLineId(item.product_id, item.variant_id),
      line_total: Number((Number(item.unit_price) * item.quantity).toFixed(2)),
    }));
  }, [guestItems, isAdmin, serverCart, user]);

  const summary = useMemo(() => {
    if (isAdmin) return calculateGuestSummary([], settings);
    if (user) {
      return serverCart?.summary ?? calculateGuestSummary([], settings);
    }
    return calculateGuestSummary(guestItems, settings);
  }, [guestItems, isAdmin, serverCart, settings, user]);

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      count,
      summary,
      loading,
      error,
      user,
      isAuthenticated: Boolean(user),
      isAdmin,
      hydrated: hasHydrated,
      addItem,
      updateQuantity,
      removeItem,
      clear,
      refresh: loadServerCart,
    }),
    [
      items,
      count,
      summary,
      loading,
      error,
      user,
      isAdmin,
      hasHydrated,
      addItem,
      updateQuantity,
      removeItem,
      clear,
      loadServerCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}
