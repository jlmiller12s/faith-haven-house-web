import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const adminClient = createSupabaseAdminClient();
    
    // 1. Fetch all staff profiles
    const { data: profiles, error: profilesError } = await adminClient
      .from("staff_profiles")
      .select("*");
      
    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    // 2. Fetch auth users to see mapping
    // Note: auth schema queries require service role client
    const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers();

    return NextResponse.json({
      profiles,
      authUsers: authUsers?.users || null,
      authError: authError?.message || null
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
