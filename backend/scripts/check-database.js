import "dotenv/config";

import { createClient } from "@supabase/supabase-js";

const tables = [
  "profiles",
  "addresses",
  "categories",
  "brands",
  "products",
  "product_images",
  "product_variants",
  "coupons",
  "orders",
  "order_items",
  "order_status_history",
  "payments",
  "coupon_redemptions",
  "cart_items",
  "wishlist",
  "reviews",
  "site_settings",
  "banners",
  "home_sections",
  "cms_pages",
  "menu_items",
  "contact_messages",
  "newsletter_subscribers",
  "audit_logs",
  "stripe_events",
];

const buckets = ["product-images", "cms-assets", "site-assets"];
const schemaOnly = process.argv.includes("--schema-only");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "✖ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env.",
  );
  process.exitCode = 1;
} else {
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let failures = 0;

  console.log("Database tables");

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select("id", { count: "exact" })
      .limit(1);

    if (error) {
      failures += 1;
      console.log(`  ✖ ${table.padEnd(24)} ${error.code ?? "ERROR"}`);
    } else {
      console.log(`  ✔ ${table.padEnd(24)} rows=${count ?? "?"}`);
    }
  }

  console.log("\nStorage buckets");

  for (const bucket of buckets) {
    const { data, error } = await supabase.storage.getBucket(bucket);

    if (error || !data) {
      failures += 1;
      console.log(`  ✖ ${bucket.padEnd(24)} missing`);
    } else {
      console.log(
        `  ✔ ${bucket.padEnd(24)} public=${data.public} limit=${data.file_size_limit}`,
      );
    }
  }

  if (!schemaOnly) {
    const { count: profileCount, error: profilesError } = await supabase
      .from("profiles")
      .select("id", { count: "exact" })
      .limit(1);

    const { data: admins, error: adminsError } = await supabase
      .from("profiles")
      .select("id,email,is_blocked")
      .eq("role", "admin");

    if (profilesError || adminsError) {
      failures += 1;
      console.log("\nProfiles: unavailable");
    } else {
      console.log(`\nProfiles: rows=${profileCount ?? "?"}`);

      if (admins.length !== 1) {
        failures += 1;
        console.log(
          `  ✖ Expected exactly one admin, found ${admins.length}. Run \`npm run seed:admin\` in backend/.`,
        );
      } else if (admins[0].is_blocked) {
        failures += 1;
        console.log("  ✖ The admin account is blocked.");
      } else {
        console.log("  ✔ Exactly one active admin is seeded.");
      }
    }
  }

  const { data: settings, error: settingsError } = await supabase
    .from("site_settings")
    .select("id,store_name")
    .eq("id", 1)
    .maybeSingle();

  if (settingsError || !settings) {
    failures += 1;
    console.log("Site settings: missing the default row.");
  } else {
    console.log(`Site settings: default row present (${settings.store_name}).`);
  }

  const { data: metrics, error: metricsError } = await supabase.rpc(
    "admin_dashboard_metrics",
  );

  if (metricsError || !metrics) {
    failures += 1;
    console.log("Dashboard metrics: function unavailable.");
  } else {
    console.log("Dashboard metrics: function ready.");
  }

  if (failures > 0) {
    console.log(
      `\n✖ ${failures} check(s) failed. Apply the migrations in docs/PHASE-1.md first.`,
    );
    process.exitCode = 1;
  } else if (schemaOnly) {
    console.log("\n✔ Database schema, buckets, and defaults look ready.");
  } else {
    console.log(
      "\n✔ Database schema, buckets, admin, and defaults look ready.",
    );
  }
}
