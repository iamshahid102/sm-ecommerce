import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

import { ProductCard } from "@/components/store/product-card";
import { SectionHeading } from "@/components/store/section-heading";
import { StoreImage } from "@/components/store/store-image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetchPublic } from "@/lib/api/public";
import { formatCurrency } from "@/lib/format";

export const metadata = {
  title: "Shop quality everyday essentials",
  description:
    "Discover curated products at SM Store with cash on delivery and nationwide shipping across Pakistan.",
};

function HeroContent({ settings }) {
  return (
    <div className="relative z-10 max-w-2xl px-6 py-14 sm:px-10 sm:py-20">
      <Badge className="border border-white/20 bg-white/10 text-white backdrop-blur">
        <Sparkles className="size-3.5" aria-hidden="true" />
        Thoughtfully curated
      </Badge>
      <h1 className="mt-5 font-heading text-4xl leading-[1.08] font-semibold text-white sm:text-5xl lg:text-6xl">
        Everyday essentials,
        <span className="block text-sky-300">made effortless.</span>
      </h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base">
        {settings?.store_tagline ||
          "Quality products at fair prices, delivered safely to your door."}
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-slate-100">
          <Link href="/products">
            Shop the collection
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white"
        >
          <Link href="/contact">Talk to us</Link>
        </Button>
      </div>
      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-300">
        <span className="inline-flex items-center gap-1.5">
          <Banknote className="size-3.5 text-sky-300" aria-hidden="true" />
          Cash on Delivery
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Truck className="size-3.5 text-sky-300" aria-hidden="true" />
          Nationwide shipping
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-sky-300" aria-hidden="true" />
          Secure checkout
        </span>
      </div>
    </div>
  );
}

export default async function HomePage() {
  let home = null;
  let loadError = "";

  try {
    home = await apiFetchPublic("/home");
  } catch (error) {
    loadError = error.message;
  }

  const heroBanner = home?.banners?.find(
    (banner) => banner.placement === "home_hero",
  );
  const promoBanner = home?.banners?.find(
    (banner) => banner.placement === "home_promo",
  );
  const sections = new Map(
    (home?.sections ?? []).map((section) => [section.section_key, section]),
  );
  const featuredSection = sections.get("featured_products");
  const newArrivalsSection = sections.get("new_arrivals");
  const categorySection = sections.get("shop_by_category");
  const categories = home?.categories ?? [];
  const featured = home?.featured ?? [];
  const newArrivals = home?.new_arrivals ?? [];
  const settings = home?.settings;

  return (
    <div>
      <section className="relative overflow-hidden bg-dark-gradient">
        {heroBanner?.image_url ? (
          <>
            <StoreImage
              src={heroBanner.image_url}
              alt={heroBanner.title}
              priority
              className="absolute inset-0 h-full w-full"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/25" />
          </>
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(56,189,248,0.28),transparent_35%),radial-gradient(circle_at_15%_85%,rgba(37,99,235,0.3),transparent_40%)]"
          />
        )}
        <HeroContent settings={settings} />
      </section>

      <section className="border-b bg-card">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            {
              icon: Truck,
              title: "Fast delivery",
              text: "Dispatched within 1–2 working days.",
            },
            {
              icon: Banknote,
              title: "Cash on Delivery",
              text: "Pay when your order arrives.",
            },
            {
              icon: RefreshCw,
              title: "Easy returns",
              text: "Simple support if something is wrong.",
            },
            {
              icon: BadgeCheck,
              title: "Curated quality",
              text: "Chosen for value and everyday use.",
            },
          ].map((benefit) => (
            <div key={benefit.title} className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <benefit.icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">{benefit.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {benefit.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl space-y-16 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {loadError ? (
          <Alert>
            <AlertTitle>Catalog is not connected yet</AlertTitle>
            <AlertDescription>
              The storefront is ready, but the API returned: {loadError} Apply
              the Supabase migrations and start the backend to load live
              products. You can still explore the layout and admin screens.
            </AlertDescription>
          </Alert>
        ) : null}

        {categories.length > 0 ? (
          <section>
            <SectionHeading
              eyebrow="Browse"
              title={categorySection?.title || "Shop by category"}
              description={
                categorySection?.subtitle ||
                "Find what you need, faster."
              }
              href="/products"
            />
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group relative overflow-hidden rounded-2xl border bg-card"
                >
                  <div className="relative aspect-[4/3] bg-muted">
                    <StoreImage
                      src={category.image_url}
                      alt={category.name}
                      className="transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="font-heading text-sm font-semibold text-white">
                      {category.name}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-300">
                      {category.description || "Explore the collection"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {featured.length > 0 ? (
          <section>
            <SectionHeading
              eyebrow="Customer favourites"
              title={featuredSection?.title || "Featured picks"}
              description={
                featuredSection?.subtitle ||
                "Hand-picked products our customers love."
              }
              href="/products?sort=rating"
            />
            <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {featured.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 2}
                />
              ))}
            </div>
          </section>
        ) : null}

        {promoBanner ? (
          <section className="relative overflow-hidden rounded-3xl bg-hero-gradient px-6 py-10 text-white sm:px-10">
            {promoBanner.image_url ? (
              <StoreImage
                src={promoBanner.image_url}
                alt={promoBanner.title}
                className="absolute inset-0 h-full w-full opacity-25"
                sizes="100vw"
              />
            ) : null}
            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-widest text-sky-100 uppercase">
                  Limited offer
                </p>
                <h2 className="mt-1 font-heading text-2xl font-semibold sm:text-3xl">
                  {promoBanner.title}
                </h2>
                {promoBanner.subtitle ? (
                  <p className="mt-2 max-w-xl text-sm text-slate-100">
                    {promoBanner.subtitle}
                  </p>
                ) : null}
              </div>
              {promoBanner.button_text && promoBanner.button_link ? (
                <Button asChild className="bg-white text-slate-950 hover:bg-slate-100">
                  <Link href={promoBanner.button_link}>
                    {promoBanner.button_text}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
            </div>
          </section>
        ) : null}

        {newArrivals.length > 0 ? (
          <section>
            <SectionHeading
              eyebrow="Just landed"
              title={newArrivalsSection?.title || "New arrivals"}
              description={
                newArrivalsSection?.subtitle ||
                "Fresh additions to the store."
              }
              href="/products"
            />
            <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : null}

        {!loadError && featured.length === 0 && newArrivals.length === 0 ? (
          <Card className="rounded-3xl border-dashed bg-card/60 py-12 text-center">
            <CardContent>
              <h2 className="font-heading text-xl font-semibold">
                Your catalog starts here
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Publish products from the admin workspace and they will appear
                here automatically.
              </p>
              <Button asChild className="mt-5">
                <Link href="/admin/products">Open admin catalog</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-3">
          <Card className="rounded-2xl bg-secondary/50 shadow-none">
            <CardContent className="p-5">
              <Banknote className="size-5 text-primary" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold">No card required</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Choose Cash on Delivery at checkout. Card payments are disabled
                until a supported payment provider is connected.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl bg-secondary/50 shadow-none">
            <CardContent className="p-5">
              <Truck className="size-5 text-primary" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold">
                Free shipping over{" "}
                {formatCurrency(settings?.free_shipping_threshold ?? 5000)}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                A flat {formatCurrency(settings?.shipping_fee ?? 250)} shipping
                fee applies below the threshold.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl bg-secondary/50 shadow-none">
            <CardContent className="p-5">
              <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold">Secure by design</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Server-side authorization, strict validation, and audit logging
                protect every admin action.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
