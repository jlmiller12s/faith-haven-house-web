import { NextResponse } from "next/server";

/**
 * Staff Auth Callback — alias that forwards to /auth/callback
 * Supabase redirect URL alias: /staff/auth/callback
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const url = new URL("/auth/callback", origin);
  if (code) url.searchParams.set("code", code);

  return NextResponse.redirect(url);
}
