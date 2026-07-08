import { createBrowserClient } from "@supabase/ssr";

/**
 * RAP Portal — Browser-side Supabase client.
 * Uses @supabase/ssr for cookie-based session management
 * compatible with the SSR middleware session refresh.
 *
 * Safe to use in Client Components ("use client").
 * Never use SUPABASE_SERVICE_ROLE_KEY here.
 */
export function createRapSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
