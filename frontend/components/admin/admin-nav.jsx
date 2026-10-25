"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BadgePercent,
  BookOpen,
  Boxes,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Star,
  Tags,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Boxes },
  { label: "Brands", href: "/admin/brands", icon: Tags },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Coupons", href: "/admin/coupons", icon: BadgePercent },
  { label: "CMS pages", href: "/admin/cms/pages", icon: FileText },
  { label: "Banners", href: "/admin/cms/banners", icon: BookOpen },
  { label: "Home sections", href: "/admin/cms/home-sections", icon: ClipboardList },
  { label: "Menu", href: "/admin/cms/menu", icon: ClipboardList },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
  { label: "Subscribers", href: "/admin/subscribers", icon: Mail },
  { label: "Reports", href: "/admin/reports", icon: Activity },
  { label: "Audit logs", href: "/admin/audit-logs", icon: ClipboardList },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function isActive(pathname, item) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AdminNav({ variant = "sidebar" }) {
  const pathname = usePathname();

  if (variant === "horizontal") {
    return (
      <nav className="flex gap-1 overflow-x-auto px-4 py-2" aria-label="Admin">
        {ITEMS.map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap",
                active
                  ? "bg-secondary font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <item.icon className="size-3.5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4"
      aria-label="Admin"
    >
      {ITEMS.map((item) => {
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
              active
                ? "bg-white/10 font-medium text-white"
                : "text-slate-300 hover:bg-white/5 hover:text-white",
            )}
            aria-current={active ? "page" : undefined}
          >
            <item.icon
              className={cn(
                "size-4",
                active ? "text-sky-300" : "text-slate-400",
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
