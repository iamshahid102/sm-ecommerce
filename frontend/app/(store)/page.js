import Link from "next/link";
import {
  ArrowRight,
  Baby,
  BadgeCheck,
  Banknote,
  BookOpen,
  Dumbbell,
  Gift,
  Heart,
  Home,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Truck,
  Watch,
} from "lucide-react";

import { ProductCard } from "@/components/store/product-card";
import { SectionHeading } from "@/components/store/section-heading";
import { StoreImage } from "@/components/store/store-image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { apiFetchPublic } from "@/lib/api/public";
import { formatCurrency } from "@/lib/format";

export const metadata = {
  title: "Shop quality everyday essentials",
  description:
    "Discover curated products at SM Store with cash on delivery and nationwide shipping across Pakistan.",
};

const categoryIcons = [
  { keys: ["women", "woman", "fashion", "clothing", "apparel"], icon: Shirt },
  { keys: ["men", "man"], icon: Shirt },
  {
    keys: [
      "book",
      "fiction",
      "novel",
      "literature",
      "read",
      "academic",
      "urdu",
    ],
    icon: BookOpen,
  },
  { keys: ["home", "living", "decor", "furniture"], icon: Home },
  { keys: ["beauty", "skin", "care"], icon: Sparkles },
  { keys: ["electronic", "mobile", "phone", "tech"], icon: Smartphone },
  { keys: ["sport", "fitness", "gym"], icon: Dumbbell },
  { keys: ["kid", "baby", "toy"], icon: Baby },
  { keys: ["accessor", "watch", "jewel"], icon: Watch },
  { keys: ["gift", "bundle"], icon: Gift },
  { keys: ["health", "wellness"], icon: Heart },
];

function CategoryGlyph({ name }) {
  const normalized = name.toLowerCase();
  const match = categoryIcons.find((entry) =>
    entry.keys.some((key) => normalized.includes(key)),
  );
  const Icon = match?.icon ?? PackageCheck;

  return <Icon className="size-7" aria-hidden="true" />;
}

const heroTrust = [
  { icon: BadgeCheck, label: "Curated quality" },
  { icon: Banknote, label: "Cash on Delivery" },
  { icon: Truck, label: "Nationwide delivery" },
];

const benefits = [
  {
    icon: Truck,
    title: "Free shipping",
    description: "On qualifying orders",
  },
  {
    icon: Banknote,
    title: "Cash on Delivery",
    description: "Pay at your doorstep",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    description: "Safe and simple",
  },
  {
    icon: BadgeCheck,
    title: "Curated quality",
    description: "Chosen with care",
  },
  {
    icon: RefreshCw,
    title: "Helpful support",
    description: "We are here to help",
  },
];

