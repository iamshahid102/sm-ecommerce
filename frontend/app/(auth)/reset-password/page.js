import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Set a new password",
  description: "Choose a new password for your SM Store account.",
};

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    return (
      <Card className="rounded-3xl border-border/70 shadow-card">
        <CardHeader>
          <span className="flex size-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </span>
          <CardTitle className="mt-3 font-heading text-2xl">
            Reset link expired
          </CardTitle>
          <CardDescription>
            This link is invalid or has expired. Request a new password reset
            email to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full rounded-xl">
            <Link href="/forgot-password">Request a new link</Link>
          </Button>
          <Button asChild variant="outline" className="w-full rounded-xl">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-border/70 shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">
          Set a new password
        </CardTitle>
        <CardDescription>
          Your reset link is valid. Choose a strong password you have not used
          before.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm />
      </CardContent>
    </Card>
  );
}
