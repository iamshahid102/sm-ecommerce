"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthAlert } from "@/components/auth/auth-alert";
import { FormField } from "@/components/auth/form-field";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema } from "@/lib/validations/auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirm_password: "" },
  });

  async function onSubmit(values) {
    setServerError("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      const message = error.message?.toLowerCase() ?? "";

      if (message.includes("session") || message.includes("token")) {
        setServerError(
          "This reset link is invalid or has expired. Request a new one.",
        );
      } else if (message.includes("too many") || error.status === 429) {
        setServerError(
          "Too many attempts. Please wait a few minutes and try again.",
        );
      } else {
        setServerError("We could not update your password. Please try again.");
      }
      return;
    }

    await supabase.auth.signOut();
    router.replace("/login?message=password_updated");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {serverError ? (
        <AuthAlert title="Password not updated">{serverError}</AuthAlert>
      ) : null}

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          id="password"
          label="New password"
          error={errors.password?.message}
          hint="At least 8 characters with uppercase, lowercase, and a number."
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Create a new password"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={
              errors.password ? "password-error" : "password-hint"
            }
            {...register("password")}
          />
        </FormField>

        <FormField
          id="confirm_password"
          label="Confirm new password"
          error={errors.confirm_password?.message}
        >
          <PasswordInput
            id="confirm_password"
            autoComplete="new-password"
            placeholder="Repeat the new password"
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
            <KeyRound className="size-4" aria-hidden="true" />
          )}
          {isSubmitting ? "Updating…" : "Update password"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Link expired?{" "}
        <Link
          href="/forgot-password"
          className="font-medium text-primary hover:underline"
        >
          Request another one
        </Link>
      </p>
    </div>
  );
}
