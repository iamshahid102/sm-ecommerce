"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthAlert } from "@/components/auth/auth-alert";
import { FormField } from "@/components/auth/form-field";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { startNavigation } from "@/lib/navigation-progress";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validations/auth";

const queryErrors = {
  blocked: {
    title: "Account unavailable",
    description:
      "This account has been blocked. Contact the store if you believe this is a mistake.",
  },
  auth_callback: {
    title: "Sign-in link failed",
    description:
      "That link is invalid or has expired. Request a new email and try again.",
  },
  profile_unavailable: {
    title: "Account data unavailable",
    description:
      "We could not load your profile. Apply the latest database migrations and RLS grants, then try again.",
  },
  profile_missing: {
    title: "Profile not found",
    description:
      "Your sign-in worked, but your profile is missing. Contact the store for help.",
  },
  forbidden: {
    title: "Administrator access required",
    description:
      "This account is a customer account. Use the customer sign-in, or ask the store owner for admin access.",
  },
};

function profileLookupErrorMessage(error) {
  if (error?.code === "42501") {
    return "The database denied access to your profile (error 42501). Apply the latest RLS grant migration, then try again.";
  }

  return "Your profile could not be loaded. Apply the latest database migrations and RLS grants, then try again.";
}

function signInErrorMessage(error) {
  const message = error?.message?.toLowerCase() ?? "";

  if (message.includes("email not confirmed")) {
    return "Confirm your email first. Open the verification link we sent you.";
  }

  if (message.includes("invalid login credentials")) {
    return "Incorrect email or password. Please try again.";
  }

  if (message.includes("too many") || error?.status === 429) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }

  if (message.includes("fetch")) {
    return "Could not reach the authentication service. Check your connection.";
  }

  return "We could not sign you in. Please try again.";
}

export function LoginForm({
  nextPath = "/account",
  initialError,
  initialMessage,
  adminOnly = false,
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const initialQueryError = initialError ? queryErrors[initialError] : null;

  async function onSubmit(values) {
    setServerError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setServerError(signInErrorMessage(error));
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setServerError("We could not verify your session. Please try again.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, is_blocked")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile lookup failed after sign-in.", {
        code: profileError.code,
        message: profileError.message,
      });
      await supabase.auth.signOut();
      setServerError(profileLookupErrorMessage(profileError));
      return;
    }

    if (!profile) {
      await supabase.auth.signOut();
      setServerError(
        "Your profile is missing. Ask the store owner to reseed your account.",
      );
      return;
    }

    if (profile.is_blocked) {
      await supabase.auth.signOut();
      setServerError(
        "This account has been blocked. Contact the store for help.",
      );
      return;
    }

    if (adminOnly && profile.role !== "admin") {
      await supabase.auth.signOut();
      setServerError(
        "This account does not have administrator access. Use the customer sign-in instead.",
      );
      return;
    }

    const destination =
      profile.role === "admin"
        ? "/admin"
        : nextPath.startsWith("/admin")
          ? "/account"
          : nextPath;

    startNavigation();
    router.replace(destination);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {initialQueryError ? (
        <AuthAlert title={initialQueryError.title}>
          {initialQueryError.description}
        </AuthAlert>
      ) : null}

      {initialMessage === "password_updated" ? (
        <AuthAlert variant="success" title="Password updated">
          Sign in with your new password.
        </AuthAlert>
      ) : null}

      {serverError ? (
        <AuthAlert title="Sign-in failed">{serverError}</AuthAlert>
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

        <FormField
          id="password"
          label="Password"
          error={errors.password?.message}
        >
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Your password"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
        </FormField>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="h-10 w-full rounded-xl bg-hero-gradient text-white shadow-lg shadow-primary/20"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <LogIn className="size-4" aria-hidden="true" />
          )}
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {adminOnly ? (
          <>
            Customer account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Customer sign in
            </Link>
          </>
        ) : (
          <>
            New to SM Store?{" "}
            <Link
              href={
                nextPath !== "/account"
                  ? `/register?next=${encodeURIComponent(nextPath)}`
                  : "/register"
              }
              className="font-medium text-primary hover:underline"
            >
              Create an account
            </Link>
          </>
        )}
      </p>

      {!adminOnly ? (
        <p className="text-center text-xs text-muted-foreground">
          Store staff?{" "}
          <Link
            href="/admin/login"
            className="hover:text-foreground hover:underline"
          >
            Admin sign in
          </Link>
        </p>
      ) : null}
    </div>
  );
}
