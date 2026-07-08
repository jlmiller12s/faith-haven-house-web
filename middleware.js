import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * RAP Portal — Next.js Middleware
 *
 * Protects all /staff/* routes with server-side session validation.
 * Refreshes Supabase session tokens on every request to prevent expiry.
 *
 * Public staff routes (no session required):
 *   /staff/login
 *   /staff/forgot-password
 *   /staff/reset-password
 *   /staff/auth/callback
 *   /staff/unauthorized
 *   /staff/signup (redirects to login)
 *
 * Auth callback routes:
 *   /auth/callback
 *   /staff/auth/callback
 */

const PUBLIC_STAFF_PATHS = [
  "/staff/login",
  "/staff/forgot-password",
  "/staff/reset-password",
  "/staff/unauthorized",
  "/staff/auth/callback",
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public auth callback routes
  if (
    pathname === "/auth/callback" ||
    pathname === "/staff/auth/callback"
  ) {
    return NextResponse.next();
  }

  // Redirect /staff/signup to login (invite-only info message)
  if (pathname === "/staff/signup") {
    const url = request.nextUrl.clone();
    url.pathname = "/staff/login";
    url.searchParams.set("info", "invite_only");
    return NextResponse.redirect(url);
  }

  // Allow public staff paths without session checks, just refresh session cookies
  if (PUBLIC_STAFF_PATHS.includes(pathname)) {
    const { response } = await updateSession(request);
    return response;
  }

  // Only protect /staff/* paths
  if (!pathname.startsWith("/staff")) {
    return NextResponse.next();
  }

  // Run updateSession helper to refresh cookie and resolve session user
  const { user, response } = await updateSession(request);

  // If no authenticated user, redirect to /staff/login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/staff/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/staff/:path*",
    "/auth/callback",
  ],
};
