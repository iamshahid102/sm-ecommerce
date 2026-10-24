import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/dal";

export const metadata = {
  title: "Admin sign in",
  description: "Sign in to the SM Store administration area.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage({ searchParams }) {
  const params = await searchParams;
  const { profile } = await getSessionProfile();

  if (profile?.role === "admin" && !profile.is_blocked) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-dark-gradient px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5 text-white">
          <span className="flex size-10 items-center justify-center rounded-xl bg-hero-gradient text-sm font-bold shadow-lg shadow-primary/30">
            SM
          </span>
          <div>
            <p className="font-heading text-lg leading-tight font-semibold">
              SM Store
            </p>
            <p className="text-xs text-slate-400">Store administration</p>
          </div>
        </div>

        <Card className="rounded-3xl border-white/10 bg-white/[0.04] text-white shadow-2xl backdrop-blur">
          <CardHeader>
            <span className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sky-300">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <CardTitle className="mt-3 font-heading text-2xl">
              Admin sign in
            </CardTitle>
            <CardDescription className="text-slate-400">
              This area is limited to the single store administrator account.
            </CardDescription>
          </CardHeader>
          <CardContent className="[&_label]:text-white [&_p]:text-slate-400">
            <LoginForm
              adminOnly
              nextPath="/admin"
              initialError={
                typeof params?.error === "string" ? params.error : undefined
              }
            />
          </CardContent>
        </Card>

        <p className="mt-5 text-center text-xs text-slate-400">
          Customer?{" "}
          <Link href="/login" className="text-sky-300 hover:underline">
            Use the customer sign-in
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
