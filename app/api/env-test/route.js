import { NextResponse } from "next/server";

export async function GET() {
  const envKeys = Object.keys(process.env);
  
  // Filter keys containing SUPABASE, URL, or KEY (safe — returns only names, not values)
  const supabaseKeys = envKeys.filter(
    (key) =>
      key.includes("SUPABASE") ||
      key.includes("URL") ||
      key.includes("KEY") ||
      key.includes("ANON")
  );

  return NextResponse.json({
    supabaseKeys,
    allKeysCount: envKeys.length,
    nodeEnv: process.env.NODE_ENV,
  });
}
