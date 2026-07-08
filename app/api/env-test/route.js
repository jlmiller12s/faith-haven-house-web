import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    urlExists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    urlValueStart: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 12)
      : null,
    nodeEnv: process.env.NODE_ENV,
  });
}
