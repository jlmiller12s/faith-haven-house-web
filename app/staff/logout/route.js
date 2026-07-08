import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Staff Logout Route Handler
 *
 * Server-side sign-out that:
 * 1. Signs the user out of Supabase (invalidates session server-side)
 * 2. Clears session cookies
 * 3. Redirects to /staff/login?signedout=1
 */
export async function GET(request) {
  const { origin } = new URL(request.url);
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  await supabase.auth.signOut();

  const redirectUrl = new URL("/staff/login", origin);
  redirectUrl.searchParams.set("signedout", "1");
  return NextResponse.redirect(redirectUrl);
}
