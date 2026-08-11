import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const moduleUrl = new URL("../../lib/caseWorkflowPersistence.mjs", import.meta.url);

test("follow-up task choices match the standardized admissions workflow", async () => {
  const { FOLLOW_UP_TASK_TITLES } = await import(moduleUrl);

  assert.deepEqual(FOLLOW_UP_TASK_TITLES, [
    "Review Prescreen Answers",
    "Review Application",
    "Send Background Check Link",
    "Complete Clinical",
    "Interview",
    "Decide on Admittance",
    "Prepare for Welcome",
  ]);
});

test("note persistence lets PostgreSQL generate the UUID", async () => {
  const { persistCaseNote } = await import(moduleUrl);
  let insertedPayload;

  const result = await persistCaseNote({
    note: {
      id: "n-invalid-for-uuid-column",
      admissions_case_id: "31a60a30-cea9-4fc8-b7d1-a5c0f8d6230e",
      author_id: "e967f687-d8d8-4d8f-9d26-91c88238115f",
      visibility: "general_staff",
      content: "Applicant called back.",
    },
    insertNote: async (payload) => {
      insertedPayload = payload;
      return { data: { id: "79bdcc53-442a-463c-813e-150880951629" }, error: null };
    },
  });

  assert.equal("id" in insertedPayload, false);
  assert.deepEqual(result, {
    success: true,
    noteId: "79bdcc53-442a-463c-813e-150880951629",
  });
});

test("note persistence returns database errors instead of false success", async () => {
  const { persistCaseNote } = await import(moduleUrl);
  const result = await persistCaseNote({
    note: { content: "Applicant called back." },
    insertNote: async () => ({ data: null, error: { message: "permission denied" } }),
  });

  assert.deepEqual(result, {
    success: false,
    error: "Unable to save the note: permission denied",
  });
});

test("status history includes the staff-entered reason", async () => {
  const { buildStatusActivitySummary } = await import(moduleUrl);

  assert.equal(
    buildStatusActivitySummary({
      oldStatus: "pre_screen_received",
      nextStatus: "staff_follow_up",
      reason: "Waiting on a safe callback time.",
    }),
    "Case status changed from pre screen received to staff follow up. Reason / notes: Waiting on a safe callback time.",
  );
});

test("status history remains readable when no reason is entered", async () => {
  const { buildStatusActivitySummary } = await import(moduleUrl);

  assert.equal(
    buildStatusActivitySummary({
      oldStatus: "pre_screen_received",
      nextStatus: "staff_follow_up",
      reason: "   ",
    }),
    "Case status changed from pre screen received to staff follow up.",
  );
});

test("the workflow screen shows the latest saved status update", async () => {
  const page = await readFile(
    new URL("../../app/staff/admissions/[caseId]/page.jsx", import.meta.url),
    "utf8",
  );

  assert.match(page, /Latest Saved Workflow Update/);
  assert.match(page, /latestStatusEvent\.summary/);
});
