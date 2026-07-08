import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ loggedIn: false });
    }

    const { data: profile } = await supabase
      .from("staff_profiles")
      .select("*")
      .eq("auth_user_id", user.id)
      .single();

    return NextResponse.json({
      loggedIn: true,
      user,
      profile
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
