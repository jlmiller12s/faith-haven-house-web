import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if production credentials are provided
export const isMockMode = !supabaseUrl || !supabaseAnonKey;

// Real Supabase client instance (or null in mock mode)
export const supabase = isMockMode 
  ? null 
  : createClient(supabaseUrl, supabaseAnonKey);

// =====================================================
// DEVELOPER PREVIEW / MOCK IN-MEMORY DATABASE SCHEMA
// =====================================================

const DEFAULT_DOCUMENT_TYPES = [
  { id: "doc-1", binderReference: "8.1", documentNumber: "FHH-INT-001", title: "Resident Intake Application", completedBy: "Applicant", sensitivity: "high" },
  { id: "doc-2", binderReference: "8.2", documentNumber: "FHH-INT-002", title: "Background Check Acknowledgment", completedBy: "Applicant", sensitivity: "high" },
  { id: "doc-3", binderReference: "8.3", documentNumber: "FHH-INT-003", title: "Authorization for Release of Information", completedBy: "Applicant", sensitivity: "high" },
  { id: "doc-4", binderReference: "8.4", documentNumber: "FHH-INT-004", title: "Drug & Alcohol Testing Consent", completedBy: "Applicant", sensitivity: "high" },
  { id: "doc-5", binderReference: "7.1", documentNumber: "FHH-ADM-001", title: "Admissions Interview Evaluation", completedBy: "Staff", sensitivity: "restricted" },
  { id: "doc-6", binderReference: "7.2", documentNumber: "FHH-ADM-002", title: "Behavioral Health Admission Readiness Assessment", completedBy: "Licensed Behavioral Health Professional", sensitivity: "clinical" },
  { id: "doc-7", binderReference: "7.3", documentNumber: "FHH-ADM-003", title: "Admissions Committee Decision Form", completedBy: "Admissions Committee", sensitivity: "restricted" },
  { id: "doc-8", binderReference: "7.4", documentNumber: "FHH-ADM-004", title: "Welcome Day Checklist", completedBy: "Faith Haven House Staff", sensitivity: "restricted" },
  { id: "doc-9", binderReference: "8.5", documentNumber: "FHH-COV-001", title: "Resident Covenant and Rules Agreement", completedBy: "Applicant & Staff", sensitivity: "restricted" },
  { id: "doc-10", binderReference: "8.6", documentNumber: "FHH-FIN-001", title: "Financial Snapshot & Net Worth Tracker", completedBy: "Applicant", sensitivity: "restricted" },
  { id: "doc-11", binderReference: "8.7", documentNumber: "FHH-ACC-001", title: "Resident Access Code Assignment Form", completedBy: "Staff", sensitivity: "restricted" }
];

const DEFAULT_STAFF = [
  { id: "staff-1", first_name: "Sarah", last_name: "Jenkins", email: "sarah.admin@faithhavenhouse.org", role: "super_admin", is_active: true },
  { id: "staff-2", first_name: "Dareth", last_name: "Jeffers", email: "dareth.director@faithhavenhouse.org", role: "executive_director", is_active: true },
  { id: "staff-3", first_name: "James", last_name: "Miller", email: "james.coordinator@faithhavenhouse.org", role: "admissions_coordinator", is_active: true },
  { id: "staff-4", first_name: "Alice", last_name: "Vance", email: "alice.interviewer@faithhavenhouse.org", role: "admissions_interviewer", is_active: true },
  { id: "staff-5", first_name: "Dr. Robert", last_name: "Carter", email: "robert.clinician@faithhavenhouse.org", role: "behavioral_health_clinician", is_active: true },
  { id: "staff-6", first_name: "Elena", last_name: "Rostova", email: "elena.committee@faithhavenhouse.org", role: "admissions_committee_member", is_active: true },
  { id: "staff-7", first_name: "Marcus", last_name: "Broadus", email: "marcus.manager@faithhavenhouse.org", role: "case_manager", is_active: true },
  { id: "staff-8", first_name: "Auditor", last_name: "Reviewer", email: "auditor@faithhavenhouse.org", role: "read_only_auditor", is_active: true }
];

