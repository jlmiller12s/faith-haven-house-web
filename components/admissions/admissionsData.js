/**
 * Data structures and types for the Faith Haven House Admissions Workflow.
 */

// Step definition type structure for reference
// type AdmissionsStep = {
//   id: string;
//   number: number;
//   title: string;
//   shortTitle: string;
//   description: string;
//   category: "applicant" | "staff" | "clinical" | "committee";
//   visibility: "public";
//   icon: string;
//   detailLabel?: string;
//   notes?: string[];
// };

export const ADMISSIONS_STEPS = [
  {
    id: "initial-contact",
    number: 1,
    title: "Initial Contact",
    shortTitle: "Contact",
    description: "An inquiry is received by phone, email, website form, referral partner, church, family member, or community organization.",
    category: "applicant",
    visibility: "public",
    icon: "phone",
  },
  {
    id: "pre-screen",
    number: 2,
    title: "Applicant Pre-Screen",
    shortTitle: "Pre-Screen",
    description: "Faith Haven House reviews basic eligibility, immediate needs, and general fit for the program through an initial conversation or pre-screen form.",
    category: "applicant",
    visibility: "public",
    icon: "clipboard-check",
    notes: [
      "The public pre-screen is not the full application and should not request highly sensitive personal, medical, legal, or financial information."
    ]
  },
  {
    id: "admissions-docs",
    number: 3,
    title: "Complete Required Admissions Documents",
    shortTitle: "Required Documents",
    description: "After initial staff follow-up, applicants may be asked to complete required admissions documents through a secure process.",
    category: "applicant",
    visibility: "public",
    icon: "file-text",
    detailLabel: "Required documents may include:",
    notes: [
      "Resident Intake Application",
      "Background Check Acknowledgment",
      "Authorization for Release of Information",
      "Drug and Alcohol Testing Consent"
    ]
  },
  {
    id: "background-screen",
    number: 4,
    title: "Background Screening",
    shortTitle: "Background",
    description: "Applicants complete the required criminal background screening process through Faith Haven House’s designated screening provider.",
    category: "applicant",
    visibility: "public",
    icon: "shield-check",
    notes: [
      "A criminal record does not automatically disqualify an applicant. Applications are reviewed individually."
    ]
  },
  {
    id: "substance-screen",
    number: 5,
    title: "Drug and Alcohol Screening",
    shortTitle: "Sobriety Check",
    description: "Applicants complete required drug and alcohol testing as part of the admissions process and review the program’s sobriety expectations.",
    category: "applicant",
    visibility: "public",
    icon: "flask",
  },
  {
    id: "interview",
    number: 6,
    title: "Admissions Interview",
    shortTitle: "Interview",
    description: "A Faith Haven House admissions interviewer meets with the applicant to better understand motivation, readiness, accountability, goals, and overall fit for a structured living environment.",
    category: "staff",
    visibility: "public",
    icon: "message-circle",
  },
  {
    id: "readiness-review",
    number: 7,
    title: "Admissions Readiness Review",
    shortTitle: "Readiness",
    description: "When appropriate, a licensed behavioral health professional may provide an admissions-readiness assessment focused on an applicant’s current ability to participate safely and successfully in a structured community living environment.",
    category: "clinical",
    visibility: "public",
    icon: "heart-pulse",
    notes: [
      "This part of the process is handled privately and is not a public website form."
    ]
  },
  {
    id: "committee-review",
    number: 8,
    title: "Admissions Committee Review",
    shortTitle: "Committee Review",
    description: "The Admissions Committee reviews the completed admissions file and determines the appropriate next step.",
    category: "committee",
    visibility: "public",
    icon: "users",
    notes: [
      "Possible next steps may include admission, admission with conditions, a wait list, a request for additional information, or referral to another level of support."
    ]
  },
  {
    id: "welcome-scheduled",
    number: 9,
    title: "Welcome Day Scheduled",
    shortTitle: "Welcome Day Set",
    description: "If approved, Faith Haven House contacts the applicant to schedule Welcome Day and prepare for the transition into the program.",
    category: "staff",
    visibility: "public",
    icon: "calendar-check",
  }
];

export const WELCOME_DAY_STEPS = [
  {
    number: 1,
    title: "Welcome Day Checklist",
    description: "Staff confirms that admission has been approved, the resident’s file is complete, a room is prepared, and the initial arrival plan is ready."
  },
  {
    number: 2,
    title: "Resident Covenant and House Rules",
    description: "The resident reviews program expectations, house rules, shared-living responsibilities, and the commitment to a safe, structured environment.",
    notes: [
      "This references the Resident Covenant and Rules Agreement. The approved document is not yet available in the project files, so create only a placeholder integration point and do not invent its content."
    ]
  },
  {
    number: 3,
    title: "Financial Snapshot and Goal Planning",
    description: "The resident begins building a practical picture of current finances, goals, and the next steps toward greater stability.",
    notes: [
      "This references the Financial Snapshot and Net Worth Tracker. The approved document is not yet available in the project files, so create only a placeholder integration point and do not invent its content."
    ]
  },
  {
    number: 4,
    title: "Resident Access and House Orientation",
    description: "The resident receives house orientation, room assignment, necessary access information, and answers to initial questions.",
    notes: [
      "This references the Resident Access Code Assignment Form. The approved document is not yet available in the project files, so create only a placeholder integration point and do not expose access-code details publicly."
    ]
  },
  {
    number: 5,
    title: "Official Program Admission",
    description: "The resident is welcomed into Faith Haven House, connected to the program, and scheduled for the first case-management meeting."
  }
];

