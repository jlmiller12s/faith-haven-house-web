export function mapAdmissionsCase(row) {
  if (!row) return row;
  return {
    ...row,
    caseNumber: row.case_number,
    applicantId: row.applicant_id,
    assignedCoordinatorId: row.assigned_coordinator_id,
    assignedInterviewerId: row.assigned_interviewer_id,
    assignedClinicianId: row.assigned_clinician_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    welcomeDayDate: row.welcome_day_date,
    admittedAt: row.admitted_at,
    closedAt: row.closed_at,
    closedReasonCategory: row.closed_reason_category,
  };
}
