import { NextResponse } from "next/server";
import { isMockMode, getMockDb, supabase } from "@/lib/supabase";
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
      const { data: matches } = await supabase
        .from("applicants")
        .select("id")
        .or(`email.eq.${data.email},phone.eq.${data.phone}`);
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
        await supabase.from("applicants").insert(newApplicant);
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
      await supabase.from("admissions_cases").insert({
        id: caseId,
        case_number: caseNumber,
        status: "pre_screen_received",
        applicant_id: applicantId,
        assigned_coordinator_id: "staff-3"
      });
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
      await supabase.from("prescreen_submissions").insert(newPrescreen);
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
    });

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
      await supabase.from("tasks").insert(newTask);
    }

    // 7. Audit Logging (Secure, generic details)
    await logAuditEvent({
      actorId: "staff-3", // Coordinator auto actor
      action: "applicant_record_created",
      entityType: "admissions_case",
      entityId: caseId,
      caseId,
      metadata: { source: "web_portal", isDuplicateMatch: duplicateFlag }
    });

    // 8. Safe notification log alert (no PII leaked)
    console.log("[CRM_NOTIFICATION_ALERT] A new pre-screen submission is ready for coordinator review.");

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
        error: "Internal server error processing pre-screening submission.",
      },
      { status: 500 }
    );
  }
}
