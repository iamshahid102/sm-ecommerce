import { CartProvider } from "@/components/store/cart-provider";
import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { WishlistProvider } from "@/components/store/wishlist-provider";
import { apiFetchPublic } from "@/lib/api/public";
import { apiFetchServer } from "@/lib/api/server";
import { getAccessToken, getSessionProfile } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS = {
  store_name: "SM Store",
  store_tagline: "Everyday essentials, thoughtfully selected.",
  currency: "PKR",
  currency_symbol: "Rs",
  shipping_fee: 250,
  free_shipping_threshold: 5000,
  tax_percent: 0,
  announcement_active: false,
  social_links: {},
};

export default async function StoreLayout({ children }) {
  const session = await getSessionProfile();
  const wishlistRequest = (async () => {
    if (session.profile?.role !== "customer") {
      return [];
    }

    const token = await getAccessToken(session.supabase);

    if (!token) {
      return [];
    }

    return apiFetchServer("/wishlist", { token });
  })();

  const [settingsResult, menuResult, categoriesResult, wishlistResult] =
    await Promise.allSettled([
      apiFetchPublic("/settings"),
      apiFetchPublic("/menu"),
      apiFetchPublic("/categories"),
      wishlistRequest,
    ]);

  const settings =
    settingsResult.status === "fulfilled"
      ? settingsResult.value
      : DEFAULT_SETTINGS;
  const menu = menuResult.status === "fulfilled" ? menuResult.value : [];
  const categories =
    categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  const wishlistLoaded =
    wishlistResult.status === "fulfilled" &&
    Array.isArray(wishlistResult.value);
  const wishlistItems = wishlistLoaded ? wishlistResult.value : [];
  const initialWishlistIds = wishlistItems.map((item) => item.product_id);

  return (
    <WishlistProvider
      key={session.profile?.id ?? "guest"}
      role={session.profile?.role}
      initialProductIds={initialWishlistIds}
      initialLoaded={wishlistLoaded}
    >
      <CartProvider role={session.profile?.role} settings={settings}>
        <div className="flex min-h-svh flex-col">
          <SiteHeader
            settings={settings}
            categories={categories}
            profile={session.profile}
          />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <SiteFooter settings={settings} categories={categories} menu={menu} />
        </div>
      </CartProvider>
    </WishlistProvider>
  );
}