const DEFAULT_APPLICANTS = [
  { id: "app-1", legal_first_name: "John", legal_last_name: "Doe", preferred_name: "Johnny", phone: "314-555-0192", email: "john.doe@example.com", preferred_contact_method: "phone", city: "St. Louis", county: "St. Louis County", referral_source: "St. Patrick Center", current_housing_situation: "Emergency Shelter", housing_urgency: "high", created_at: "2026-07-01T10:00:00Z" },
  { id: "app-2", legal_first_name: "Robert", legal_last_name: "Smith", preferred_name: "Bob", phone: "636-555-0283", email: "bob.smith@example.com", preferred_contact_method: "email", city: "St. Charles", county: "St. Charles County", referral_source: "Church Referral", current_housing_situation: "Car / Unsheltered", housing_urgency: "critical", created_at: "2026-06-25T11:30:00Z" },
  { id: "app-3", legal_first_name: "David", legal_last_name: "Johnson", preferred_name: "Dave", phone: "314-555-0374", email: "dave.j@example.com", preferred_contact_method: "text", city: "St. Peters", county: "St. Charles County", referral_source: "VA Outreach", current_housing_situation: "Temporary Doubled Up", housing_urgency: "medium", created_at: "2026-06-20T09:15:00Z" },
  { id: "app-4", legal_first_name: "Michael", legal_last_name: "Brown", preferred_name: "Mike", phone: "636-555-0465", email: "mike.brown@example.com", preferred_contact_method: "phone", city: "O'Fallon", county: "St. Charles County", referral_source: "Self Referral", current_housing_situation: "Transitional Housing", housing_urgency: "low", created_at: "2026-06-15T08:00:00Z" }
];

const DEFAULT_CASES = [
  { id: "case-1", caseNumber: "FHH-ADM-2026-0001", status: "pre_screen_received", applicantId: "app-1", assignedCoordinatorId: "staff-3", assignedInterviewerId: null, assignedClinicianId: null, createdAt: "2026-07-01T10:05:00Z", updatedAt: "2026-07-01T10:05:00Z", welcomeDayDate: null, admittedAt: null, closedAt: null, closedReasonCategory: null },
  { id: "case-2", caseNumber: "FHH-ADM-2026-0002", status: "admissions_interview_pending", applicantId: "app-2", assignedCoordinatorId: "staff-3", assignedInterviewerId: "staff-4", assignedClinicianId: null, createdAt: "2026-06-25T11:45:00Z", updatedAt: "2026-06-28T14:20:00Z", welcomeDayDate: null, admittedAt: null, closedAt: null, closedReasonCategory: null },
  { id: "case-3", caseNumber: "FHH-ADM-2026-0003", status: "committee_review_pending", applicantId: "app-3", assignedCoordinatorId: "staff-3", assignedInterviewerId: "staff-4", assignedClinicianId: "staff-5", createdAt: "2026-06-20T09:30:00Z", updatedAt: "2026-07-02T10:00:00Z", welcomeDayDate: null, admittedAt: null, closedAt: null, closedReasonCategory: null },
  { id: "case-4", caseNumber: "FHH-ADM-2026-0004", status: "welcome_day_scheduled", applicantId: "app-4", assignedCoordinatorId: "staff-3", assignedInterviewerId: "staff-4", assignedClinicianId: "staff-5", createdAt: "2026-06-15T08:15:00Z", updatedAt: "2026-07-05T16:00:00Z", welcomeDayDate: "2026-07-15T10:00:00Z", admittedAt: null, closedAt: null, closedReasonCategory: null }
];

const DEFAULT_PRESCREENS = [
  { id: "ps-1", applicant_id: "app-1", requested_supports: ["shelter", "employment"], primary_challenge: "Short-term financial shock and rent arrears.", six_to_twelve_month_goal: "Re-enter warehouse employment and rent an apartment.", structured_program_readiness: "Ready to cooperate with a case manager.", roadmap_readiness: "Highly interested in roadmap steps.", substance_free_environment_readiness: "Agrees fully to dry guidelines.", employment_status: "Unemployed", income_source: "None", has_government_id: "Yes", work_documents_status: "Complete", transportation_status: "Public Transit", immediate_support_flag: "No", support_organization_flag: "No", support_organization_contact_permission: "No", accommodation_request_preference: "None", additional_notes: "Referred by St. Patrick shelters.", submitted_at: "2026-07-01T10:00:00Z", source: "web", submission_ip_hash: "mock_hash_1", reviewed_at: null, reviewed_by: null }
];

