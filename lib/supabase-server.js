import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * RAP Portal — Server-side Supabase client.
 * Uses @supabase/ssr createServerClient with Next.js cookie store.
 * Call this inside Server Components, Route Handlers, and Server Actions.
 *
 * NEVER expose SUPABASE_SERVICE_ROLE_KEY through this client.
 * For admin operations, use createRapSupabaseAdmin() below.
 */
export async function createRapSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
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
          } catch {
            // setAll called from Server Component — middleware handles refresh
          }
        },
      },
    }
  );
}

/**
 * RAP Portal — Service-role Supabase admin client.
 * Used ONLY in server-side API routes for privileged operations
 * (e.g., inviting new staff, bypassing RLS for audit writes).
 *
 * NEVER call this in client components or expose to the browser.
 * NEVER log the service role key.
 */
export function createRapSupabaseAdmin() {
  const { createClient } = require("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
