import "dotenv/config";

import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value));

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value))
  .pipe(z.url().optional());

const optionalOrigin = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value))
  .pipe(
    z
      .url()
      .transform((value) => value.replace(/\/+$/, ""))
      .optional(),
  );

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().max(65535).default(4000),
  FRONTEND_URL: optionalOrigin,
  FRONTEND_URLS: optionalString,
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  SUPABASE_URL: optionalUrl,
  SUPABASE_ANON_KEY: optionalString,
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  RESEND_API_KEY: optionalString,
  EMAIL_FROM: optionalString,
  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,
  ADMIN_EMAIL: optionalString.pipe(z.email().optional()),
  ADMIN_PASSWORD: optionalString.pipe(z.string().min(8).optional()),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment configuration: ${details}`);
}

export const env = Object.freeze(parsed.data);

export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";

export const corsOrigins = Object.freeze(
  Array.from(
    new Set(
      [
        env.FRONTEND_URL,
        ...(env.FRONTEND_URLS?.split(",") ?? []),
        ...(isProduction
          ? []
          : [
              "http://localhost:3000",
              "http://127.0.0.1:3000",
              "http://localhost:3100",
              "http://127.0.0.1:3100",
            ]),
      ]
        .map((origin) => origin.trim().replace(/\/+$/, ""))
        .filter(Boolean),
    ),
  ),
);

export const isSupabaseConfigured = Boolean(
  env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY,
);

export const isSupabaseAuthConfigured = Boolean(
  env.SUPABASE_URL && env.SUPABASE_ANON_KEY,
);

export function assertRequiredProductionConfig() {
  if (!isProduction) {
    return;
  }

  const missing = [];

  if (!env.SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!env.SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!env.SUPABASE_ANON_KEY) missing.push("SUPABASE_ANON_KEY");
  if (!env.FRONTEND_URL) missing.push("FRONTEND_URL");

  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(", ")}`,
    );
  }
}
