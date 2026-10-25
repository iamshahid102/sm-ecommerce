import Link from "next/link";
import {
  Camera,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Video,
} from "lucide-react";

import { NewsletterForm } from "@/components/store/newsletter-form";
import { Separator } from "@/components/ui/separator";

const socialIcons = {
  facebook: Globe,
  instagram: Camera,
  twitter: MessageCircle,
  x: MessageCircle,
  tiktok: Video,
  youtube: Video,
};

export function SiteFooter({ settings, categories = [], menu = [] }) {
  const footerMenu = menu.filter(
    (item) => item.location === "footer" && item.is_active,
  );
  const socials = settings?.social_links ?? {};

  return (
    <footer className="mt-16 border-t bg-slate-950 text-slate-300">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1.2fr] lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-hero-gradient text-sm font-bold text-white">
              SM
            </span>
            <div>
              <p className="font-heading text-lg font-semibold text-white">
                {settings?.store_name || "SM Store"}
              </p>
              <p className="text-xs text-slate-400">
                {settings?.store_tagline || "Everyday essentials, thoughtfully selected."}
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Thoughtfully selected products, transparent pricing, and reliable
            delivery across Pakistan.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {Object.entries(socialIcons).map(([key, Icon]) => {
              const href = socials[key];
              if (!href) return null;
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-9 items-center justify-center rounded-full border border-white/10 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label={key}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Shop</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/products" className="hover:text-white">
                All products
              </Link>
            </li>
            {categories.slice(0, 4).map((category) => (
              <li key={category.id}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="hover:text-white"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Help</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact us
              </Link>
            </li>
            <li>
              <Link href="/account/orders" className="hover:text-white">
                Track an order
              </Link>
            </li>
            {footerMenu.slice(0, 4).map((item) => (
              <li key={item.id}>
                <Link
                  href={item.url}
                  className="hover:text-white"
                  target={item.opens_new_tab ? "_blank" : undefined}
                  rel={item.opens_new_tab ? "noopener noreferrer" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Stay in the loop</h3>
          <p className="mt-2 text-sm text-slate-400">
            New arrivals, offers, and store news — no spam.
          </p>
          <div className="mt-4">
            <NewsletterForm />
          </div>
          <div className="mt-5 space-y-2 text-xs text-slate-400">
            {settings?.contact_phone ? (
              <p className="flex items-center gap-2">
                <Phone className="size-3.5" aria-hidden="true" />
                {settings.contact_phone}
              </p>
            ) : null}
            {settings?.contact_email ? (
              <p className="flex items-center gap-2">
                <Mail className="size-3.5" aria-hidden="true" />
                {settings.contact_email}
              </p>
            ) : null}
            {settings?.address || settings?.city ? (
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                {[settings.address, settings.city, settings.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <Separator className="bg-white/10" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>
          © {new Date().getFullYear()} {settings?.store_name || "SM Store"}. All
          rights reserved.
        </p>
        <p>Cash on Delivery available across Pakistan.</p>
      </div>
    </footer>
  );
}
