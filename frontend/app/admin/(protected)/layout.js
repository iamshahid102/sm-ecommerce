import { LogOut } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

import { signOutAdminAction } from "@/app/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/dal";

export default async function AdminLayout({ children }) {
  const [{ profile }, cookieStore] = await Promise.all([
    requireAdmin(),
    cookies(),
  ]);
  const defaultCollapsed =
    cookieStore.get("admin_sidebar_collapsed")?.value === "1";

  return (
    <div className="flex min-h-svh bg-slate-50">
      <AdminSidebar profile={profile} defaultCollapsed={defaultCollapsed} />

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
