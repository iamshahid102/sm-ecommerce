import { CartProvider } from "@/components/store/cart-provider";
import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { apiFetchPublic } from "@/lib/api/public";
import { getSessionProfile } from "@/lib/auth/dal";

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
  const [settingsResult, menuResult, categoriesResult] = await Promise.allSettled(
    [
      apiFetchPublic("/settings"),
      apiFetchPublic("/menu"),
      apiFetchPublic("/categories"),
    ],
  );

  const settings =
    settingsResult.status === "fulfilled" ? settingsResult.value : DEFAULT_SETTINGS;
  const menu = menuResult.status === "fulfilled" ? menuResult.value : [];
  const categories =
    categoriesResult.status === "fulfilled" ? categoriesResult.value : [];

  return (
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
        <SiteFooter
          settings={settings}
          categories={categories}
          menu={menu}
        />
      </div>
    </CartProvider>
  );
}
