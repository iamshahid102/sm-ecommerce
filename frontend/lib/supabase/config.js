function readPublicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return { url, key };
}

export function hasSupabaseConfig() {
  const { url, key } = readPublicSupabaseConfig();
  return Boolean(url && key);
}

export function getSupabaseConfig() {
  const { url, key } = readPublicSupabaseConfig();

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in frontend/.env.local.",
    );
  }

  return { url, key };
}
