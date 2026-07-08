import { createBrowserClient } from "@supabase/ssr";

/**
 * RAP Portal — Browser-side Supabase client.
 * Uses @supabase/ssr for cookie-based session management.
 *
 * Safe to use in Client Components ("use client").
 * Never import this file from middleware.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
