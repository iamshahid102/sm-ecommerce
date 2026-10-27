import { NextResponse } from "next/server";

import { updateSession } from "@/lib/supabase/session";

function redirectWithCookies(target, sessionResponse) {
  sessionResponse.cookies
    .getAll()
    .forEach((cookie) => target.cookies.set(cookie));

  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = sessionResponse.headers.get(header);
    if (value) {
      target.headers.set(header, value);
    }
  }

  return target;
}

export async function proxy(request) {
  const { response, claims, configured } = await updateSession(request);

  if (!configured) {
    return response;
  }

  const path = request.nextUrl.pathname;
  const isAdminLogin = path === "/admin/login";
  const isAccountRoute = path === "/account" || path.startsWith("/account/");
  const isAdminRoute =
    (path === "/admin" || path.startsWith("/admin/")) && !isAdminLogin;

  if ((isAccountRoute || isAdminRoute) && !claims) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = isAdminRoute ? "/admin/login" : "/login";
    loginUrl.search = "";

    if (isAccountRoute) {
      loginUrl.searchParams.set(
        "next",
        `${request.nextUrl.pathname}${request.nextUrl.search}`,
      );
    }

    return redirectWithCookies(NextResponse.redirect(loginUrl), response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
