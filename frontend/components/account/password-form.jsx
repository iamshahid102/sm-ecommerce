"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormField } from "@/components/auth/form-field";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";
import { changePasswordSchema } from "@/lib/validations/auth";

export function PasswordForm() {
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  async function onSubmit(values) {
    setServerError("");

    try {
      await apiFetch("/me/password", {
        method: "POST",
        body: {
          current_password: values.current_password,
          new_password: values.new_password,
        },
      });
      reset();
      toast.success("Password updated.");
    } catch (error) {
      setServerError(error.message);
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {serverError}
        </p>
      ) : null}

      <FormField
        id="current_password"
        label="Current password"
        error={errors.current_password?.message}
      >
        <PasswordInput
          id="current_password"
          autoComplete="current-password"
          aria-invalid={errors.current_password ? true : undefined}
          aria-describedby={
            errors.current_password ? "current_password-error" : undefined
          }
          {...register("current_password")}
        />
      </FormField>

      <FormField
        id="new_password"
        label="New password"
        error={errors.new_password?.message}
        hint="At least 8 characters with uppercase, lowercase, and a number."
      >
        <PasswordInput
          id="new_password"
          autoComplete="new-password"
          aria-invalid={errors.new_password ? true : undefined}
          aria-describedby={
            errors.new_password ? "new_password-error" : "new_password-hint"
          }
          {...register("new_password")}
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
          aria-invalid={errors.confirm_password ? true : undefined}
          aria-describedby={
            errors.confirm_password ? "confirm_password-error" : undefined
          }
          {...register("confirm_password")}
        />
      </FormField>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Forgot current password?
        </Link>
        <Button type="submit" disabled={isSubmitting} className="rounded-xl">
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <KeyRound className="size-4" aria-hidden="true" />
          )}
          {isSubmitting ? "Updating…" : "Update password"}
        </Button>
      </div>
    </form>
  );
}
