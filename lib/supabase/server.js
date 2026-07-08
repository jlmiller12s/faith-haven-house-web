import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * RAP Portal — Server-side Supabase client.
 * Uses @supabase/ssr createServerClient with Next.js cookie store.
 * Call this inside Server Components, Server Actions, and Route Handlers.
 *
 * Never import this file from middleware.
 */
export async function createSupabaseServerClient() {
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
            // Safe to ignore if called from Server Component where cookies cannot be written
          }
        },
      },
    }
  );
}
