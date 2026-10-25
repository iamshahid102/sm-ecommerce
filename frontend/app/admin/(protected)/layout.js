import { LogOut, Store } from "lucide-react";
import Link from "next/link";

import { signOutAdminAction } from "@/app/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/dal";
import { initials } from "@/lib/format";

export default async function AdminLayout({ children }) {
  const { profile } = await requireAdmin();

  return (
    <div className="flex min-h-svh bg-slate-50">
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col bg-dark-gradient text-white lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-hero-gradient text-sm font-bold shadow-lg shadow-primary/30">
            SM
          </span>
          <div>
            <p className="font-heading text-sm leading-tight font-semibold">
              SM Store
            </p>
            <p className="text-[11px] text-slate-400">Admin workspace</p>
          </div>
        </div>

        <AdminNav />

        <div className="border-t border-white/10 p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Store className="size-4" aria-hidden="true" />
            View storefront
          </Link>

          <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <Avatar size="sm">
              <AvatarFallback className="bg-white/10 text-xs font-semibold text-white">
                {initials(profile.full_name, profile.email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">
                {profile.full_name || "Store Admin"}
              </p>
              <p className="truncate text-[11px] text-slate-400">
                {profile.email}
              </p>
            </div>
            <form action={signOutAdminAction}>
              <Button
                type="submit"
                variant="ghost"
                size="icon-sm"
                className="text-slate-300 hover:bg-white/10 hover:text-white"
                aria-label="Sign out"
              >
                <LogOut className="size-4" aria-hidden="true" />
              </Button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-2 lg:hidden">
                <span className="flex size-8 items-center justify-center rounded-lg bg-hero-gradient text-xs font-bold text-white">
                  SM
                </span>
                <span className="font-heading text-sm font-semibold">
                  Admin
                </span>
              </Link>
              <div className="hidden sm:block">
                <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                  Store administration
                </p>
                <p className="text-sm font-medium">Workspace</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="hidden bg-emerald-50 text-emerald-700 sm:inline-flex">
                Admin
              </Badge>
              <Link
                href="/"
                className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
              >
                Storefront
              </Link>
              <form action={signOutAdminAction}>
                <Button type="submit" variant="outline" size="sm">
                  <LogOut className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </form>
            </div>
          </div>
          <div className="border-t lg:hidden">
            <AdminNav variant="horizontal" />
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
