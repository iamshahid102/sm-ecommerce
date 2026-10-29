import { LogOut, ShoppingBag, Store, UserRound } from "lucide-react";
import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";
import { AccountNav } from "@/components/account/account-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { requireCustomer } from "@/lib/auth/dal";
import { firstName, initials } from "@/lib/format";

export default async function AccountLayout({ children }) {
  const { profile } = await requireCustomer();
  const customerName = firstName(profile.full_name) || "Customer";

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-xl print:hidden">
        <div className="mx-auto flex h-[72px] w-full max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8 xl:gap-5">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="relative flex size-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
              <ShoppingBag className="size-5" aria-hidden="true" />
              <span className="absolute -right-1 -bottom-1 size-3.5 rounded-full bg-primary ring-2 ring-white" />
            </span>
            <span className="flex flex-col">
              <span className="font-heading text-lg leading-none font-semibold tracking-tight text-slate-950">
                SM Store
              </span>
              <span className="mt-1 hidden text-[9px] font-semibold tracking-[0.18em] text-slate-500 uppercase sm:block">
                My account
              </span>
            </span>
          </Link>

          <span
            className="hidden h-6 w-px bg-slate-200 xl:block"
            aria-hidden="true"
          />

          <AccountNav />

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link
              href="/account"
              className="hidden h-9 items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1 pr-3 pl-1 shadow-sm transition-colors hover:border-primary/25 hover:bg-slate-50 md:flex"
              aria-label={`Open ${customerName}'s profile`}
            >
              <Avatar size="sm" className="size-8">
                <AvatarFallback className="bg-secondary text-[11px] font-semibold text-primary">
                  <UserRound className="size-4" />
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0">
                <span className="block max-w-32 truncate text-xs font-semibold text-slate-900">
                  {customerName}
                </span>
              </span>
            </Link>

            <form action={signOutAction} data-navigation-form>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="h-9 rounded-full border-slate-200 bg-white px-3 text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
              >
                <LogOut className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-100 xl:hidden">
          <div className="mx-auto w-full max-w-6xl px-4 py-2 sm:px-6 lg:px-8">
            <AccountNav variant="mobile" />
          </div>
        </div>
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