function HeroVisual({ storeName }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_75%_20%,rgba(56,189,248,0.4),transparent_30%),linear-gradient(135deg,#0b1220_0%,#111b3a_50%,#1e3a8a_100%)] p-8 sm:p-12">
      <div
        className="absolute inset-0 bg-dot-grid opacity-30"
        aria-hidden="true"
      />
      <div
        className="absolute -top-12 -right-12 size-44 rounded-full border border-white/10"
        aria-hidden="true"
      />
      <div
        className="absolute -right-6 -bottom-14 size-64 rounded-full border border-white/10"
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm text-center text-white">
        <span className="mx-auto flex size-16 items-center justify-center rounded-3xl border border-white/15 bg-white/10 shadow-xl backdrop-blur">
          <ShoppingBag className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-6 text-[10px] font-semibold tracking-[0.24em] text-sky-300 uppercase">
          {storeName}
        </p>
        <p className="mt-2 font-heading text-2xl leading-tight font-semibold">
          Thoughtful essentials,
          <br />
          delivered to your door.
        </p>
        <div className="mt-7 flex justify-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-medium text-slate-200">
            Quality first
          </span>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-medium text-slate-200">
            Fair prices
          </span>
        </div>
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
  const spotlight = featured[0] ?? newArrivals[0] ?? home?.best_sellers?.[0];
  const usedProductIds = new Set(
    [...featured, ...newArrivals].map((product) => product.id),
  );
  const uniquePopular = (home?.best_sellers ?? []).filter(
    (product) => !usedProductIds.has(product.id),
  );
  const bestSellers = uniquePopular.length >= 2 ? uniquePopular : [];
  const heroImage = heroBanner?.image_url || spotlight?.primary_image;
  const storeName = settings?.store_name || "SM Store";
  const freeShipping = Number(settings?.free_shipping_threshold ?? 5000);
  const shippingFee = Number(settings?.shipping_fee ?? 250);
  const heroHeading = heroBanner?.title?.trim();
  const heroCopy =
    heroBanner?.subtitle?.trim() ||
    settings?.store_tagline ||
    "Quality products at fair prices, delivered safely to your door.";
  const heroButton = heroBanner?.button_text || "Shop the collection";
  const heroLink = heroBanner?.button_link || "/products";
  const hasProducts = featured.length > 0 || newArrivals.length > 0;
  const usingFallbackCollections = categories.length === 0 && hasProducts;
  const fallbackCollections = hasProducts
    ? [
        {
          id: "all-products",
          name: "All products",
          href: "/products",
          Icon: ShoppingBag,
        },
        ...(newArrivals.length > 0
          ? [
              {
                id: "new-arrivals",
                name: "New arrivals",
                href: "/products?sort=newest",
                Icon: Sparkles,
              },
            ]
          : []),
        ...((home?.best_sellers?.length ?? 0) > 0
          ? [
              {
                id: "best-sellers",
                name: "Best sellers",
                href: "/products?sort=popular",
                Icon: Star,
              },
            ]
          : []),
        ...(featured.length > 0
          ? [
              {
                id: "featured",
                name: "Featured",
                href: "/products?featured=true",
                Icon: BadgeCheck,
              },
            ]
          : []),
      ]
    : [];
  const collectionItems =
    categories.length > 0
      ? categories.slice(0, 9).map((category) => ({
          id: category.id,
          name: category.name,
          href: `/categories/${category.slug}`,
          imageUrl: category.image_url,
        }))
      : usingFallbackCollections
        ? fallbackCollections
        : [];

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-hero-soft">
        <div
          aria-hidden="true"
          className="absolute top-10 -left-20 size-64 rounded-full border border-primary/10"
        />
        <div
          aria-hidden="true"
          className="absolute -right-24 bottom-0 size-80 rounded-full border border-primary/10"
        />
        <div className="relative store-container grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:py-16">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-primary shadow-sm backdrop-blur">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Thoughtfully curated for everyday life
            </span>
            <h1 className="mt-5 font-heading text-[2.55rem] leading-[1.05] font-semibold tracking-[-0.03em] text-slate-950 sm:text-5xl lg:text-[3.5rem]">
              {heroHeading || (
                <>
                  Everyday essentials,
                  <span className="block text-primary">made effortless.</span>
                </>
              )}
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              {heroCopy}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-slate-950 px-7 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 hover:bg-primary"
              >
                <Link href={heroLink}>
                  {heroButton}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-slate-300 bg-white/70 px-7 text-sm font-semibold text-slate-800 shadow-none backdrop-blur hover:bg-white hover:text-slate-950"
              >
                <Link href="/products?sort=newest">Explore new arrivals</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs font-medium text-slate-600">
              {heroTrust.map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1.5"
                >
                  <item.icon
                    className="size-4 text-primary"
                    aria-hidden="true"
                  />
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-[2.6rem] bg-gradient-to-br from-primary/20 via-sky-300/20 to-transparent blur-2xl"
            />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-slate-900 shadow-float sm:aspect-[5/4]">
              {heroImage ? (
                <StoreImage
                  src={heroImage}
                  alt={heroBanner?.title || spotlight?.title || storeName}
                  priority
                  className="h-full w-full"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <HeroVisual storeName={storeName} />
              )}
              {heroImage ? (
                <>
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent"
                    aria-hidden="true"
                  />
                  <span className="absolute top-4 left-4 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-white backdrop-blur">
                    {heroBanner?.placement === "home_hero"
                      ? "Featured collection"
                      : "New season"}
                  </span>
                  <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold tracking-[0.16em] text-sky-200 uppercase">
                        {spotlight?.categories?.name || "SM Store"}
                      </p>
                      <p className="mt-1 line-clamp-1 font-heading text-base font-semibold text-white sm:text-lg">
                        {spotlight?.title ||
                          heroBanner?.title ||
                          "Curated essentials"}
                      </p>
                    </div>
                    <Link
                      href={
                        spotlight ? `/products/${spotlight.slug}` : "/products"
                      }
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-sm transition-colors hover:bg-primary hover:text-white"
                    >
                      Shop now
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </>
              ) : null}
            </div>

            <div className="absolute -bottom-5 -left-2 hidden items-center gap-2.5 rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-card backdrop-blur sm:flex">
              <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
                <Truck className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[11px] font-semibold text-slate-950">
                  Nationwide delivery
                </p>
                <p className="text-[10px] text-slate-500">
                  Dispatched in 1–2 days
                </p>
              </div>
            </div>

            <div className="absolute -top-4 -right-2 hidden items-center gap-2 rounded-full border border-white/80 bg-white/95 py-2 pr-4 pl-2 shadow-card backdrop-blur sm:flex">
              <span className="flex size-8 items-center justify-center rounded-full bg-slate-950 text-white">
                <Banknote className="size-3.5" aria-hidden="true" />
              </span>
              <p className="text-[11px] font-semibold text-slate-950">
                Cash on Delivery
              </p>
            </div>
          </div>
        </div>
      </section>

      {collectionItems.length > 0 ? (
        <section className="border-b border-slate-100 bg-white">
          <div className="store-container py-9 sm:py-11">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
                  Browse the collection
                </p>
                <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight text-slate-950">
                  {usingFallbackCollections
                    ? "Shop by collection"
                    : categorySection?.title || "Shop by category"}
                </h2>
              </div>
              <Link
                href="/products"
                className="group inline-flex shrink-0 items-center gap-1.5 pb-1 text-sm font-semibold text-slate-600 transition-colors hover:text-primary"
              >
                {usingFallbackCollections ? "All products" : "All categories"}
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>

            <div
              className={
                usingFallbackCollections
                  ? "mx-auto mt-7 grid max-w-xl grid-cols-3 gap-x-4 gap-y-6"
                  : "mt-7 grid grid-cols-4 gap-x-3 gap-y-6 sm:grid-cols-6 lg:grid-cols-9"
              }
            >
              {collectionItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group flex min-w-0 flex-col items-center gap-2.5 text-center"
                >
                  <span className="relative flex size-[72px] items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 text-primary shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/25 group-hover:bg-secondary group-hover:shadow-card sm:size-[88px]">
                    {item.imageUrl ? (
                      <StoreImage
                        src={item.imageUrl}
                        alt={item.name}
                        sizes="88px"
                        className="transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : item.Icon ? (
                      <item.Icon className="size-7" aria-hidden="true" />
                    ) : (
                      <CategoryGlyph name={item.name} />
                    )}
                  </span>
                  <span className="line-clamp-2 text-xs leading-tight font-medium text-slate-700 transition-colors group-hover:text-primary sm:text-[13px]">
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className="store-container space-y-14 py-12 sm:space-y-16 lg:py-16">
        {loadError ? (
          <Alert className="rounded-2xl border-amber-200 bg-amber-50">
            <AlertTitle className="text-amber-900">
              The product catalog is temporarily unavailable
            </AlertTitle>
            <AlertDescription className="text-amber-800">
              Please refresh in a moment. Our team has been notified.
            </AlertDescription>
          </Alert>
        ) : null}

        {featured.length > 0 ? (
          <section aria-label="Featured products">
            <SectionHeading
              title={featuredSection?.title || "Featured products"}
              href="/products"
            />
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
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

        <section
          aria-label="Store offers"
          className="grid gap-4 md:grid-cols-2"
        >
          {promoBanner ? (
            <Link
              href={promoBanner.button_link || "/products"}
              className="group relative min-h-[230px] overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-card sm:p-8"
            >
              {promoBanner.image_url ? (
                <StoreImage
                  src={promoBanner.image_url}
                  alt={promoBanner.title}
                  className="absolute inset-0 h-full w-full opacity-45 transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : null}
              <div
                className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/20"
                aria-hidden="true"
              />
              <div
                className="absolute -right-10 -bottom-16 size-56 rounded-full border border-white/10"
                aria-hidden="true"
              />
              <div className="relative flex h-full max-w-xs flex-col justify-center">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-sky-300 uppercase">
                  Limited offer
                </p>
                <h2 className="mt-2 font-heading text-2xl leading-tight font-semibold">
                  {promoBanner.title}
                </h2>
                {promoBanner.subtitle ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">
                    {promoBanner.subtitle}
                  </p>
                ) : null}
                <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-950 transition-colors group-hover:bg-primary group-hover:text-white">
                  {promoBanner.button_text || "Shop now"}
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ) : (
            <Link
              href="/products"
              className="group relative min-h-[230px] overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-blue-600 to-sky-500 p-7 text-white shadow-card sm:p-8"
            >
              <div
                className="absolute -top-16 -right-10 size-56 rounded-full border border-white/15"
                aria-hidden="true"
              />
              <div
                className="absolute -right-4 bottom-3 size-32 rounded-full bg-white/10 blur-2xl"
                aria-hidden="true"
              />
              <Truck
                className="absolute right-7 bottom-7 size-24 text-white/15"
                aria-hidden="true"
              />
              <div className="relative flex h-full max-w-xs flex-col justify-center">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-sky-100 uppercase">
                  A little extra value
                </p>
                <h2 className="mt-2 font-heading text-2xl leading-tight font-semibold">
                  Free shipping over {formatCurrency(freeShipping)}
                </h2>
                <p className="mt-2 text-sm leading-6 text-blue-50">
                  A flat {formatCurrency(shippingFee)} delivery fee applies
                  below the threshold.
                </p>
                <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-950 transition-colors group-hover:bg-slate-950 group-hover:text-white">
                  Start shopping
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </span>
              </div>
            </Link>
          )}

          <Link
            href="/products"
            className="group relative min-h-[230px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-7 text-slate-950 shadow-card sm:p-8"
          >
            <div
              className="absolute -top-14 -right-12 size-52 rounded-full bg-primary/10 blur-2xl"
              aria-hidden="true"
            />
            <Banknote
              className="absolute right-7 bottom-6 size-24 text-primary/10"
              aria-hidden="true"
            />
            <div className="relative flex h-full max-w-xs flex-col justify-center">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
                Shop with confidence
              </p>
              <h2 className="mt-2 font-heading text-2xl leading-tight font-semibold">
                Cash on Delivery,
                <br />
                every order.
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                No card required. Pay in cash when your order arrives at your
                doorstep.
              </p>
              <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition-colors group-hover:bg-primary">
                Browse products
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </span>
            </div>
          </Link>
        </section>

        {newArrivals.length > 0 ? (
          <section aria-label="New arrivals">
            <SectionHeading
              title={newArrivalsSection?.title || "New arrivals"}
              href="/products?sort=newest"
            />
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : null}

        {bestSellers.length > 0 ? (
          <section aria-label="Best sellers">
            <SectionHeading
              title="Best sellers"
              href="/products?sort=popular"
            />
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : null}

        {!loadError && !hasProducts ? (
          <section className="overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-14 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white text-primary shadow-card">
              <ShoppingBag className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-heading text-2xl font-semibold tracking-tight text-slate-950">
              Our shelves are being stocked
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Fresh products are on their way. In the meantime, explore our
              policies or get in touch with the store team.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              <Button
                asChild
                className="rounded-full bg-slate-950 hover:bg-primary"
              >
                <Link href="/contact">Contact the store</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full bg-white"
              >
                <Link href="/faq">Read the FAQ</Link>
              </Button>
            </div>
          </section>
        ) : null}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/70 px-5 py-6 sm:px-7 sm:py-7">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-primary uppercase">
                The SM Store promise
              </p>
              <h2 className="mt-1 font-heading text-xl font-semibold tracking-tight text-slate-950">
                Why shop with us?
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Simple, reliable, and built around you.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm ring-1 ring-slate-200/70">
                  <benefit.icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    {benefit.title === "Free shipping"
                      ? `Free shipping over ${formatCurrency(freeShipping)}`
                      : benefit.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
