"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, PanelLeftClose, PanelLeftOpen, Store } from "lucide-react";

import { signOutAdminAction } from "@/app/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const SIDEBAR_COOKIE = "admin_sidebar_collapsed";

export function AdminSidebar({ profile, defaultCollapsed = false }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  function toggleSidebar() {
    setCollapsed((current) => {
      const next = !current;
      document.cookie = `${SIDEBAR_COOKIE}=${next ? "1" : "0"}; Path=/; Max-Age=31536000; SameSite=Lax`;
      return next;
    });
  }

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        id="admin-sidebar"
        aria-label="Admin sidebar"
        className={cn(
          "sticky top-0 hidden h-svh shrink-0 flex-col overflow-hidden bg-dark-gradient text-white transition-[width] duration-300 ease-out lg:flex",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-white/10",
            collapsed ? "justify-center gap-1 px-1.5" : "gap-2.5 px-5",
          )}
        >
          <Link
            href="/admin"
            title="SM Store admin"
            aria-label="SM Store admin dashboard"
            className="flex min-w-0 items-center gap-2.5"
          >
            <span
              className={cn(
                "flex shrink-0 items-center justify-center rounded-xl bg-hero-gradient font-bold shadow-lg shadow-primary/30",
                collapsed ? "size-8 text-xs" : "size-9 text-sm",
              )}
            >
              SM
            </span>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="font-heading text-sm leading-tight font-semibold">
                  SM Store
                </p>
                <p className="text-[11px] text-slate-400">Admin workspace</p>
              </div>
            ) : null}
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            aria-controls="admin-sidebar"
            className={cn(
              "shrink-0 text-slate-300 hover:bg-white/10 hover:text-white",
              !collapsed && "ml-auto",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>

        <AdminNav collapsed={collapsed} />

        <div
          className={cn(
            "border-t border-white/10",
            collapsed ? "flex flex-col items-center gap-2 p-2" : "p-3",
          )}
        >
          <Link
            href="/"
            title="View storefront"
            aria-label="View storefront"
            className={cn(
              "flex items-center rounded-xl text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white",
              collapsed ? "size-10 justify-center" : "gap-3 px-3 py-2.5",
            )}
          >
            <Store
              className={collapsed ? "size-5" : "size-4"}
              aria-hidden="true"
            />
            {!collapsed ? "View storefront" : null}
          </Link>

          <div
            className={cn(
              collapsed
                ? "flex flex-col items-center gap-2"
                : "mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3",
            )}
          >
            <Avatar
              size={collapsed ? "sm" : "default"}
              title={profile.full_name || profile.email || "Store Admin"}
            >
              <AvatarFallback className="bg-white/10 text-xs font-semibold text-white">
                {initials(profile.full_name, profile.email)}
              </AvatarFallback>
            </Avatar>

            {!collapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">
                  {profile.full_name || "Store Admin"}
                </p>
                <p className="truncate text-[11px] text-slate-400">
                  {profile.email}
                </p>
              </div>
            ) : null}

            <form
              action={signOutAdminAction}
              className={cn(!collapsed && "ml-auto")}
              data-navigation-form
            >
              <Button
                type="submit"
                variant="ghost"
                size="icon-sm"
                className="text-slate-300 hover:bg-white/10 hover:text-white"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="size-4" aria-hidden="true" />
              </Button>
            </form>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
