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

// Staff list is empty in mock mode; use real Supabase in production
const DEFAULT_STAFF = [];

const DEFAULT_APPLICANTS = [];
const DEFAULT_CASES = [];
const DEFAULT_PRESCREENS = [];
const DEFAULT_DOCUMENTS = [];
const DEFAULT_INTERVIEWS = [];
const DEFAULT_CLINICAL = [];
const DEFAULT_DECISIONS = [];
const DEFAULT_WELCOME = [];
const DEFAULT_TASKS = [];
const DEFAULT_NOTES = [];
const DEFAULT_EVENTS = [];
const DEFAULT_AUDIT = [];

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
