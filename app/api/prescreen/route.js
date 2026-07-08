import { NextResponse } from "next/server";
import { isMockMode, getMockDb, supabase } from "@/lib/supabase";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAuditEvent, logActivityEvent } from "@/lib/crmService";

/**
 * POST /api/prescreen
 * Handles initial housing pre-screening form submissions and integrates with the CRM.
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

    // Split name
    const nameParts = data.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "Unknown";
    const lastName = nameParts.slice(1).join(" ") || "Applicant";

    const adminClient = isMockMode ? null : createSupabaseAdminClient();

    // 1. Duplicate detection
    let matchedApplicantId = null;
    let duplicateFlag = false;

    if (isMockMode) {
      const db = getMockDb();
      const match = db.applicants.find(a => 
        a.email.toLowerCase() === data.email?.toLowerCase() ||
        a.phone.replace(/\D/g, "") === data.phone.replace(/\D/g, "")
      );
      if (match) {
        matchedApplicantId = match.id;
        duplicateFlag = true;
      }
    } else {
      const { data: matches, error: matchError } = await adminClient
        .from("applicants")
        .select("id")
        .or(`email.eq.${data.email},phone.eq.${data.phone}`);
      
      if (matchError) {
        throw new Error(`Duplicate check query failed: ${matchError.message}`);
      }

      if (matches && matches.length > 0) {
        matchedApplicantId = matches[0].id;
        duplicateFlag = true;
      }
    }

    // 2. Create applicant profile if not exists
    let applicantId = matchedApplicantId;
    if (!applicantId) {
      applicantId = `app-${Math.random().toString(36).substr(2, 9)}`;
      const newApplicant = {
        id: applicantId,
        legal_first_name: firstName,
        legal_last_name: lastName,
        preferred_name: data.preferredName || "",
        phone: data.phone,
        email: data.email || "no-email@example.com",
        preferred_contact_method: data.contactMethod || "phone",
        city: data.city || "",
        county: data.county || "",
        referral_source: data.referralSource || "",
        current_housing_situation: data.housingSituation,
        housing_urgency: data.urgency || "medium",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (isMockMode) {
        getMockDb().applicants.push(newApplicant);
      } else {
        const { error: applicantError } = await adminClient.from("applicants").insert(newApplicant);
        if (applicantError) {
          throw new Error(`Failed to insert applicant: ${applicantError.message}`);
        }
      }
    }

    // 3. Create Admissions Case
    const caseId = `case-${Math.random().toString(36).substr(2, 9)}`;
    const caseNumber = `FHH-ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCase = {
      id: caseId,
      caseNumber,
      status: "pre_screen_received",
      applicantId: applicantId,
      assignedCoordinatorId: "staff-3", // Auto assigned to james coordinator
      assignedInterviewerId: null,
      assignedClinicianId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      welcomeDayDate: null,
      admittedAt: null,
      closedAt: null,
      closedReasonCategory: null
    };

    if (isMockMode) {
      getMockDb().cases.push(newCase);
    } else {
      const { error: caseError } = await adminClient.from("admissions_cases").insert({
        id: caseId,
        case_number: caseNumber,
        status: "pre_screen_received",
        applicant_id: applicantId,
        assigned_coordinator_id: "staff-3"
      });
      if (caseError) {
        throw new Error(`Failed to insert admissions case: ${caseError.message}`);
      }
    }

    // 4. Save pre-screen submissions answers
    const prescreenId = `ps-${Math.random().toString(36).substr(2, 9)}`;
    const newPrescreen = {
      id: prescreenId,
      applicant_id: applicantId,
      requested_supports: data.supports || [],
      primary_challenge: data.primaryChallenge || "",
      six_to_twelve_month_goal: data.goals || "",
      structured_program_readiness: data.programFitReadiness || "Yes",
      roadmap_readiness: data.roadmapInterest || "Yes",
      substance_free_environment_readiness: data.sobrietyCommitment || "Yes",
      employment_status: data.employmentStatus || "",
      income_source: data.incomeSource || "",
      has_government_id: data.hasId || "Yes",
      work_documents_status: "Pending",
      transportation_status: data.transportation || "",
      immediate_support_flag: data.immediateNeed || "No",
      support_organization_flag: "No",
      support_organization_contact_permission: "No",
      accommodation_request_preference: "None",
      additional_notes: duplicateFlag ? "Possible duplicate flagged during web submission." : "",
      submitted_at: new Date().toISOString(),
      source: "web",
      submission_ip_hash: "salted_hash_dummy",
      reviewed_at: null,
      reviewed_by: null
    };

    if (isMockMode) {
      getMockDb().prescreens.push(newPrescreen);
    } else {
      const { error: prescreenError } = await adminClient.from("prescreen_submissions").insert(newPrescreen);
      if (prescreenError) {
        throw new Error(`Failed to insert prescreen submission: ${prescreenError.message}`);
      }
    }

    // 5. Create timeline activity event
    await logActivityEvent({
      caseId,
      eventType: "pre_screen_received",
      title: "Pre-Screen Submission Received",
      summary: duplicateFlag 
        ? "Initial pre-screen interest form received. System flagged possible duplicate applicant file for coordinator review."
        : "Initial pre-screen interest form received via public website portal.",
      actorId: null
    }, adminClient);

    // 6. Create default coordinator follow-up task
    const taskId = `t-${Math.random().toString(36).substr(2, 9)}`;
    const newTask = {
      id: taskId,
      admissions_case_id: caseId,
      title: "Review pre-screen answers",
      description: "Review answers from public pre-screen form, complete duplicate verification checks, and initiate staff contact.",
      assigned_to: "staff-3", // Coordinator
      due_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours out
      status: "todo",
      priority: "high",
      created_by: "staff-3",
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isMockMode) {
      getMockDb().tasks.push(newTask);
    } else {
      const { error: taskError } = await adminClient.from("tasks").insert(newTask);
      if (taskError) {
        throw new Error(`Failed to insert coordinator follow-up task: ${taskError.message}`);
      }
    }

    // 7. Audit Logging (Secure, generic details)
    await logAuditEvent({
      actorId: "staff-3", // Coordinator auto actor
      action: "applicant_record_created",
      entityType: "admissions_case",
      entityId: caseId,
      caseId,
      metadata: { source: "web_portal", isDuplicateMatch: duplicateFlag }
    }, adminClient);

    // 8. Safe notification log alert (no PII leaked)
    console.log("[CRM_NOTIFICATION_ALERT] A new pre-screen submission is ready for coordinator review.");

    // 9. Send confirmation email to potential occupant via Resend if email is provided and Resend API Key is set
    if (data.email && process.env.RESEND_API_KEY) {
      try {
        const sender = process.env.RESEND_SENDER_EMAIL || "onboarding@resend.dev";
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: `Faith Haven House <${sender}>`,
            to: data.email.trim(),
            subject: "We Received Your Pre-Screening Information - Faith Haven House",
            html: `
              <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #222222; background-color: #FAF8EF; border: 1px solid #EDE8D0; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h2 style="color: #173247; font-family: Georgia, serif; margin-bottom: 5px;">Faith Haven House</h2>
                  <p style="font-size: 0.85rem; color: #5E7890; margin-top: 0; letter-spacing: 0.05em; text-transform: uppercase;">Resident Admissions Portal</p>
                </div>
                
                <p>Dear ${firstName},</p>
                
                <p>Thank you for submitting your initial interest and housing pre-screening form to Faith Haven House. We have successfully received your information and created a secure admissions folder for you.</p>
                
                <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #EDE8D0; margin: 20px 0;">
                  <p style="margin: 0 0 8px; font-size: 0.9rem; color: #5E7890; text-transform: uppercase; font-weight: bold; letter-spacing: 0.03em;">Your Reference ID</p>
                  <p style="margin: 0; font-size: 1.2rem; color: #173247; font-weight: bold; font-family: monospace;">${caseNumber}</p>
                </div>
                
                <h3 style="color: #173247; font-family: Georgia, serif; border-bottom: 1px solid #EDE8D0; padding-bottom: 5px;">What Happens Next?</h3>
                <ol style="padding-left: 20px; line-height: 1.6;">
                  <li style="margin-bottom: 10px;"><strong>Application Review:</strong> Our admissions team will review your pre-screening details to determine if our structured, faith-centered transitional living program is a good fit for your support goals.</li>
                  <li style="margin-bottom: 10px;"><strong>Staff Outreach:</strong> If your initial profile is a potential fit, a coordinator will reach out to you using your preferred contact method (<strong>${data.contactMethod || "phone"}</strong>) to walk you through the secure admissions documents.</li>
                </ol>
                
                <div style="background-color: #FFF9E6; border-left: 4px solid #F39C12; padding: 12px; font-size: 0.9rem; margin: 20px 0; color: #7F8C8D;">
                  <strong>Note:</strong> Completing this form does not guarantee placement. All admissions are subject to space availability and committee review.
                </div>
                
                <p style="margin-top: 30px;">If you have any questions or need to update your contact information, please call us directly at <strong>636-577-5876</strong>.</p>
                
                <hr style="border: 0; border-top: 1px solid #EDE8D0; margin: 30px 0;" />
                
                <p style="font-size: 0.8rem; color: #7F8C8D; text-align: center; margin: 0;">
                  Faith Haven House · Admissions Office<br />
                  St. Charles County, Missouri · 636-577-5876
                </p>
              </div>
            `,
          }),
        });

        if (!emailResponse.ok) {
          const errText = await emailResponse.text();
          console.error("[PRESCREEN_EMAIL_ERROR]", errText);
        } else {
          console.log("[PRESCREEN_EMAIL_SUCCESS] Confirmation email sent to", data.email);
        }
      } catch (err) {
        console.error("[PRESCREEN_EMAIL_SEND_EXCEPTION]", err);
      }
    }

    return NextResponse.json({
      success: true,
      status: "submitted",
      message: "Pre-screening interest form received successfully and admissions case folder created.",
      caseNumber
    });
  } catch (error) {
    console.error("[PRESCREEN_API_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        status: "temporary_error",
        error: error?.message || "Internal server error processing pre-screening submission.",
      },
      { status: 500 }
    );
  }
}
