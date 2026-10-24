"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, MailCheck, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthAlert } from "@/components/auth/auth-alert";
import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState("");
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values) {
    setServerError("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      const message = error.message?.toLowerCase() ?? "";

      if (message.includes("too many") || error.status === 429) {
        setServerError(
          "Too many reset requests. Please wait a few minutes and try again.",
        );
      } else if (message.includes("fetch")) {
        setServerError(
          "Could not reach the authentication service. Check your connection.",
        );
      } else {
        setServerError("We could not send the reset email. Please try again.");
      }
      return;
    }

    setSentTo(values.email);
  }

  if (sentTo) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
          <MailCheck className="size-6 text-emerald-700" aria-hidden="true" />
          <h2 className="mt-3 font-heading text-xl font-semibold">
            Check your email
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-emerald-900/80">
            If an account exists for{" "}
            <span className="font-medium">{sentTo}</span>, a password reset link
            is on its way. The link expires after a short time.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full rounded-xl">
          <Link href="/login">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to sign in
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {serverError ? (
        <AuthAlert title="Reset email not sent">{serverError}</AuthAlert>
      ) : null}

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          id="email"
          label="Email address"
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
        </FormField>

        <Button
          type="submit"
          className="h-10 w-full rounded-xl bg-hero-gradient text-white shadow-lg shadow-primary/20"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="size-4" aria-hidden="true" />
          )}
          {isSubmitting ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
