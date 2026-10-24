import { CalendarDays, Package, ShieldCheck, UserRound } from "lucide-react";

import { PasswordForm } from "@/components/account/password-form";
import { ProfileForm } from "@/components/account/profile-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireCustomer } from "@/lib/auth/dal";
import { formatDate, initials } from "@/lib/format";

export const metadata = {
  title: "My account",
  description: "Manage your SM Store profile and account security.",
};

export default async function AccountPage() {
  const { profile } = await requireCustomer();

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
                My account
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
            <CardHeader>
              <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                <Package className="size-5" aria-hidden="true" />
              </span>
              <CardTitle className="mt-3">Orders</CardTitle>
              <CardDescription>
                Your order history and tracking will appear here after checkout
                launches.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-dashed bg-muted/40 px-4 py-6 text-center">
                <p className="text-sm font-medium">No orders yet</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  The storefront and checkout arrive in the next phases. Your
                  account is ready for them.
                </p>
              </div>
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
