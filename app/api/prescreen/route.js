import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { validatePrescreen } from "@/lib/prescreen/validation.mjs";
import {
  buildConfirmationEmail,
  sendConfirmationEmail,
} from "@/lib/prescreen/email.mjs";
import { submitPrescreen } from "@/lib/prescreen/submission.mjs";

const safeError = (message, status) =>
  NextResponse.json(
    { success: false, status: "temporary_error", error: message },
    { status }
  );

/**
 * POST /api/prescreen
 * Persists one complete public pre-screen admission, then sends confirmation.
 */
export async function POST(request) {
  try {
    let input;
    try {
      input = await request.json();
    } catch {
      return safeError("The submitted form could not be read.", 400);
    }

    const validation = validatePrescreen(input);
    if (!validation.ok) {
      return safeError(validation.error, 400);
    }

    const payload = validation.value;
    const adminClient = createSupabaseAdminClient();

    const createAdmission = async (normalizedPayload) => {
      const { data, error } = await adminClient.rpc(
        "create_prescreen_admission",
        { p_payload: normalizedPayload }
      );

      if (error) {
        throw new Error(`Admission transaction failed: ${error.message}`);
      }

      const admission = Array.isArray(data) ? data[0] : data;
      if (!admission?.case_id || !admission?.case_number) {
        throw new Error("Admission transaction returned no case reference.");
      }
      return admission;
    };

    const sendEmail = async ({ admission, payload: emailPayload, idempotencyKey }) => {
      const senderEmail = process.env.RESEND_FROM_EMAIL;
      const replyTo = process.env.PRESCREEN_REPLY_TO;
      if (!senderEmail || !replyTo) {
        throw new Error("Confirmation email sender is not configured.");
      }

      const message = buildConfirmationEmail({
        to: emailPayload.email,
        from: `Faith Haven House Admissions <${senderEmail}>`,
        replyTo,
        firstName: admission.first_name,
        caseNumber: admission.case_number,
        contactMethod: emailPayload.contactMethod,
      });

      return sendConfirmationEmail({
        apiKey: process.env.RESEND_API_KEY,
        idempotencyKey,
        message,
      });
    };

    const result = await submitPrescreen({ payload, createAdmission, sendEmail });

    console.log("[PRESCREEN_SUBMITTED]", {
      caseId: result.caseId,
      caseNumber: result.caseNumber,
      emailStatus: result.emailStatus,
    });

    return NextResponse.json(
      {
        success: true,
        status: "submitted",
        message: "Your pre-screen was received and saved.",
        ...result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[PRESCREEN_API_ERROR]", {
      message: error instanceof Error ? error.message : "Unknown submission error",
    });
    return safeError(
      "We could not save your pre-screen right now. Please try again or call 636-577-5876.",
      500
    );
  }
}
