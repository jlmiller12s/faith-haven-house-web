import test from "node:test";
import assert from "node:assert/strict";
import { mapAdmissionsCase } from "../../lib/crmRecordMappers.mjs";

test("maps a Supabase admissions case into the RAP UI model", () => {
  const row = {
    id: "case-id",
    case_number: "FHH-ADM-2026-000001",
    status: "pre_screen_received",
    applicant_id: "applicant-id",
    assigned_coordinator_id: "coordinator-id",
    assigned_interviewer_id: null,
    assigned_clinician_id: null,
    created_at: "2026-07-08T05:00:00Z",
    updated_at: "2026-07-08T05:01:00Z",
    welcome_day_date: null,
    admitted_at: null,
    closed_at: null,
    closed_reason_category: null,
  };

  assert.deepEqual(mapAdmissionsCase(row), {
    ...row,
    caseNumber: row.case_number,
    applicantId: row.applicant_id,
    assignedCoordinatorId: row.assigned_coordinator_id,
    assignedInterviewerId: null,
    assignedClinicianId: null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    welcomeDayDate: null,
    admittedAt: null,
    closedAt: null,
    closedReasonCategory: null,
  });
});
