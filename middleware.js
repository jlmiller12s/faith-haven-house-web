import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/**
 * RAP Portal — Next.js Middleware
 *
 * Protects all /staff/* routes with server-side session validation.
 * Refreshes Supabase session tokens on every request to prevent expiry.
 * Enforces MFA assurance level for protected staff routes.
 *
 * Public staff routes (no session required):
 *   /staff/login
 *   /staff/forgot-password
 *   /staff/reset-password
 *   /staff/auth/callback
 *   /staff/unauthorized
 *   /staff/signup  (redirect to login with message)
 *
 * Auth callback routes:
 *   /auth/callback
 *   /staff/auth/callback
 */

// Routes that don't require an authenticated session
const PUBLIC_STAFF_PATHS = [
  "/staff/login",
  "/staff/forgot-password",
  "/staff/reset-password",
  "/staff/unauthorized",
  "/staff/auth/callback",
];

export async function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

  // Allow public auth callback routes
  if (
    pathname === "/auth/callback" ||
    pathname === "/staff/auth/callback"
  ) {
    return NextResponse.next();
  }

  // Redirect /staff/signup to unauthorized (invite-only)
  if (pathname === "/staff/signup") {
    const url = request.nextUrl.clone();
    url.pathname = "/staff/login";
    url.searchParams.set("info", "invite_only");
    return NextResponse.redirect(url);
  }

  // Allow public staff paths without session check
  if (PUBLIC_STAFF_PATHS.includes(pathname)) {
    return await refreshSession(request);
  }

  // Only enforce auth on /staff/* routes
  if (!pathname.startsWith("/staff")) {
    return NextResponse.next();
  }

  // --- Protected /staff/* routes below ---

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — IMPORTANT: must call getUser() not getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. No session → login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/staff/login";
    return NextResponse.redirect(url);
  }

  // 2. Check active staff profile
  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("id, is_active, mfa_required, role")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile || !profile.is_active) {
    // Sign out and redirect to unauthorized
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = "/staff/unauthorized";
    return NextResponse.redirect(url);
  }

  // 3. MFA enforcement — skip for MFA routes themselves
  const isMfaRoute =
    pathname === "/staff/mfa/setup" || pathname === "/staff/mfa/verify";

  if (profile.mfa_required && !isMfaRoute) {
    const {
      data: { currentLevel },
    } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (currentLevel !== "aal2") {
      // Check if they have any enrolled factors
      const {
        data: { totp },
      } = await supabase.auth.mfa.listFactors();

      const hasVerifiedFactor = totp?.some((f) => f.status === "verified");

      const url = request.nextUrl.clone();
      url.pathname = hasVerifiedFactor
        ? "/staff/mfa/verify"
        : "/staff/mfa/setup";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

/**
 * Refresh session cookies on public staff paths
 */
async function refreshSession(request) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session token
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    "/staff/:path*",
    "/auth/callback",
  ],
};