export const RESIDENT_EXPECTATIONS = [
  {
    title: "A Structured Environment",
    description: "Clear expectations, shared-residence guidelines, and a consistent routine.",
    icon: "home"
  },
  {
    title: "Personal Accountability",
    description: "A roadmap that supports responsibility, measurable goals, and steady progress.",
    icon: "trending-up"
  },
  {
    title: "Faith and Encouragement",
    description: "Opportunities for Bible study, prayer, encouragement, and connection.",
    icon: "sun"
  },
  {
    title: "Practical Support",
    description: "Support related to job readiness, financial literacy, resources, transportation planning, and housing readiness.",
    icon: "briefcase"
  },
  {
    title: "A Path Forward",
    description: "A focus on stability, independent living, stronger financial habits, and long-term homeownership pathways.",
    icon: "compass"
  }
];

export const ADMISSIONS_FAQS = [
  {
    id: "faq-1",
    question: "How long does the entire admissions process take?",
    answer: "The timeline depends on bed availability, interview scheduling, and document collection. Once a pre-screen is completed, our team typically follows up within 2 to 3 business days to discuss the next steps."
  },
  {
    id: "faq-2",
    question: "Does having a criminal record automatically disqualify me?",
    answer: "No. Faith Haven House reviews each application individually on a case-by-case basis. We focus on current safety, community living compatibility, and program readiness."
  },
  {
    id: "faq-3",
    question: "What items am I permitted to bring on Welcome Day?",
    answer: "Approved residents are allowed to bring limited personal clothing and basic toiletries. Storage space is limited, and all items undergo standard safety checks upon arrival."
  },
  {
    id: "faq-4",
    question: "Is there a program fee to live at Faith Haven House?",
    answer: "Resident program fees are designed to encourage saving habits. Details regarding structure and expectations are discussed privately during the Admissions Interview stage."
  }
];

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SECURE ADMISSIONS TYPES & MOCK DATA (Future Integration placeholders)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// type AdmissionsStatus =
//   | "initial_contact"
//   | "pre_screen_submitted"
//   | "staff_follow_up"
//   | "secure_documents_requested"
//   | "background_screening_pending"
//   | "drug_screening_pending"
//   | "admissions_interview_pending"
//   | "readiness_review_pending"
//   | "committee_review_pending"
//   | "welcome_day_scheduled"
//   | "admitted"
//   | "closed";

// type AdmissionsDocument = {
//   id: string;
//   binderReference: string;
//   title: string;
//   documentNumber: string;
//   completedBy: "Applicant" | "Staff" | "Licensed Behavioral Health Professional" | "Admissions Committee";
//   visibility: "secure";
//   status: "not_requested" | "requested" | "submitted" | "reviewed" | "complete";
// };

export const admissionsDocuments = [
  {
    id: "resident-intake-application",
    binderReference: "8.1",
    title: "Resident Intake Application",
    documentNumber: "FHH-INT-001",
    completedBy: "Applicant",
    visibility: "secure",
    status: "not_requested",
  },
  {
    id: "background-check-acknowledgment",
    binderReference: "8.2",
    title: "Background Check Acknowledgment",
    documentNumber: "FHH-INT-002",
    completedBy: "Applicant",
    visibility: "secure",
    status: "not_requested",
  },
  {
    id: "release-of-information",
    binderReference: "8.3",
    title: "Authorization for Release of Information",
    documentNumber: "FHH-INT-003",
    completedBy: "Applicant",
    visibility: "secure",
    status: "not_requested",
  },
  {
    id: "drug-and-alcohol-consent",
    binderReference: "8.4",
    title: "Drug & Alcohol Testing Consent",
    documentNumber: "FHH-INT-004",
    completedBy: "Applicant",
    visibility: "secure",
    status: "not_requested",
  },
  {
    id: "admissions-interview-evaluation",
    binderReference: "7.1",
    title: "Admissions Interview Evaluation",
    documentNumber: "FHH-ADM-001",
    completedBy: "Staff",
    visibility: "secure",
    status: "not_requested",
  },
  {
    id: "behavioral-health-readiness",
    binderReference: "7.2",
    title: "Behavioral Health Admission Readiness Assessment",
    documentNumber: "FHH-ADM-002",
    completedBy: "Licensed Behavioral Health Professional",
    visibility: "secure",
    status: "not_requested",
  },
  {
    id: "admissions-committee-decision",
    binderReference: "7.3",
    title: "Admissions Committee Decision Form",
    documentNumber: "FHH-ADM-003",
    completedBy: "Admissions Committee",
    visibility: "secure",
    status: "not_requested",
  },
  {
    id: "welcome-day-checklist",
    binderReference: "7.4",
    title: "Welcome Day Checklist",
    documentNumber: "FHH-ADM-004",
    completedBy: "Staff",
    visibility: "secure",
    status: "not_requested",
  }
];
