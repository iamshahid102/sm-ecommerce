import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Package,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";

import { PasswordForm } from "@/components/account/password-form";
import { ProfileForm } from "@/components/account/profile-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiFetchServer } from "@/lib/api/server";
import { getAccessToken, requireCustomer } from "@/lib/auth/dal";
import { statusLabel, statusStyle } from "@/lib/commerce";
import { formatCurrency, formatDate, initials } from "@/lib/format";

export const metadata = {
  title: "My profile",
  description: "Manage your SM Store profile and account security.",
};

export default async function AccountPage() {
  const { profile, supabase } = await requireCustomer();
  const token = await getAccessToken(supabase);
  let recentOrders = [];

  try {
    recentOrders = await apiFetchServer("/orders?limit=3", { token });
  } catch {
    recentOrders = [];
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-dark-gradient p-6 text-white shadow-card sm:p-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(56,189,248,0.25),transparent_35%),radial-gradient(circle_at_10%_90%,rgba(37,99,235,0.3),transparent_40%)]"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar size="lg" className="size-16 border border-white/15">
              <AvatarFallback className="bg-white/10 text-xl font-semibold text-white">
                {initials(profile.full_name, profile.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-medium tracking-widest text-sky-300 uppercase">
                My profile
              </p>
              <h1 className="mt-1 font-heading text-2xl font-semibold sm:text-3xl">
                {profile.full_name || "Welcome back"}
              </h1>
              <p className="mt-1 text-sm text-slate-300">{profile.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border border-emerald-300/30 bg-emerald-400/10 text-emerald-200">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Active account
            </Badge>
            <Badge
              variant="outline"
              className="border-white/20 bg-white/5 text-white"
            >
              <CalendarDays className="size-3.5" aria-hidden="true" />
              Joined {formatDate(profile.created_at)}
            </Badge>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <Card className="rounded-2xl shadow-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                  <UserRound className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <CardTitle>Profile details</CardTitle>
                  <CardDescription>
                    Keep your name and phone number up to date for deliveries.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ProfileForm profile={profile} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Use a unique password with a mix of letters, numbers, and
                    case.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <PasswordForm />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl shadow-card">
            <CardHeader className="flex-row items-start justify-between gap-3">
              <div>
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                  <Package className="size-5" aria-hidden="true" />
                </span>
                <CardTitle className="mt-3">Recent orders</CardTitle>
                <CardDescription>
                  Track deliveries and review items you have received.
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/account/orders">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-muted/40 px-4 py-6 text-center">
                  <p className="text-sm font-medium">No orders yet</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Your orders will appear here once you complete checkout.
                  </p>
                  <Button asChild size="sm" className="mt-3">
                    <Link href="/products">Start shopping</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/account/orders/${order.id}`}
                      className="flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {order.order_number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.created_at)} ·{" "}
                          {order.items?.length ?? 0} item
                          {(order.items?.length ?? 0) === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge
                          variant="outline"
                          className={statusStyle(order.status)}
                        >
                          {statusLabel(order.status)}
                        </Badge>
                        <span className="text-sm font-semibold">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Quick links</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button asChild variant="outline" className="justify-between">
                <Link href="/account/orders">
                  <span className="flex items-center gap-2">
                    <Package className="size-4" aria-hidden="true" />
                    All orders
                  </span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-between">
                <Link href="/account/addresses">
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4" aria-hidden="true" />
                    Saved addresses
                  </span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-between">
                <Link href="/account/reviews">
                  <span className="flex items-center gap-2">
                    <Star className="size-4" aria-hidden="true" />
                    My reviews
                  </span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-primary/15 bg-secondary/40 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Account safety</CardTitle>
              <CardDescription className="leading-relaxed">
                Sessions are verified on every protected request. Row Level
                Security keeps your profile and order data scoped to your
                account.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