const DEFAULT_DOCUMENTS = [
  // Case 2 files
  { id: "ad-1", admissions_case_id: "case-2", document_type_id: "doc-1", status: "complete", requested_at: "2026-06-26T09:00:00Z", submitted_at: "2026-06-27T10:00:00Z", reviewed_at: "2026-06-28T11:00:00Z", reviewed_by: "staff-3", file_path: "/docs/intake_app-2.pdf", file_name: "intake_app.pdf", file_mime_type: "application/pdf", file_size: 154200, expires_at: null, notes: "Complete and signed." },
  { id: "ad-2", admissions_case_id: "case-2", document_type_id: "doc-2", status: "requested", requested_at: "2026-06-26T09:00:00Z", submitted_at: null, reviewed_at: null, reviewed_by: null, file_path: null, file_name: null, file_mime_type: null, file_size: null, expires_at: null, notes: null },
  
  // Case 3 files (Complete required packets)
  { id: "ad-3", admissions_case_id: "case-3", document_type_id: "doc-1", status: "complete", requested_at: "2026-06-21T09:00:00Z", submitted_at: "2026-06-22T10:00:00Z", reviewed_at: "2026-06-23T11:00:00Z", reviewed_by: "staff-3", file_path: "/docs/intake_app-3.pdf", file_name: "intake_app.pdf", file_mime_type: "application/pdf", file_size: 215300, expires_at: null, notes: "Intake form is complete." },
  { id: "ad-4", admissions_case_id: "case-3", document_type_id: "doc-2", status: "complete", requested_at: "2026-06-21T09:00:00Z", submitted_at: "2026-06-22T11:00:00Z", reviewed_at: "2026-06-23T11:30:00Z", reviewed_by: "staff-3", file_path: "/docs/background_consent-3.pdf", file_name: "background_consent.pdf", file_mime_type: "application/pdf", file_size: 98100, expires_at: null, notes: "Background consent form received." },
  { id: "ad-5", admissions_case_id: "case-3", document_type_id: "doc-3", status: "complete", requested_at: "2026-06-21T09:00:00Z", submitted_at: "2026-06-22T11:15:00Z", reviewed_at: "2026-06-23T11:45:00Z", reviewed_by: "staff-3", file_path: "/docs/release_auth-3.pdf", file_name: "release_auth.pdf", file_mime_type: "application/pdf", file_size: 112000, expires_at: null, notes: "Release form received." },
  { id: "ad-6", admissions_case_id: "case-3", document_type_id: "doc-4", status: "complete", requested_at: "2026-06-21T09:00:00Z", submitted_at: "2026-06-22T11:30:00Z", reviewed_at: "2026-06-23T12:00:00Z", reviewed_by: "staff-3", file_path: "/docs/drug_consent-3.pdf", file_name: "drug_consent.pdf", file_mime_type: "application/pdf", file_size: 104500, expires_at: null, notes: "Consent form received." }
];

const DEFAULT_INTERVIEWS = [
  { id: "int-1", admissions_case_id: "case-3", interviewer_id: "staff-4", interview_date: "2026-06-28T10:00:00Z", duration_category: "45 minutes", motivation_summary: "Strong motivation to complete programs.", goals_summary: "Wants to gain commercial driver license (CDL).", strengths_observed: "Very polite, clear communicator, has steady part-time savings.", follow_up_concerns: "Needs transit arrangement to training site.", recommendation: "recommend_admission", completed_at: "2026-06-28T11:00:00Z" }
];

const DEFAULT_CLINICAL = [
  { id: "clin-1", admissions_case_id: "case-3", clinician_id: "staff-5", readiness_outcome: "appropriate_with_supports", recommended_supports: "Coordinate outpatient therapy sessions twice weekly.", restricted_document_id: null, reviewed_at: "2026-07-02T10:00:00Z" }
];

const DEFAULT_DECISIONS = [];

