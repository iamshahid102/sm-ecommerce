import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

import { getSupabaseConfig, hasSupabaseConfig } from "@/lib/supabase/config";

export async function updateSession(request) {
  let response = NextResponse.next({ request });

  if (!hasSupabaseConfig()) {
    return { response, claims: null, configured: false };
  }

  const { url, key } = getSupabaseConfig();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // getClaims verifies the JWT signature; getSession only decodes the cookie.
  const { data, error } = await supabase.auth.getClaims();

  return {
    response,
    claims: error ? null : (data?.claims ?? null),
    configured: true,
  };
}
