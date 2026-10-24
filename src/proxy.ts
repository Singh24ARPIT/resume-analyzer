import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE, isSupabaseConfigured } from "@/lib/supabase/config";
import { updateSession } from "@/lib/supabase/proxy";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/analyze",
  "/resumes",
  "/jobs",
  "/analyses",
  "/compare",
  "/cover-letters",
  "/history",
  "/settings",
];

const AUTH_ROUTES = ["/login", "/signup"];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function redirectWithCookies(url: URL, response: NextResponse) {
  const redirectResponse = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });
  return redirectResponse;
}

export default async function proxy(request: NextRequest) {
  const { pathname, search, origin } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);

  if (!isSupabaseConfigured) {
    const demoSession = request.cookies.get(DEMO_COOKIE)?.value === "1";

    if (isProtected(pathname) && !demoSession) {
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      loginUrl.searchParams.set("setup", "supabase");
      return redirectWithCookies(loginUrl, response);
    }

    return response;
  }

  if (user && AUTH_ROUTES.includes(pathname)) {
    return redirectWithCookies(new URL("/dashboard", origin), response);
  }

  if (!user && isProtected(pathname)) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return redirectWithCookies(loginUrl, response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
