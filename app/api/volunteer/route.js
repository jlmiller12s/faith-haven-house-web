import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { saveVolunteerApplication } from "@/lib/volunteer.mjs";

// Volunteer application intake.
// Persist applications to the protected staff volunteer inbox.
export async function POST(request) {
  try {
    const data = await request.json().catch(() => null);
    const result = await saveVolunteerApplication(data, createSupabaseAdminClient());
    return NextResponse.json({ ok: result.ok, error: result.error }, { status: result.status });
  } catch {
    console.error("[VOLUNTEER_SAVE_FAILED] Application persistence failed");
    return NextResponse.json({ ok: false, error: "We could not save your application. Please try again or call 636-697-3872." }, { status: 500 });
  }
}
