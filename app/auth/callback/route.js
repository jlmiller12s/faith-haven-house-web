import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Auth Callback Route Handler
 *
 * Handles the email confirmation and OAuth code exchange from Supabase.
 * Supabase redirects here after a user clicks a confirmation or invite link.
 *
 * Redirect URLs configured in Supabase Dashboard:
 *   https://faith-haven-house-web.vercel.app/auth/callback
 *   http://localhost:3000/auth/callback
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/staff/login";

  if (code) {
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

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Password recovery flow — redirect to the reset-password page.
      // The session cookie is now set, so updateUser() will work there.
      if (type === "recovery") {
        return NextResponse.redirect(new URL("/staff/reset-password", origin));
      }

      // Email confirmed or invite accepted — redirect to login
      const redirectUrl = new URL("/staff/login", origin);
      redirectUrl.searchParams.set("confirmed", "1");
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Code exchange failed
  const errorUrl = new URL("/staff/login", origin);
  errorUrl.searchParams.set("error", "confirmation_failed");
  return NextResponse.redirect(errorUrl);
}
