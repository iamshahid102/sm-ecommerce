"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  LayoutDashboard,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";

import { useCart } from "@/components/store/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SiteHeader({ settings, categories = [], profile }) {
  const pathname = usePathname();
  const { count, hydrated } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = profile?.role === "admin";
  const accountHref = isAdmin ? "/admin" : profile ? "/account" : "/login";

  const navCategories = categories.slice(0, 5);

  return (
    <>
      {settings?.announcement_active && settings?.announcement_text ? (
        <div className="bg-slate-950 px-4 py-2 text-center text-xs font-medium text-white">
          {settings.announcement_text}
        </div>
      ) : null}

      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </Button>

          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-hero-gradient text-sm font-bold text-white shadow-lg shadow-primary/20">
              SM
            </span>
            <div className="hidden sm:block">
              <p className="font-heading text-base leading-tight font-semibold">
                {settings?.store_name || "SM Store"}
              </p>
              <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                Everyday essentials
              </p>
            </div>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Main">
            <Button
              asChild
              variant={pathname === "/products" ? "secondary" : "ghost"}
              size="sm"
            >
              <Link href="/products">Shop all</Link>
            </Button>
            {navCategories.map((category) => (
              <Button key={category.id} asChild variant="ghost" size="sm">
                <Link href={`/categories/${category.slug}`}>{category.name}</Link>
              </Button>
            ))}
          </nav>

          <form
            action="/products"
            className="relative ml-auto hidden w-full max-w-sm md:block"
          >
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              name="q"
              placeholder="Search products…"
              className="h-9 bg-muted/50 pl-9"
              aria-label="Search products"
            />
          </form>

          <div className="ml-auto flex items-center gap-0.5 md:ml-2">
            <Button asChild variant="ghost" size="icon" aria-label="Wishlist">
              <Link href="/wishlist">
                <Heart className="size-5" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Account">
              <Link href={accountHref}>
                {isAdmin ? (
                  <LayoutDashboard className="size-5" aria-hidden="true" />
                ) : (
                  <UserRound className="size-5" aria-hidden="true" />
                )}
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" className="relative" aria-label="Cart">
              <Link href="/cart">
                <ShoppingBag className="size-5" aria-hidden="true" />
                {hydrated && count > 0 ? (
                  <Badge className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full p-0 text-[10px]">
                    {count > 99 ? "99+" : count}
                  </Badge>
                ) : null}
              </Link>
            </Button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="border-t bg-background px-4 py-4 lg:hidden">
            <form action="/products" className="relative mb-4">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                name="q"
                placeholder="Search products…"
                className="bg-muted/50 pl-9"
                aria-label="Search products"
              />
            </form>
            <div className="grid gap-1">
              <Link
                href="/products"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                Shop all
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm hover:bg-muted",
                    pathname === `/categories/${category.slug}` &&
                      "bg-muted font-medium",
                  )}
                >
                  {category.name}
                </Link>
              ))}
              <Link
                href={accountHref}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
              >
                {isAdmin ? "Admin dashboard" : profile ? "My account" : "Sign in"}
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
              >
                Contact
              </Link>
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}
