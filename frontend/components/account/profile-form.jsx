"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api/client";
import { profileSchema } from "@/lib/validations/auth";

export function ProfileForm({ profile }) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
    },
  });

  async function onSubmit(values) {
    setServerError("");

    try {
      await apiFetch("/me", {
        method: "PUT",
        body: {
          full_name: values.full_name,
          phone: values.phone,
        },
      });
      reset(values);
      toast.success("Profile updated.");
      router.refresh();
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
        id="account_email"
        label="Email address"
        hint="Contact the store if you need to change your email."
      >
        <Input id="account_email" value={profile.email} readOnly disabled />
      </FormField>

      <FormField
        id="full_name"
        label="Full name"
        error={errors.full_name?.message}
      >
        <Input
          id="full_name"
          autoComplete="name"
          aria-invalid={errors.full_name ? true : undefined}
          aria-describedby={errors.full_name ? "full_name-error" : undefined}
          {...register("full_name")}
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
          aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
          {...register("phone")}
        />
      </FormField>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="rounded-xl"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
