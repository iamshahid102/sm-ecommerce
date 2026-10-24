#!/usr/bin/env node

import "dotenv/config";

import { createClient } from "@supabase/supabase-js";

import {
  env,
  isSupabaseConfigured,
} from "../src/config/env.js";

const UPDATE_PASSWORD_FLAG = "--update-password";

function fail(message) {
  console.error(`✖ ${message}`);
  process.exitCode = 1;
}

async function findUserByEmail(supabase, email) {
  const perPage = 1000;
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(`Could not list auth users: ${error.message}`);
    }

    const users = data?.users ?? [];
    const match = users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );

    if (match) {
      return match;
    }

    if (users.length < perPage) {
      return null;
    }

    page += 1;
  }
}

async function main() {
  if (!isSupabaseConfigured) {
    fail(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env.",
    );
    return;
  }

  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    fail("ADMIN_EMAIL and ADMIN_PASSWORD must be set in backend/.env.");
    return;
  }

  const adminEmail = env.ADMIN_EMAIL.trim().toLowerCase();
  const adminPassword = env.ADMIN_PASSWORD;

  if (adminPassword.length < 8) {
    fail("ADMIN_PASSWORD must be at least 8 characters.");
    return;
  }

  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: { "x-application-name": "sm-store-seed-admin" },
      },
    },
  );

  const { data: existingAdmin, error: adminLookupError } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .eq("role", "admin")
    .maybeSingle();

  if (adminLookupError) {
    fail(
      `Could not read profiles (${adminLookupError.message}). Apply the migrations first.`,
    );
    return;
  }

  if (existingAdmin) {
    if (existingAdmin.email.toLowerCase() !== adminEmail) {
      fail(
        `An administrator already exists with ${existingAdmin.email}. ` +
          "Only one admin is allowed. Change ADMIN_EMAIL or remove that admin deliberately.",
      );
      return;
    }

    if (process.argv.includes(UPDATE_PASSWORD_FLAG)) {
      const { error } = await supabase.auth.admin.updateUserById(
        existingAdmin.id,
        { password: adminPassword },
      );

      if (error) {
        fail(`Could not update the admin password: ${error.message}`);
        return;
      }

      console.log(`✔ Admin password updated for ${adminEmail}.`);
      return;
    }

    console.log(`✔ Admin already seeded: ${adminEmail}. Nothing to do.`);
    console.log(
      "  Use `npm run seed:admin -- --update-password` to reset the password.",
    );
    return;
  }

  let authUser = await findUserByEmail(supabase, adminEmail);
  let promotedExistingUser = Boolean(authUser);

  if (!authUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: "Store Admin",
      },
    });

    if (error || !data?.user) {
      fail(`Could not create the admin auth user: ${error?.message ?? "unknown error"}`);
      return;
    }

    authUser = data.user;
    promotedExistingUser = false;
  }

  if (promotedExistingUser) {
    const { error } = await supabase.auth.admin.updateUserById(authUser.id, {
      email_confirm: true,
      ...(process.argv.includes(UPDATE_PASSWORD_FLAG)
        ? { password: adminPassword }
        : {}),
    });

    if (error) {
      fail(`Could not update the existing user: ${error.message}`);
      return;
    }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", authUser.id)
    .maybeSingle();

  if (profileError) {
    fail(
      `Could not read the profile (${profileError.message}). Apply the migrations first.`,
    );
    return;
  }

  const { error: upsertError } = await supabase.from("profiles").upsert(
    {
      id: authUser.id,
      email: adminEmail,
      full_name: profile?.full_name || "Store Admin",
      role: "admin",
    },
    { onConflict: "id" },
  );

  if (upsertError) {
    fail(`Could not promote the admin profile: ${upsertError.message}`);
    return;
  }

  if (promotedExistingUser) {
    console.log(
      `✔ Promoted existing auth user ${adminEmail} to administrator.`,
    );

    if (!process.argv.includes(UPDATE_PASSWORD_FLAG)) {
      console.log(
        "  The existing password was left unchanged. Use --update-password to set ADMIN_PASSWORD.",
      );
    }
  } else {
    console.log(`✔ Admin created: ${adminEmail}.`);
  }

  console.log("  You can now sign in at /admin/login.");
}

main().catch((error) => {
  fail(error.message);
});
