import { NextResponse } from "next/server";

// Volunteer application intake.
// TODO (Week 2): wire to email delivery (e.g., Resend) or a secure inbox
// per project guardrails — submissions must route to a monitored, secure destination.
export async function POST(request) {
  try {
    const data = await request.json();

    if (!data.firstname || !data.lastname || !data.email) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    console.log("[volunteer application]", JSON.stringify(data));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}
