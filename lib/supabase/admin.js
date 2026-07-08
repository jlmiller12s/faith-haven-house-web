import { createClient } from "@supabase/supabase-js";

/**
 * RAP Portal — Service-role Supabase admin client.
 * Used ONLY in server-side API routes for privileged operations
 * (e.g., inviting new staff, bypassing RLS for audit writes).
 *
 * NEVER call this in client components or expose to the browser.
 * NEVER import this file from middleware or client components.
 */
export function createSupabaseAdminClient() {
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
