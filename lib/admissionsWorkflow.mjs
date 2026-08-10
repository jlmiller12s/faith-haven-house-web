export const ADMISSIONS_STAGES = [
  { id: "pre_screen", label: "Pre-screen", status: "pre_screen_received" },
  { id: "background_check", label: "Background check", status: "background_screening_pending" },
  { id: "interview", label: "Interview & intake", status: "admissions_interview_pending" },
  { id: "committee", label: "Committee review", status: "committee_review_pending" },
  { id: "welcome_day", label: "Welcome Day", status: "welcome_day_scheduled" },
  { id: "admitted", label: "Admitted", status: "admitted" },
  { id: "closed", label: "Closed", status: "closed" },
];

const STATUS_STAGE = {
  initial_contact: "pre_screen",
  pre_screen_received: "pre_screen",
  staff_follow_up: "pre_screen",
  secure_documents_requested: "interview",
  documents_in_progress: "interview",
  background_screening_pending: "background_check",
  admissions_interview_pending: "interview",
  behavioral_health_review_pending: "interview",
  committee_review_pending: "committee",
  approved: "welcome_day",
  approved_with_conditions: "welcome_day",
  wait_list: "committee",
  deferred: "committee",
  welcome_day_scheduled: "welcome_day",
  admitted: "admitted",
  closed: "closed",
};

export function stageForStatus(status) {
  return STATUS_STAGE[status] || "pre_screen";
}

export function statusForStage(stageId) {
  return ADMISSIONS_STAGES.find((stage) => stage.id === stageId)?.status || "pre_screen_received";
}

export function buildScreeningPayload({ caseId, screeningType, answer, actorId, now }) {
  const completed = answer === "yes";
  return {
    admissions_case_id: caseId,
    screening_type: screeningType,
    status: completed ? "completed" : "pending",
    completed_at: completed ? now : null,
    reviewed_at: completed ? now : null,
    reviewed_by: completed ? actorId : null,
  };
}

export function screeningAnswer(screenings, screeningType) {
  const screening = (screenings || []).find((item) => item.screening_type === screeningType);
  return screening && ["completed", "passed", "reviewed"].includes(screening.status) ? "yes" : "no";
}

