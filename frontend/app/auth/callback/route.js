import { NextResponse } from "next/server";

import { safeNextPath } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const errorCode = url.searchParams.get("error");
  const next = safeNextPath(url.searchParams.get("next"), "/account");

  if (errorCode || !code) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("error", "auth_callback");

    if (next !== "/account") {
      loginUrl.searchParams.set("next", next);
    }

    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("error", "auth_callback");

    if (next !== "/account") {
      loginUrl.searchParams.set("next", next);
    }

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
