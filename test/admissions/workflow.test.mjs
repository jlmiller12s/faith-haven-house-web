import assert from "node:assert/strict";
import test from "node:test";

const moduleUrl = new URL("../../lib/admissionsWorkflow.mjs", import.meta.url);

test("the admissions board uses clear resident-centered stages", async () => {
  const { ADMISSIONS_STAGES } = await import(moduleUrl);
  assert.deepEqual(
    ADMISSIONS_STAGES.map(({ id, label }) => ({ id, label })),
    [
      { id: "pre_screen", label: "Pre-screen" },
      { id: "background_check", label: "Background check" },
      { id: "interview", label: "Interview & intake" },
      { id: "committee", label: "Committee review" },
      { id: "welcome_day", label: "Welcome Day" },
      { id: "admitted", label: "Admitted" },
      { id: "closed", label: "Closed" },
    ],
  );
});

test("database statuses map to the correct board stage", async () => {
  const { stageForStatus } = await import(moduleUrl);
  assert.equal(stageForStatus("pre_screen_received"), "pre_screen");
  assert.equal(stageForStatus("background_screening_pending"), "background_check");
  assert.equal(stageForStatus("documents_in_progress"), "interview");
  assert.equal(stageForStatus("committee_review_pending"), "committee");
  assert.equal(stageForStatus("approved_with_conditions"), "welcome_day");
  assert.equal(stageForStatus("admitted"), "admitted");
  assert.equal(stageForStatus("closed"), "closed");
});

test("dropping a card chooses the canonical status for that stage", async () => {
  const { statusForStage } = await import(moduleUrl);
  assert.equal(statusForStage("background_check"), "background_screening_pending");
  assert.equal(statusForStage("interview"), "admissions_interview_pending");
  assert.equal(statusForStage("welcome_day"), "welcome_day_scheduled");
});

test("yes and no screening controls produce explicit screening records", async () => {
  const { buildScreeningPayload } = await import(moduleUrl);
  assert.deepEqual(
    buildScreeningPayload({
      caseId: "case-1",
      screeningType: "background_check",
      answer: "yes",
      actorId: "staff-1",
      now: "2026-08-10T15:00:00.000Z",
    }),
    {
      admissions_case_id: "case-1",
      screening_type: "background_check",
      status: "completed",
      completed_at: "2026-08-10T15:00:00.000Z",
      reviewed_at: "2026-08-10T15:00:00.000Z",
      reviewed_by: "staff-1",
    },
  );

  assert.deepEqual(
    buildScreeningPayload({
      caseId: "case-1",
      screeningType: "background_check",
      answer: "no",
      actorId: "staff-1",
      now: "2026-08-10T15:00:00.000Z",
    }),
    {
      admissions_case_id: "case-1",
      screening_type: "background_check",
      status: "pending",
      completed_at: null,
      reviewed_at: null,
      reviewed_by: null,
    },
  );
});

test("workflow helpers use safe fallbacks for unknown data", async () => {
  const { screeningAnswer, stageForStatus, statusForStage } = await import(moduleUrl);
  assert.equal(stageForStatus("future_status"), "pre_screen");
  assert.equal(statusForStage("future_stage"), "pre_screen_received");
  assert.equal(screeningAnswer(null, "background_check"), "no");
  assert.equal(screeningAnswer([{ screening_type: "background_check", status: "passed" }], "background_check"), "yes");
});
