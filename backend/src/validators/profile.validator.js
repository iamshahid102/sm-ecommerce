import { z } from "zod";

const optionalPhone = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z
    .string()
    .trim()
    .regex(
      /^\+?[0-9][0-9 ()-]{6,19}$/,
      "Enter a valid phone number, for example 03001234567.",
    )
    .optional(),
);

export const updateProfileSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters.")
      .max(100, "Full name must be 100 characters or fewer."),
    phone: optionalPhone,
  })
  .strict();

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Enter your current password."),
    new_password: z
      .string()
      .min(8, "New password must be at least 8 characters.")
      .max(72, "New password must be 72 characters or fewer.")
      .regex(/[a-z]/, "New password must include a lowercase letter.")
      .regex(/[A-Z]/, "New password must include an uppercase letter.")
      .regex(/[0-9]/, "New password must include a number."),
  })
  .strict();
