import { createServerClient } from "@supabase/ssr/dist/module/createServerClient";
import { NextResponse } from "next/server";

/**
 * RAP Portal — Middleware Supabase session handler.
 *
 * Implements a light session checker and cookie refresher.
 * Uses direct sub-module import of createServerClient to prevent
 * Edge Runtime bundling of browser client modules.
 *
 * Never import browser or admin helpers here.
 */
export async function updateSession(request) {
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

  // Refresh session cookie
  const { data: { user } } = await supabase.auth.getUser();

  return { supabase, user, response };
}
