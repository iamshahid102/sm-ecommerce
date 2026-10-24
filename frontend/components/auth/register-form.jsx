"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthAlert } from "@/components/auth/auth-alert";
import { FormField } from "@/components/auth/form-field";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { registerSchema } from "@/lib/validations/auth";

function signUpErrorMessage(error) {
  const message = error?.message?.toLowerCase() ?? "";

  if (message.includes("already registered")) {
    return "An account already exists for this email. Try signing in instead.";
  }

  if (message.includes("too many") || error?.status === 429) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }

  if (message.includes("fetch")) {
    return "Could not reach the authentication service. Check your connection.";
  }

  return "We could not create your account. Please try again.";
}

export function RegisterForm({ nextPath = "/account" }) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
    },
  });

  async function onSubmit(values) {
    setServerError("");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.full_name,
          ...(values.phone ? { phone: values.phone } : {}),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          nextPath,
        )}`,
      },
    });

    if (error) {
      setServerError(signUpErrorMessage(error));
      return;
    }

    if (data.session) {
      router.replace(nextPath);
      router.refresh();
      return;
    }

    setPendingEmail(values.email);
  }

  if (pendingEmail) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
        <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <MailCheck className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-heading text-xl font-semibold">
          Check your email
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-emerald-900/80">
          We sent a verification link to{" "}
          <span className="font-medium text-emerald-950">{pendingEmail}</span>.
          Open it to activate your account, then come back and sign in.
        </p>
        <p className="mt-3 text-xs leading-relaxed text-emerald-800/70">
          The email can take a minute to arrive. Check your spam folder if you
          do not see it.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="rounded-xl">
            <Link href="/login">Go to sign in</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-emerald-300 bg-transparent text-emerald-900 hover:bg-emerald-100"
            onClick={() => setPendingEmail("")}
          >
            Use a different email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {serverError ? (
        <AuthAlert title="Could not create account">{serverError}</AuthAlert>
      ) : null}

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          id="full_name"
          label="Full name"
          error={errors.full_name?.message}
        >
          <Input
            id="full_name"
            autoComplete="name"
            placeholder="Ayesha Khan"
            aria-invalid={errors.full_name ? true : undefined}
            aria-describedby={
              errors.full_name ? "full_name-error" : undefined
            }
            {...register("full_name")}
          />
        </FormField>

        <FormField id="email" label="Email address" error={errors.email?.message}>
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

        <FormField
          id="phone"
          label="Phone number"
          optional
          error={errors.phone?.message}
          hint="Used for delivery updates."
        >
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="03001234567"
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={
              errors.phone
                ? "phone-error"
                : "phone-hint"
            }
            {...register("phone")}
          />
        </FormField>

        <FormField
          id="password"
          label="Password"
          error={errors.password?.message}
          hint="At least 8 characters with uppercase, lowercase, and a number."
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Create a password"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={
              errors.password ? "password-error" : "password-hint"
            }
            {...register("password")}
          />
        </FormField>

        <FormField
          id="confirm_password"
          label="Confirm password"
          error={errors.confirm_password?.message}
        >
          <PasswordInput
            id="confirm_password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            aria-invalid={errors.confirm_password ? true : undefined}
            aria-describedby={
              errors.confirm_password ? "confirm_password-error" : undefined
            }
            {...register("confirm_password")}
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
            <UserPlus className="size-4" aria-hidden="true" />
          )}
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          By creating an account you agree to the store&apos;s terms and privacy
          policy.
        </p>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
