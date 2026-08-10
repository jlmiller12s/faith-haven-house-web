const yesNo = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const yesNoUnknown = [
  ...yesNo,
  { value: "unknown", label: "Unknown" },
  { value: "not_answered", label: "Applicant chose not to answer" },
];

const signatureFields = (subject = "Applicant") => [
  {
    id: "certification_confirmed",
    type: "checkbox",
    label: `I confirm that the ${subject.toLowerCase()} certification above is accurate.`,
    required: true,
  },
  { id: "signature_name", type: "text", label: `${subject} typed signature`, required: true },
  { id: "printed_name", type: "text", label: "Printed name", required: true },
  { id: "signature_date", type: "date", label: "Date signed", required: true },
];

const ratingChoices = ["Strong", "Good", "Fair", "Poor"].map((label) => ({
  value: label.toLowerCase(),
  label,
}));

const admissionsRoles = ["super_admin", "executive_director", "admissions_coordinator"];

const forms = [
  {
    id: "FHH-7.1",
    documentTypeId: "doc-5",
    number: "FHH-ADM-001",
    title: "Admissions Interview Evaluation",
    version: "1.0",
    completedBy: "Faith Haven House Admissions Interviewer",
    allowedRoles: [...admissionsRoles, "admissions_interviewer"],
    purpose: "Document the interviewer’s observations about motivation, readiness, program fit, and suitability for admission.",
    certification: "I certify that I personally conducted this interview and that this evaluation accurately reflects my observations and professional judgment.",
    sections: [
      { id: "applicant", title: "Applicant information", fields: [
        { id: "applicant_name", type: "text", label: "Applicant name", required: true, autoFill: "applicantName" },
        { id: "interview_date", type: "date", label: "Interview date", required: true },
        { id: "interviewer", type: "text", label: "Interviewer", required: true, autoFill: "staffName" },
        { id: "referral_source", type: "text", label: "Referral source" },
        { id: "interview_length", type: "select", label: "Length of interview", required: true, options: ["Under 30 minutes", "30–45 minutes", "45–60 minutes", "Over 60 minutes"].map((label) => ({ value: label, label })) },
      ] },
      { id: "summary", title: "Interview summary", fields: [
        { id: "why_fhh", type: "textarea", label: "Why does the applicant want to enter Faith Haven House?", required: true },
        { id: "why_now", type: "textarea", label: "Why is the applicant seeking help at this time?", required: true },
        { id: "goals", type: "textarea", label: "What does the applicant hope to accomplish in the program?", required: true },
      ] },
      { id: "evaluation", title: "Interviewer evaluation", description: "Rate each area based on the interview.", fields: [
        ...["Honesty and openness", "Personal accountability", "Motivation for change", "Willingness to follow program rules", "Ability to live in a shared environment", "Employment readiness", "Communication skills", "Overall program fit"].map((label, index) => ({ id: `rating_${index + 1}`, type: "select", label, required: true, options: ratingChoices })),
      ] },
      { id: "observations", title: "Observations", fields: [
        { id: "strengths_observed", type: "textarea", label: "Strengths observed", required: true },
        { id: "follow_up_concerns", type: "textarea", label: "Concerns or areas requiring follow-up" },
        { id: "recommendation", type: "select", label: "Interview recommendation", required: true, options: [
          ["admit", "Recommend admission"], ["conditions", "Recommend admission with conditions"], ["wait_list", "Recommend wait list"], ["defer", "Defer pending additional information"], ["decline", "Do not recommend admission"],
        ].map(([value, label]) => ({ value, label })) },
        { id: "recommendation_comments", type: "textarea", label: "Recommendation comments" },
      ] },
      { id: "certification", title: "Interviewer certification", fields: signatureFields("Interviewer") },
      { id: "committee_review", title: "Admissions Committee review", fields: [
        { id: "committee_reviewed", type: "select", label: "Interview evaluation reviewed", options: yesNo },
        { id: "committee_comments", type: "textarea", label: "Comments" },
        { id: "committee_reviewer", type: "text", label: "Reviewed by" },
        { id: "committee_review_date", type: "date", label: "Review date" },
      ] },
    ],
  },
  {
    id: "FHH-7.2",
    documentTypeId: "doc-6",
    number: "FHH-ADM-002",
    title: "Behavioral Health Admission Readiness Assessment",
    version: "1.0",
    completedBy: "Licensed Behavioral Health Professional",
    purpose: "Record the clinician’s professional opinion about current functioning, behavioral health readiness, and supports needed for program participation.",
    certification: "I certify that I personally completed this assessment and that it reflects my professional opinion based on the information available.",
    allowedRoles: ["super_admin", "behavioral_health_clinician"],
    sections: [
      { id: "clinician", title: "Clinician information", fields: [
        { id: "clinician_name", type: "text", label: "Clinician name", required: true, autoFill: "staffName" },
        { id: "professional_license", type: "text", label: "Professional license", required: true },
        { id: "license_number", type: "text", label: "License number", required: true },
        { id: "organization", type: "text", label: "Organization" },
        { id: "assessment_date", type: "date", label: "Assessment date", required: true },
        { id: "applicant_name", type: "text", label: "Applicant name", required: true, autoFill: "applicantName" },
        { id: "date_of_birth", type: "date", label: "Date of birth", required: true },
      ] },
      { id: "history", title: "Behavioral health history", fields: [
        { id: "previous_diagnosis", type: "select", label: "Previous behavioral health diagnosis reported?", required: true, options: yesNoUnknown },
        { id: "relevant_diagnoses", type: "textarea", label: "Diagnoses relevant to program participation" },
        { id: "current_treatment", type: "select", label: "Currently receiving behavioral health treatment?", required: true, options: yesNoUnknown },
        { id: "treatment_details", type: "textarea", label: "Current treatment details" },
        { id: "prescribed_medication", type: "select", label: "Currently prescribed behavioral health medication?", required: true, options: yesNoUnknown },
      ] },
      { id: "readiness", title: "Functional readiness", fields: [
        ...["Live in a shared residence", "Follow program expectations", "Participate in employment activities", "Participate in case management", "Manage conflict appropriately"].map((label, index) => ({ id: `readiness_${index + 1}`, type: "select", label, required: true, options: ["Yes", "With support", "No"].map((item) => ({ value: item.toLowerCase().replaceAll(" ", "_"), label: item })) })),
        { id: "covenant_readiness", type: "select", label: "Can understand and comply with the Resident Covenant?", required: true, options: ["Yes", "Yes, with support", "No"].map((label) => ({ value: label.toLowerCase().replaceAll(" ", "_"), label })) },
      ] },
      { id: "clinical", title: "Clinical summary", fields: [
        { id: "behavioral_health_concerns", type: "textarea", label: "Behavioral health concerns" },
        { id: "recommended_supports", type: "textarea", label: "Recommended supports", required: true },
        { id: "admission_recommendation", type: "select", label: "Admission recommendation", required: true, options: ["Appropriate for admission", "Appropriate with supports", "Defer pending additional treatment", "Recommend alternative level of care"].map((label) => ({ value: label, label })) },
        { id: "clinical_comments", type: "textarea", label: "Comments" },
      ] },
      { id: "certification", title: "Clinician certification", fields: signatureFields("Clinician") },
    ],
  },
  {
    id: "FHH-7.3",
    documentTypeId: "doc-7",
    number: "FHH-ADM-003",
    title: "Admissions Committee Decision Form",
    version: "1.0",
    completedBy: "Admissions Committee",
    allowedRoles: [...admissionsRoles, "admissions_committee_member"],
    purpose: "Record the committee’s review of the admissions file and final decision.",
    certification: "We confirm that the committee reviewed the applicant’s admissions file and accurately recorded its decision.",
    sections: [
      { id: "applicant", title: "Applicant information", fields: [
        { id: "applicant_name", type: "text", label: "Applicant name", required: true, autoFill: "applicantName" },
        { id: "committee_review_date", type: "date", label: "Committee review date", required: true },
      ] },
      { id: "documents", title: "Documents reviewed", fields: [
        ...["7.1 Admissions Interview Evaluation", "7.2 Behavioral Health Admission Readiness Assessment", "8.1 Resident Intake Application", "8.2 Background Check Acknowledgment", "Criminal Background Check Results", "8.3 Authorization for Release of Information", "8.4 Drug & Alcohol Testing Consent", "Drug Screen Results"].map((label, index) => ({ id: `document_reviewed_${index + 1}`, type: "checkbox", label })),
        { id: "other_documentation", type: "text", label: "Other supporting documentation" },
      ] },
      { id: "decision", title: "Committee decision", fields: [
        { id: "decision", type: "select", label: "Decision", required: true, options: ["Admit", "Admit with conditions", "Wait list", "Defer pending additional information or treatment", "Decline admission"].map((label) => ({ value: label, label })) },
        { id: "conditions", type: "textarea", label: "Conditions of admission" },
        { id: "comments", type: "textarea", label: "Committee comments" },
        { id: "committee_members", type: "textarea", label: "Committee members present", required: true },
      ] },
      { id: "approval", title: "Approval", fields: [
        { id: "committee_chair", type: "text", label: "Committee chair", required: true },
        { id: "executive_director", type: "text", label: "Executive director", required: true },
        ...signatureFields("Committee chair"),
      ] },
    ],
  },
  {
    id: "FHH-7.4",
    documentTypeId: "doc-8",
    number: "FHH-ADM-004",
    title: "Welcome Day Checklist",
    version: "1.0",
    completedBy: "Faith Haven House Staff",
    allowedRoles: [...admissionsRoles, "case_manager"],
    purpose: "Ensure every resident completes a consistent and orderly Welcome Day process before entering the program.",
    certification: "I certify that the Welcome Day process has been completed in accordance with Faith Haven House procedures.",
    sections: [
      { id: "resident", title: "Resident information", fields: [
        { id: "applicant_name", type: "text", label: "Resident name", required: true, autoFill: "applicantName" },
        { id: "welcome_day_date", type: "date", label: "Welcome Day date", required: true },
        { id: "staff_member", type: "text", label: "Staff member", required: true, autoFill: "staffName" },
        { id: "room_assignment", type: "text", label: "Room assignment", required: true },
      ] },
      ...[["pre_arrival", "Pre-arrival", ["Admission approved by Admissions Committee", "Welcome Day scheduled", "Bedroom prepared", "Front entrance access code created", "Resident file reviewed for completeness"]], ["welcome_day", "Welcome Day", ["Resident identity verified", "Resident Covenant and Rules Agreement signed", "Financial Snapshot completed", "Emergency Contact Form completed", "Resident Access Code Assignment completed", "Resident receives front entrance access code", "House tour completed", "Bedroom assigned", "Initial questions answered"]], ["final", "Final verification", ["Resident officially admitted", "Resident file complete", "Case Manager notified", "First case management meeting scheduled"]], ["closing", "Closing", ["Resident welcomed in prayer, if desired"]]].map(([id, title, items]) => ({ id, title, fields: items.map((label, index) => ({ id: `${id}_${index + 1}`, type: "checkbox", label })) })),
      { id: "certification", title: "Staff certification", fields: signatureFields("Staff member") },
    ],
  },
  {
    id: "FHH-8.1",
    documentTypeId: "doc-1",
    number: "FHH-INT-001",
    title: "Resident Intake Application",
    version: "1.1",
    completedBy: "Applicant",
    allowedRoles: [...admissionsRoles, "admissions_interviewer"],
    purpose: "Collect the information needed to establish the applicant’s resident file and support the admissions process.",
    certification: "I certify that the information provided is true and complete to the best of my knowledge. I understand that false or misleading information may result in denial of admission or dismissal.",
    sections: [
      { id: "applicant", title: "Applicant information", fields: [
        { id: "applicant_name", type: "text", label: "Legal name", required: true, autoFill: "applicantName" },
        { id: "preferred_name", type: "text", label: "Preferred name" },
        { id: "date_of_birth", type: "date", label: "Date of birth", required: true },
        { id: "social_security_number", type: "text", label: "Social Security number", required: true, sensitive: true, inputMode: "numeric" },
        { id: "state_id_number", type: "text", label: "Driver’s license / State ID number", required: true, sensitive: true },
        { id: "state_issued", type: "text", label: "State issued", required: true },
        { id: "phone", type: "tel", label: "Phone number", required: true },
        { id: "email", type: "email", label: "Email address" },
        { id: "contact_method", type: "select", label: "Preferred method of contact", required: true, options: ["Phone call", "Text message", "Email"].map((label) => ({ value: label, label })) },
        { id: "mailing_address", type: "textarea", label: "Current mailing address", required: true },
      ] },
      { id: "emergency", title: "Emergency contact", fields: [
        { id: "emergency_name", type: "text", label: "Emergency contact name", required: true },
        { id: "emergency_relationship", type: "text", label: "Relationship", required: true },
        { id: "emergency_phone", type: "tel", label: "Phone number", required: true },
        { id: "emergency_email", type: "email", label: "Email address" },
      ] },
      { id: "employment", title: "Employment information", fields: [
        { id: "employment_status", type: "select", label: "Current employment status", required: true, options: ["Full-time", "Part-time", "Self-employed", "Unemployed"].map((label) => ({ value: label, label })) },
        { id: "employer", type: "text", label: "Employer" },
        { id: "job_title", type: "text", label: "Job title" },
        { id: "employment_length", type: "text", label: "Length of employment" },
      ] },
      { id: "education", title: "Education and training", fields: [
        { id: "education_level", type: "select", label: "Highest level completed", required: true, options: ["Less than high school", "High school diploma / GED", "Trade school", "Some college", "Associate degree", "Bachelor’s degree", "Graduate degree"].map((label) => ({ value: label, label })) },
        { id: "certifications", type: "textarea", label: "Professional certifications or licenses" },
        { id: "military_service", type: "select", label: "Military service", required: true, options: yesNo },
        { id: "military_branch", type: "text", label: "Branch, if applicable" },
      ] },
      { id: "medical", title: "Medical information", description: "Only include information needed for safe admission and immediate support.", fields: [
        { id: "primary_care_provider", type: "text", label: "Primary care provider (optional)" },
        { id: "medical_insurance", type: "select", label: "Medical insurance", required: true, options: yesNo },
        { id: "insurance_provider", type: "text", label: "Insurance provider" },
        { id: "urgent_allergies", type: "textarea", label: "Allergies requiring immediate attention" },
        { id: "urgent_conditions", type: "textarea", label: "Medical conditions requiring immediate attention" },
      ] },
      { id: "faith", title: "Faith and community", fields: [
        { id: "current_church", type: "text", label: "Current church" },
        { id: "pastor", type: "text", label: "Pastor" },
        { id: "church_connection_help", type: "select", label: "Would you like help connecting with a local church?", options: yesNo },
      ] },
      { id: "certification", title: "Applicant certification", fields: signatureFields("Applicant") },
    ],
  },
  {
    id: "FHH-8.2",
    documentTypeId: "doc-2",
    number: "FHH-INT-002",
    title: "Background Check Acknowledgment",
    version: "1.1",
    completedBy: "Applicant",
    allowedRoles: [...admissionsRoles, "admissions_interviewer"],
    purpose: "Confirm that the applicant understands Faith Haven House’s background screening requirement.",
    certification: "I have read and understand each acknowledgment above.",
    sections: [
      { id: "acknowledgments", title: "Applicant acknowledgment", fields: [
        { id: "ack_background_required", type: "checkbox", label: "Faith Haven House requires all applicants to complete a criminal background screening through Checkr.", required: true },
        { id: "ack_checkr_disclosure", type: "checkbox", label: "I will receive a separate electronic disclosure and authorization directly from Checkr.", required: true },
        { id: "ack_before_committee", type: "checkbox", label: "I must complete the Checkr process before my application can be considered by the Admissions Committee.", required: true },
        { id: "ack_failure_close", type: "checkbox", label: "Failure to complete screening may result in my application being closed.", required: true },
        { id: "ack_individual_review", type: "checkbox", label: "A criminal record does not automatically disqualify me; each application is reviewed individually.", required: true },
      ] },
      { id: "certification", title: "Applicant certification", fields: [
        { id: "applicant_name", type: "text", label: "Applicant name", required: true, autoFill: "applicantName" },
        ...signatureFields("Applicant"),
      ] },
    ],
  },
  {
    id: "FHH-8.3",
    documentTypeId: "doc-3",
    number: "FHH-INT-003",
    title: "Authorization for Release of Information",
    version: "1.1",
    completedBy: "Applicant",
    allowedRoles: [...admissionsRoles, "admissions_interviewer"],
    purpose: "Authorize Faith Haven House to obtain or exchange information needed to evaluate the application and coordinate services.",
    certification: "I understand the purpose of this authorization and voluntarily authorize Faith Haven House to obtain or exchange the selected information for admissions and program purposes.",
    sections: [
      { id: "applicant", title: "Applicant information", fields: [
        { id: "applicant_name", type: "text", label: "Applicant name", required: true, autoFill: "applicantName" },
        { id: "date_of_birth", type: "date", label: "Date of birth", required: true },
      ] },
      { id: "authorization", title: "Authorized parties", description: "Select every party with whom Faith Haven House may obtain or exchange information.", fields: [
        ...["Employers", "Landlords or housing providers", "Healthcare providers", "Behavioral health professionals", "Case managers", "Social service agencies", "Churches or faith leaders", "Probation or parole officers", "Educational or training programs"].map((label, index) => ({ id: `authorization_${index + 1}`, type: "checkbox", label })),
        { id: "authorization_other", type: "text", label: "Other authorized party" },
        { id: "hipaa_notice", type: "checkbox", label: "I understand this does not replace authorizations required by HIPAA or other applicable law.", required: true },
      ] },
      { id: "certification", title: "Applicant certification", fields: signatureFields("Applicant") },
    ],
  },
  {
    id: "FHH-8.4",
    documentTypeId: "doc-4",
    number: "FHH-INT-004",
    title: "Drug and Alcohol Testing Consent",
    version: "1.1",
    completedBy: "Applicant",
    allowedRoles: [...admissionsRoles, "admissions_interviewer"],
    purpose: "Confirm the applicant’s understanding of and consent to drug and alcohol testing requirements.",
    certification: "I have read and understand this consent and voluntarily agree to the testing requirements described above.",
    sections: [
      { id: "applicant", title: "Applicant information", fields: [
        { id: "applicant_name", type: "text", label: "Applicant name", required: true, autoFill: "applicantName" },
        { id: "date_of_birth", type: "date", label: "Date of birth", required: true },
      ] },
      { id: "consent", title: "Applicant consent", fields: [
        { id: "consent_condition", type: "checkbox", label: "Drug and alcohol testing is a condition of admission.", required: true },
        { id: "consent_pre_admission", type: "checkbox", label: "I consent to drug and alcohol testing before admission.", required: true },
        { id: "consent_additional", type: "checkbox", label: "If admitted, I understand that additional testing may be required under the Resident Covenant and Rules Agreement.", required: true },
        { id: "consent_refusal", type: "checkbox", label: "Refusal to complete required testing may result in denial of admission or dismissal.", required: true },
        { id: "consent_results", type: "checkbox", label: "Faith Haven House may rely on testing results when making admissions and program decisions.", required: true },
      ] },
      { id: "certification", title: "Applicant certification", fields: signatureFields("Applicant") },
    ],
  },
];

export const ELECTRONIC_INTAKE_FORMS = forms.map((form) => ({
  ...form,
  fields: form.sections.flatMap((section) => section.fields.map((field) => ({ ...field, sectionId: section.id }))),
}));

export function getElectronicFormDefinition(formId) {
  return ELECTRONIC_INTAKE_FORMS.find((form) => form.id === formId) || null;
}

export function getElectronicFormByDocumentTypeId(documentTypeId) {
  return ELECTRONIC_INTAKE_FORMS.find((form) => form.documentTypeId === documentTypeId) || null;
}

export function canManageElectronicForm(form, role) {
  return Boolean(form && role && form.allowedRoles?.includes(role));
}

export function validateElectronicForm(formId, responses) {
  const form = getElectronicFormDefinition(formId);
  if (!form) return { success: false, errors: [{ field: "form", message: "Unknown form." }] };

  const errors = form.fields
    .filter((field) => field.required)
    .filter((field) => {
      const value = responses[field.id];
      return field.type === "checkbox" ? value !== true : String(value || "").trim() === "";
    })
    .map((field) => ({ field: field.id, message: `${field.label} is required.` }));

  return { success: errors.length === 0, errors };
}
