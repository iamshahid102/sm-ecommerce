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

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  {
    label: "Home sections",
    href: "/admin/cms/home-sections",
    icon: ClipboardList,
  },
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

export function AdminNav({ variant = "sidebar", collapsed = false }) {
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
      className={cn(
        "admin-sidebar-scroll flex-1 space-y-0.5 overflow-y-auto py-4 transition-[padding] duration-300",
        collapsed ? "px-2" : "px-3",
      )}
      aria-label="Admin"
    >
      {ITEMS.map((item) => {
        const active = isActive(pathname, item);
        const link = (
          <Link
            key={item.href}
            href={item.href}
            aria-label={collapsed ? item.label : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center rounded-xl text-sm transition-colors",
              collapsed
                ? "justify-center gap-0 px-0 py-2.5"
                : "gap-3 px-3 py-2",
              active
                ? "bg-white/10 font-medium text-white"
                : "text-slate-300 hover:bg-white/5 hover:text-white",
            )}
          >
            <item.icon
              className={cn(
                "shrink-0 transition-[width,height] duration-200",
                collapsed ? "size-5" : "size-4",
                active ? "text-sky-300" : "text-slate-400",
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                "truncate whitespace-nowrap transition-[max-width,opacity] duration-200",
                collapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100",
              )}
            >
              {item.label}
            </span>
          </Link>
        );

        if (!collapsed) return link;

        return (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right" sideOffset={12}>
              {item.label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}
