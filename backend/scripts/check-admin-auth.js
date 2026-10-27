#!/usr/bin/env node

import "dotenv/config";

import { createClient } from "@supabase/supabase-js";

const missing = [
  ["SUPABASE_URL", process.env.SUPABASE_URL],
  ["SUPABASE_ANON_KEY", process.env.SUPABASE_ANON_KEY],
  ["SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY],
  ["ADMIN_EMAIL", process.env.ADMIN_EMAIL],
  ["ADMIN_PASSWORD", process.env.ADMIN_PASSWORD],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

function describeError(error) {
  if (!error) {
    return "unknown error";
  }

  return [error.code, error.message].filter(Boolean).join(": ");
}

function pass(message) {
  console.log(`  OK   ${message}`);
}

function fail(message) {
  console.log(`  FAIL ${message}`);
}

async function main() {
  if (missing.length > 0) {
    console.error(
      `Missing backend/.env values: ${missing.join(", ")}. Cannot check admin auth.`,
    );
    process.exitCode = 1;
    return;
  }

  const client = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );
  const adminClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  console.log("\nAdmin authentication check");

  const { data: signInData, error: signInError } =
    await client.auth.signInWithPassword({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });

  if (signInError || !signInData?.user) {
    fail(`password sign-in failed (${describeError(signInError)})`);
    console.log(
      "\nCheck ADMIN_EMAIL and ADMIN_PASSWORD, or reseed the admin with `npm.cmd run seed:admin`.",
    );
    process.exitCode = 1;
    return;
  }

  let failures = 0;
  const user = signInData.user;
  pass(`password sign-in worked for ${user.email ?? process.env.ADMIN_EMAIL}`);

  const { data: rlsProfile, error: rlsProfileError } = await client
    .from("profiles")
    .select("role, is_blocked")
    .eq("id", user.id)
    .maybeSingle();

  if (rlsProfileError) {
    failures += 1;
    fail(
      `authenticated profile read failed (${describeError(rlsProfileError)})`,
    );
  } else if (!rlsProfile) {
    failures += 1;
    fail("authenticated profile read returned no row");
  } else {
    pass("authenticated profile read worked through RLS");
  }

  const { data: isAdmin, error: isAdminError } = await client.rpc("is_admin");

  if (isAdminError) {
    failures += 1;
    fail(`is_admin() RPC failed (${describeError(isAdminError)})`);
  } else if (isAdmin !== true) {
    failures += 1;
    fail("is_admin() returned false for the configured admin");
  } else {
    pass("is_admin() returned true");
  }

  const { data: isCustomer, error: isCustomerError } =
    await client.rpc("is_customer");

  if (isCustomerError) {
    failures += 1;
    fail(`is_customer() RPC failed (${describeError(isCustomerError)})`);
  } else if (isCustomer !== false) {
    failures += 1;
    fail("is_customer() returned true for the configured admin");
  } else {
    pass("is_customer() returned false");
  }

  const { data: serviceProfile, error: serviceProfileError } = await adminClient
    .from("profiles")
    .select("id, email, role, is_blocked")
    .eq("id", user.id)
    .maybeSingle();

  if (serviceProfileError) {
    failures += 1;
    fail(
      `service-role profile read failed (${describeError(serviceProfileError)})`,
    );
  } else if (!serviceProfile) {
    failures += 1;
    fail("service-role profile read returned no row");
  } else if (serviceProfile.role !== "admin") {
    failures += 1;
    fail(`profile role is "${serviceProfile.role}", expected "admin"`);
  } else if (serviceProfile.is_blocked) {
    failures += 1;
    fail("admin profile is blocked");
  } else {
    pass("service-role profile row is an active admin");
  }

  const { error: signOutError } = await client.auth.signOut();

  if (signOutError) {
    console.log(`  WARN sign-out failed (${describeError(signOutError)})`);
  }

  if (failures > 0) {
    console.log(
      "\nAdmin auth is not ready. If a profile read or RPC reports 42501, run\n" +
        "supabase/migrations/20261027000100_grant_rls_function_execute.sql in the\n" +
        "Supabase SQL Editor, then run this check again.",
    );
    process.exitCode = 1;
    return;
  }

  console.log("\nAdmin authentication is ready.");
}

await main();
