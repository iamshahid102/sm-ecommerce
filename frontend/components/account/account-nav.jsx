"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  Package,
  ShoppingBag,
  Star,
  Store,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { label: "Shop", href: "/products", icon: Store, exact: true },
  { label: "Profile", href: "/account", icon: UserRound, exact: true },
  { label: "Orders", href: "/account/orders", icon: Package },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Reviews", href: "/account/reviews", icon: Star },
  { label: "Cart", href: "/cart", icon: ShoppingBag, exact: true },
];

function isActivePath(pathname, item) {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AccountNav({ variant = "desktop" }) {
  const pathname = usePathname();
  const isMobile = variant === "mobile";

  return (
    <nav
      aria-label="Account navigation"
      className={cn(
        isMobile
          ? "flex items-center gap-1 overflow-x-auto pb-0.5"
          : "hidden items-center gap-1 xl:flex",
      )}
    >
      {navItems.map((item) => {
        const active = isActivePath(pathname, item);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full font-medium transition-colors",
              isMobile ? "h-9 px-3 text-xs" : "h-9 px-3 text-sm",
              active
                ? "bg-secondary text-primary shadow-sm ring-1 ring-primary/10"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
            )}
          >
            <Icon
              className={cn(
                isMobile ? "size-3.5" : "size-4",
                active && "text-primary",
              )}
              aria-hidden="true"
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
