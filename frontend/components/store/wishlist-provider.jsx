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

import { apiFetch } from "@/lib/api/client";

const WishlistContext = createContext(null);

export function WishlistProvider({
  children,
  role,
  initialProductIds = [],
  initialLoaded = false,
}) {
  const isAuthenticated = role === "customer";
  const [productIds, setProductIds] = useState(
    () => new Set(isAuthenticated ? initialProductIds : []),
  );
  const mutationVersion = useRef(0);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setProductIds(new Set());
      return [];
    }

    const version = mutationVersion.current;
    const items = await apiFetch("/wishlist");

    if (mutationVersion.current === version) {
      setProductIds(new Set(items.map((item) => item.product_id)));
    }

    return items;
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || initialLoaded) {
      return undefined;
    }

    let active = true;
    const version = mutationVersion.current;

    apiFetch("/wishlist")
      .then((items) => {
        if (active && mutationVersion.current === version) {
          setProductIds(new Set(items.map((item) => item.product_id)));
        }
      })
      .catch((error) => {
        if (active && (error.status === 401 || error.status === 403)) {
          setProductIds(new Set());
        }
      });

    return () => {
      active = false;
    };
  }, [initialLoaded, isAuthenticated]);

  const add = useCallback(async (productId) => {
    const result = await apiFetch("/wishlist", {
      method: "POST",
      body: { product_id: productId },
    });

    mutationVersion.current += 1;
    setProductIds((current) => {
      const next = new Set(current);
      next.add(productId);
      return next;
    });

    return result;
  }, []);

  const remove = useCallback(async (productId) => {
    try {
      await apiFetch(`/wishlist/${productId}`, { method: "DELETE" });
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
    }

    mutationVersion.current += 1;
    setProductIds((current) => {
      const next = new Set(current);
      next.delete(productId);
      return next;
    });
  }, []);

  const isSaved = useCallback(
    (productId) => productIds.has(productId),
    [productIds],
  );

  const value = useMemo(
    () => ({
      count: productIds.size,
      isAuthenticated,
      isSaved,
      add,
      remove,
      refresh,
    }),
    [add, isAuthenticated, isSaved, productIds, refresh, remove],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider.");
  }

  return context;
}