const DEFAULT_WELCOME = [
  { id: "wel-1", admissions_case_id: "case-4", resident_id: null, welcome_day_date: "2026-07-15T10:00:00Z", staff_member_id: "staff-3", room_assignment: "Room 102", admission_approved_confirmed: true, bedroom_prepared: true, entrance_access_created: true, resident_file_complete: true, identity_verified: true, covenant_signed: true, financial_snapshot_complete: true, emergency_contact_complete: true, access_code_assignment_complete: true, house_tour_complete: true, first_case_management_meeting_date: "2026-07-16T14:00:00Z", prayer_offered_if_desired: true, officially_admitted: false, completed_at: null, created_at: "2026-07-05T16:00:00Z", updated_at: "2026-07-05T16:00:00Z" }
];

const DEFAULT_TASKS = [
  { id: "t-1", admissions_case_id: "case-1", title: "Review pre-screen answers", description: "Verify eligibility guidelines match the shelter placement.", assigned_to: "staff-3", due_date: "2026-07-08T17:00:00Z", status: "todo", priority: "high", created_by: "staff-1", completed_at: null, created_at: "2026-07-01T10:05:00Z", updated_at: "2026-07-01T10:05:00Z" },
  { id: "t-2", admissions_case_id: "case-2", title: "Send request for Background Consent", description: "Follow up about missing forms.", assigned_to: "staff-3", due_date: "2026-07-06T17:00:00Z", status: "todo", priority: "medium", created_by: "staff-3", completed_at: null, created_at: "2026-06-28T14:20:00Z", updated_at: "2026-06-28T14:20:00Z" }
];

const DEFAULT_NOTES = [
  { id: "n-1", admissions_case_id: "case-2", author_id: "staff-3", visibility: "general_staff", content: "Spoke with Bob's brother. He confirms Bob wants to enter the program.", created_at: "2026-06-28T15:00:00Z", updated_at: "2026-06-28T15:00:00Z" },
  { id: "n-2", admissions_case_id: "case-3", author_id: "staff-5", visibility: "clinical_restricted", content: "Applicant maintains stable behavior. No signs of crisis during the clinical intake assessment.", created_at: "2026-07-02T10:15:00Z", updated_at: "2026-07-02T10:15:00Z" }
];

const DEFAULT_EVENTS = [
  { id: "e-1", admissions_case_id: "case-1", event_type: "pre_screen_received", title: "Pre-Screen Submission Received", summary: "Initial interest form submitted from web portal.", actor_id: null, created_at: "2026-07-01T10:00:00Z", visibility: "general_staff" },
  { id: "e-2", admissions_case_id: "case-2", event_type: "interview_scheduled", title: "Admissions Interview Assigned", summary: "Interviewer Alice Vance assigned to candidate.", actor_id: "staff-3", created_at: "2026-06-28T14:20:00Z", visibility: "general_staff" }
];

const DEFAULT_AUDIT = [
  { id: "au-1", actor_id: "staff-3", action: "applicant_record_viewed", entity_type: "applicant", entity_id: "app-2", admissions_case_id: "case-2", metadata_safe: { info: "Accessed Bob Smith's dashboard profile" }, ip_hash: "mock_hash_1", created_at: "2026-07-05T09:00:00Z" }
];

// Initialize global mock state if in developer/mock mode
if (isMockMode) {
  if (!global.mockDatabase) {
    global.mockDatabase = {
      documentTypes: [...DEFAULT_DOCUMENT_TYPES],
      staff: [...DEFAULT_STAFF],
      applicants: [...DEFAULT_APPLICANTS],
      cases: [...DEFAULT_CASES],
      prescreens: [...DEFAULT_PRESCREENS],
      documents: [...DEFAULT_DOCUMENTS],
      interviews: [...DEFAULT_INTERVIEWS],
      clinical: [...DEFAULT_CLINICAL],
      decisions: [...DEFAULT_DECISIONS],
      welcome: [...DEFAULT_WELCOME],
      tasks: [...DEFAULT_TASKS],
      notes: [...DEFAULT_NOTES],
      events: [...DEFAULT_EVENTS],
      audit: [...DEFAULT_AUDIT]
    };
  }
}

// Helper to access mock database safely
export function getMockDb() {
  if (!isMockMode) return null;
  return global.mockDatabase;
}
