import { NextResponse } from "next/server";

/**
 * POST /api/prescreen
 * Handles initial housing pre-screening form submissions.
 */
export async function POST(request) {
  try {
    const data = await request.json();

    // Basic server-side validation
    if (!data.fullName || !data.phone || !data.housingSituation) {
      return NextResponse.json(
        {
          success: false,
          status: "temporary_error",
          error: "Missing required contact or situation fields.",
        },
        { status: 400 }
      );
    }

    // =========================================================================
    // TODO: PRODUCTION FORM SUBMISSION INTEGRATION
    // Connect your production data destination here (e.g., SendGrid/Postmark
    // email alerts to faith.haven.house@gmail.com, database, or CRM).
    // Example:
    // await sendPrescreenNotificationEmail(data);
    // await db.insert(prescreenSubmissions).values(data);
    // =========================================================================

    const payloadSummary = {
      submittedAt: new Date().toISOString(),
      applicantName: data.fullName,
      preferredContact: data.contactMethod,
      housingSituation: data.housingSituation,
      timeframe: data.timeframe,
      status: "needs_follow_up",
    };

    console.log("[PRESCREEN_SUBMISSION_RECEIVED]", payloadSummary);

    return NextResponse.json({
      success: true,
      status: "submitted",
      message: "Pre-screening interest form received successfully.",
    });
  } catch (error) {
    console.error("[PRESCREEN_API_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        status: "temporary_error",
        error: "Internal server error processing pre-screening submission.",
      },
      { status: 500 }
    );
  }
}
