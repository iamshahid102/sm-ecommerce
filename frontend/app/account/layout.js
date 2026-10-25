import {
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  ShoppingBag,
  Star,
  Store,
} from "lucide-react";
import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireCustomer } from "@/lib/auth/dal";
import { initials } from "@/lib/format";

export default async function AccountLayout({ children }) {
  const { profile } = await requireCustomer();

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur print:hidden">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-hero-gradient text-sm font-bold text-white shadow-lg shadow-primary/20">
                SM
              </span>
              <span className="font-heading text-lg font-semibold tracking-tight">
                SM Store
              </span>
            </Link>
            <nav className="hidden items-center gap-1 text-sm lg:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/">Store</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/account">
                  <LayoutDashboard className="size-4" aria-hidden="true" />
                  Dashboard
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/account/orders">
                  <Package className="size-4" aria-hidden="true" />
                  Orders
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/account/addresses">
                  <MapPin className="size-4" aria-hidden="true" />
                  Addresses
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/account/reviews">
                  <Star className="size-4" aria-hidden="true" />
                  Reviews
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/cart">
                  <ShoppingBag className="size-4" aria-hidden="true" />
                  Cart
                </Link>
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2.5 rounded-full border bg-card py-1 pr-3 pl-1 md:flex">
              <Avatar size="sm">
                <AvatarFallback className="bg-secondary text-xs font-semibold text-primary">
                  {initials(profile.full_name, profile.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="max-w-40 truncate text-xs font-medium">
                  {profile.full_name || "Customer"}
                </p>
                <p className="max-w-40 truncate text-[11px] text-muted-foreground">
                  {profile.email}
                </p>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                Customer
              </Badge>
            </div>

            <form action={signOutAction}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </form>
          </div>
        </div>
        <nav
          className="mx-auto flex w-full max-w-6xl items-center gap-1 overflow-x-auto border-t px-4 py-2 sm:px-6 lg:hidden"
          aria-label="Account"
        >
          <Button asChild variant="ghost" size="sm">
            <Link href="/account">Dashboard</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/account/orders">Orders</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/account/addresses">Addresses</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/account/reviews">Reviews</Link>
          </Button>
        </nav>
      </header>

      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-12"
      >
        {children}
      </main>

      <footer className="border-t print:hidden">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} SM Store. All rights reserved.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <Store className="size-3.5" aria-hidden="true" />
            Return to storefront
          </Link>
        </div>
      </footer>
    </div>
  );
}
