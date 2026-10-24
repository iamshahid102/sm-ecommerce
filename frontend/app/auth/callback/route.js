import { NextResponse } from "next/server";

import { safeNextPath } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const errorCode = url.searchParams.get("error");
  const next = safeNextPath(url.searchParams.get("next"), "/account");

  if (errorCode) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorCode)}`, url.origin),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=auth_callback", url.origin),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=auth_callback", url.origin),
    );
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
