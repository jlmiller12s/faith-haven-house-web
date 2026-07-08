import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const adminClient = createSupabaseAdminClient();
    
    // Fetch all staff profiles
    const { data: profiles, error: profilesError } = await adminClient
      .from("staff_profiles")
      .select("*");
      
    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    // Fetch auth users
    const { data: authUsers } = await adminClient.auth.admin.listUsers();

    return NextResponse.json({
      profiles,
      authUsers: authUsers?.users || null
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
