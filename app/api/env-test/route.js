import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    // Prefixed variables (publicly accessible in browser)
    nextPublicUrlExists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    nextPublicAnonExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    nextPublicUrlValueStart: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 12)
      : null,

    // Unprefixed variables (server-only variables from Supabase Vercel integration)
    serverUrlExists: !!process.env.SUPABASE_URL,
    serverAnonExists: !!process.env.SUPABASE_ANON_KEY,
    serverServiceKeyExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    serverUrlValueStart: process.env.SUPABASE_URL
      ? process.env.SUPABASE_URL.substring(0, 12)
      : null,

    nodeEnv: process.env.NODE_ENV,
  });
}
