import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Camera,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Video,
} from "lucide-react";

import { NewsletterForm } from "@/components/store/newsletter-form";
import { formatCurrency } from "@/lib/format";

const socialIcons = {
  facebook: Globe,
  instagram: Camera,
  twitter: MessageCircle,
  x: MessageCircle,
  tiktok: Video,
  youtube: Video,
};

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function SiteFooter({ settings, categories = [], menu = [] }) {
  const footerMenu = menu.filter(
    (item) => item.location === "footer" && item.is_active,
  );
  const companyMenu = footerMenu.filter(
    (item) =>
      !["/contact", "/faq", "/return-policy", "/shipping-policy"].includes(
        item.url,
      ),
  );
  const socials = settings?.social_links ?? {};
  const freeShipping = Number(settings?.free_shipping_threshold ?? 5000);

  return (
    <footer className="mt-20">
      <section className="relative overflow-hidden border-y border-slate-200 bg-secondary/60">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-16 size-72 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-28 left-1/4 size-64 rounded-full bg-sky-300/20 blur-3xl"
        />
        <div className="store-container relative grid gap-7 py-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:py-12">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Stay in the loop
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Join our community
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
              Be first to hear about new arrivals, exclusive offers, and
              thoughtfully selected products.
            </p>
          </div>
          <div className="w-full lg:ml-auto lg:max-w-xl">
            <NewsletterForm />
            <p className="mt-2.5 text-[11px] text-slate-500">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      <div className="bg-slate-950 text-slate-300">
        <div className="store-container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_0.75fr_0.7fr_1fr] lg:gap-9">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2.5"
              aria-label={`${settings?.store_name || "SM Store"} home`}
            >
              <span className="relative flex size-10 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-sm">
                <ShoppingBag className="size-5" aria-hidden="true" />
                <span className="absolute -right-1 -bottom-1 size-3.5 rounded-full bg-primary ring-2 ring-slate-950" />
              </span>
              <div>
                <p className="font-heading text-lg font-semibold tracking-tight text-white">
                  {settings?.store_name || "SM Store"}
                </p>
                <p className="text-[10px] font-medium tracking-[0.16em] text-slate-500 uppercase">
                  Everyday essentials
                </p>
              </div>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              {settings?.store_tagline ||
                "Thoughtfully selected products, transparent pricing, and reliable delivery across Pakistan."}
            </p>
            <div className="mt-5 flex items-center gap-2">
              {Object.entries(socialIcons).map(([key, Icon]) => {
                const href = socials[key];
                if (!isHttpUrl(href)) return null;
                return (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-9 items-center justify-center rounded-full border border-white/10 text-slate-300 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white"
                    aria-label={key}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-[0.16em] text-white uppercase">
              Shop
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>
                <Link
                  href="/products"
                  className="transition-colors hover:text-white"
                >
                  All products
                </Link>
              </li>
              <li>
                <Link
                  href="/products?sort=newest"
                  className="transition-colors hover:text-white"
                >
                  New arrivals
                </Link>
              </li>
              <li>
                <Link
                  href="/products?sort=popular"
                  className="transition-colors hover:text-white"
                >
                  Best sellers
                </Link>
              </li>
              {categories.slice(0, 4).map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="transition-colors hover:text-white"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-[0.16em] text-white uppercase">
              Help
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/contact" className="transition-colors hover:text-white">
                  Contact us
                </Link>
              </li>
              <li>
                <Link
                  href="/account/orders"
                  className="transition-colors hover:text-white"
                >
                  Track your order
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="transition-colors hover:text-white"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/return-policy"
                  className="transition-colors hover:text-white"
                >
                  Returns &amp; refunds
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-policy"
                  className="transition-colors hover:text-white"
                >
                  Shipping policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-[0.16em] text-white uppercase">
              Company
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              {companyMenu.length > 0 ? (
                companyMenu.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.url}
                      className="transition-colors hover:text-white"
                      target={item.opens_new_tab ? "_blank" : undefined}
                      rel={item.opens_new_tab ? "noopener noreferrer" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link href="/about" className="transition-colors hover:text-white">
                      About us
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy-policy" className="transition-colors hover:text-white">
                      Privacy policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="transition-colors hover:text-white">
                      Terms
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-[0.16em] text-white uppercase">
              Get in touch
            </h3>
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              {settings?.contact_phone ? (
                <a
                  href={`tel:${settings.contact_phone}`}
                  className="flex items-start gap-2.5 transition-colors hover:text-white"
                >
                  <Phone className="mt-0.5 size-4 shrink-0 text-sky-300" aria-hidden="true" />
                  {settings.contact_phone}
                </a>
              ) : null}
              {settings?.contact_email ? (
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="flex items-start gap-2.5 transition-colors hover:text-white"
                >
                  <Mail className="mt-0.5 size-4 shrink-0 text-sky-300" aria-hidden="true" />
                  {settings.contact_email}
                </a>
              ) : null}
              {settings?.address || settings?.city ? (
                <p className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-sky-300" aria-hidden="true" />
                  {[settings.address, settings.city, settings.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              ) : null}
            </div>

            <div className="mt-5 grid gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-slate-300">
                <Banknote className="size-4 text-sky-300" aria-hidden="true" />
                Cash on Delivery available
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-slate-300">
                <Truck className="size-4 text-sky-300" aria-hidden="true" />
                Free shipping over {formatCurrency(freeShipping)}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="store-container flex flex-col gap-3 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {settings?.store_name || "SM Store"}.
              All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link href="/privacy-policy" className="hover:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white">
                Terms
              </Link>
              <Link href="/return-policy" className="hover:text-white">
                Returns
              </Link>
              <span className="inline-flex items-center gap-1.5 text-slate-400">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Secure checkout
                <ArrowRight className="size-3" aria-hidden="true" />
                COD
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
