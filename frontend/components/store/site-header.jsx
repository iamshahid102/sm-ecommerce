"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  Heart,
  LayoutDashboard,
  Menu,
  Search,
  ShoppingBag,
  Truck,
  UserRound,
  X,
} from "lucide-react";

import { useCart } from "@/components/store/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { firstName, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop all" },
  { href: "/products?sort=newest", label: "New arrivals" },
  { href: "/products?sort=popular", label: "Best sellers" },
];

function isActivePath(pathname, href) {
  if (href.includes("?")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({ settings, categories = [], profile }) {
  const pathname = usePathname();
  const { count, hydrated } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = profile?.role === "admin";
  const accountHref = isAdmin ? "/admin" : profile ? "/account" : "/login";
  const customerFirstName = firstName(profile?.full_name);
  const accountLabel = isAdmin
    ? "Dashboard"
    : profile
      ? customerFirstName || "Account"
      : "Sign in";
  const accountAriaLabel = isAdmin
    ? "Open admin dashboard"
    : profile
      ? `Open ${customerFirstName ? `${customerFirstName}'s` : "your"} account`
      : "Sign in to your account";
  const accountActive =
    Boolean(profile) && !isAdmin && pathname.startsWith("/account");
  const wishlistActive = pathname === "/wishlist";
  const storeName = settings?.store_name || "SM Store";
  const freeShipping = Number(settings?.free_shipping_threshold ?? 5000);
  const navCategories = categories
    .filter((category) => !category.parent_id)
    .slice(0, 3);

  function closeMenu() {
    setMobileOpen(false);
  }

  return (
    <>
      <div className="bg-slate-950 text-white">
        <div className="store-container flex h-9 items-center justify-between gap-4 text-[11px] font-medium">
          <div className="hidden items-center gap-6 text-slate-300 sm:flex">
            <span className="inline-flex items-center gap-1.5">
              <Truck className="size-3.5 text-sky-300" aria-hidden="true" />
              Free shipping over {formatCurrency(freeShipping)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Banknote className="size-3.5 text-sky-300" aria-hidden="true" />
              Cash on Delivery
            </span>
          </div>
          <p className="mx-auto truncate text-center text-slate-100">
            {settings?.announcement_active && settings?.announcement_text
              ? settings.announcement_text
              : "Thoughtfully selected essentials, delivered across Pakistan."}
          </p>
          <Link
            href="/contact"
            className="hidden shrink-0 text-slate-300 transition-colors hover:text-white sm:block"
          >
            Need help?
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="store-container">
          <div className="flex h-[72px] items-center gap-3 lg:gap-6">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 shrink-0 rounded-full lg:hidden"
              onClick={() => setMobileOpen((value) => !value)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </Button>

            <Link
              href="/"
              className="flex shrink-0 items-center gap-2.5"
              aria-label={`${storeName} home`}
            >
              <span className="relative flex size-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                <ShoppingBag className="size-5" aria-hidden="true" />
                <span className="absolute -right-1 -bottom-1 size-3.5 rounded-full bg-primary ring-2 ring-white" />
              </span>
              <span className="flex flex-col">
                <span className="font-heading text-lg leading-none font-semibold tracking-tight text-slate-950 sm:text-xl">
                  {storeName}
                </span>
                <span className="mt-1 hidden text-[9px] font-semibold tracking-[0.18em] text-slate-500 uppercase sm:block">
                  Everyday essentials
                </span>
              </span>
            </Link>

            <form
              action="/products"
              className="relative mx-auto hidden w-full max-w-xl md:block"
              role="search"
            >
              <Search
                className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <Input
                name="q"
                placeholder="Search for products, categories and more..."
                className="h-11 rounded-full border-slate-200 bg-slate-50 pr-14 pl-11 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-primary/40 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10"
                aria-label="Search products"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute top-1/2 right-1.5 size-8 -translate-y-1/2 rounded-full bg-slate-950 hover:bg-primary"
                aria-label="Search"
              >
                <Search className="size-4" aria-hidden="true" />
              </Button>
            </form>

            <div className="ml-auto flex items-center gap-1 md:ml-0">
              <Link
                href="/wishlist"
                aria-current={wishlistActive ? "page" : undefined}
                className={cn(
                  "hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors sm:flex",
                  wishlistActive
                    ? "bg-secondary text-primary"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                )}
              >
                <Heart className="size-5" aria-hidden="true" />
                <span className="hidden xl:inline">Wishlist</span>
              </Link>
              <Link
                href={accountHref}
                aria-current={accountActive ? "page" : undefined}
                aria-label={accountAriaLabel}
                className={cn(
                  "hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors sm:flex",
                  accountActive
                    ? "bg-secondary text-primary"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                )}
              >
                {isAdmin ? (
                  <LayoutDashboard className="size-5" aria-hidden="true" />
                ) : (
                  <UserRound className="size-5" aria-hidden="true" />
                )}
                <span className="hidden max-w-28 truncate lg:inline-block">
                  {accountLabel}
                </span>
              </Link>
              <Link
                href="/cart"
                className="relative ml-0 inline-flex h-11 items-center gap-2 rounded-full bg-slate-950 px-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary sm:ml-1"
                aria-label="Open cart"
              >
                <ShoppingBag className="size-5" aria-hidden="true" />
                <span className="hidden sm:inline">Cart</span>
                {hydrated && count > 0 ? (
                  <span className="flex min-w-5 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-[10px] leading-none font-bold text-slate-950">
                    {count > 99 ? "99+" : count}
                  </span>
                ) : null}
              </Link>
            </div>
          </div>

          <div className="pb-3 md:hidden">
            <form action="/products" className="relative" role="search">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <Input
                name="q"
                placeholder="Search products..."
                className="h-10 rounded-full border-slate-200 bg-slate-50 pr-11 pl-10 text-sm shadow-none"
                aria-label="Search products"
              />
              <button
                type="submit"
                className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950 text-white"
                aria-label="Search"
              >
                <Search className="size-3.5" aria-hidden="true" />
              </button>
            </form>
          </div>

          <nav
            className="hidden h-12 items-center justify-center gap-7 border-t border-slate-100 text-sm font-medium text-slate-600 lg:flex"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex h-12 items-center transition-colors hover:text-slate-950",
                    active && "text-slate-950",
                  )}
                >
                  {link.label}
                  {active ? (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
                  ) : null}
                </Link>
              );
            })}
            {navCategories.map((category) => {
              const href = `/categories/${category.slug}`;
              const active = pathname === href;
              return (
                <Link
                  key={category.id}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex h-12 items-center transition-colors hover:text-slate-950",
                    active && "text-slate-950",
                  )}
                >
                  {category.name}
                  {active ? (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
                  ) : null}
                </Link>
              );
            })}
            <Link
              href="/contact"
              aria-current={pathname === "/contact" ? "page" : undefined}
              className={cn(
                "relative inline-flex h-12 items-center transition-colors hover:text-slate-950",
                pathname === "/contact" && "text-slate-950",
              )}
            >
              Contact
              {pathname === "/contact" ? (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
              ) : null}
            </Link>
          </nav>
        </div>

        {mobileOpen ? (
          <div
            id="mobile-menu"
            className="border-t border-slate-100 bg-white lg:hidden"
          >
            <div className="store-container py-5">
              <nav className="grid gap-1" aria-label="Mobile navigation">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={closeMenu}
                    aria-current={
                      isActivePath(pathname, link.href) ? "page" : undefined
                    }
                    className={cn(
                      "rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950",
                      isActivePath(pathname, link.href) &&
                        "bg-secondary text-primary",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/contact"
                  onClick={closeMenu}
                  aria-current={pathname === "/contact" ? "page" : undefined}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950",
                    pathname === "/contact" && "bg-secondary text-primary",
                  )}
                >
                  Contact
                </Link>
              </nav>

              {categories.length > 0 ? (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="px-3 text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                    Shop by category
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {categories.map((category) => {
                      const active =
                        pathname === `/categories/${category.slug}`;

                      return (
                        <Link
                          key={category.id}
                          href={`/categories/${category.slug}`}
                          onClick={closeMenu}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                            active
                              ? "border-primary/20 bg-secondary text-primary"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:border-primary/30 hover:bg-secondary hover:text-primary",
                          )}
                        >
                          {category.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                <Link
                  href="/wishlist"
                  onClick={closeMenu}
                  aria-current={wishlistActive ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium",
                    wishlistActive
                      ? "border-primary/15 bg-secondary text-primary"
                      : "border-slate-200 text-slate-600",
                  )}
                >
                  <Heart className="size-4" aria-hidden="true" />
                  Wishlist
                </Link>
                <Link
                  href={accountHref}
                  onClick={closeMenu}
                  aria-current={accountActive ? "page" : undefined}
                  aria-label={accountAriaLabel}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium",
                    accountActive
                      ? "border-primary/15 bg-secondary text-primary"
                      : "border-slate-200 text-slate-600",
                  )}
                >
                  {isAdmin ? (
                    <LayoutDashboard className="size-4" aria-hidden="true" />
                  ) : (
                    <UserRound className="size-4" aria-hidden="true" />
                  )}
                  {isAdmin
                    ? "Dashboard"
                    : profile
                      ? `Hi, ${customerFirstName || "there"}`
                      : "Sign in"}
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}
