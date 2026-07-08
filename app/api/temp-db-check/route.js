import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const adminClient = createSupabaseAdminClient();
    
    // Upsert Jimmie's photographer email profile as Super Admin
    const { data: upsertData, error: upsertError } = await adminClient
      .from("staff_profiles")
      .upsert({
        id: "af096b9d-29c3-4857-9465-589f5a2cd41a", // unique UUID
        auth_user_id: "81051154-1b10-4a56-9b50-752a76b77c4e", // Jimmie's photographer auth ID
        first_name: "Jimmie",
        last_name: "Miller",
        email: "jimmiethephotographer@gmail.com",
        role: "super_admin",
        is_active: true,
        mfa_required: true
      });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    // Fetch all profiles to verify
    const { data: profiles } = await adminClient
      .from("staff_profiles")
      .select("*");

    return NextResponse.json({
      success: true,
      profiles
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
