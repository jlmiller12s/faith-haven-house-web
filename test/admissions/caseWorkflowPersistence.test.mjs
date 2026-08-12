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

test("saved workflow notes can be read separately from their status change", async () => {
  const { getWorkflowStatusNote, stripWorkflowStatusNote } = await import(moduleUrl);
  const summary =
    "Case status changed from pre screen received to staff follow up. Reason / notes: Waiting on a safe callback time.";

  assert.equal(getWorkflowStatusNote(summary), "Waiting on a safe callback time.");
  assert.equal(
    stripWorkflowStatusNote(summary),
    "Case status changed from pre screen received to staff follow up.",
  );
  assert.equal(getWorkflowStatusNote("Case status changed from initial contact to closed."), "");
  assert.equal(
    stripWorkflowStatusNote("Case status changed from initial contact to closed."),
    "Case status changed from initial contact to closed.",
  );
});

test("deleting a workflow note preserves its status-change history", async () => {
  const { persistWorkflowStatusNoteDelete } = await import(moduleUrl);
  let updatedEventId;
  let updatedSummary;

  const result = await persistWorkflowStatusNoteDelete({
    eventId: "9f6a7a84-8d31-4d81-815a-e3275f9c4ba5",
    summary:
      "Case status changed from pre screen received to staff follow up. Reason / notes: Waiting on a safe callback time.",
    updateEvent: async (eventId, summary) => {
      updatedEventId = eventId;
      updatedSummary = summary;
      return { data: { id: eventId }, error: null };
    },
  });

  assert.equal(updatedEventId, "9f6a7a84-8d31-4d81-815a-e3275f9c4ba5");
  assert.equal(updatedSummary, "Case status changed from pre screen received to staff follow up.");
  assert.deepEqual(result, { success: true });
});

test("workflow note deletion reports update errors", async () => {
  const { persistWorkflowStatusNoteDelete } = await import(moduleUrl);
  const result = await persistWorkflowStatusNoteDelete({
    eventId: "9f6a7a84-8d31-4d81-815a-e3275f9c4ba5",
    summary: "Case status changed. Reason / notes: Follow up Friday.",
    updateEvent: async () => ({ data: null, error: { message: "permission denied" } }),
  });

  assert.deepEqual(result, {
    success: false,
    error: "Unable to delete the workflow note: permission denied",
  });
});

test("the workflow screen shows saved reason notes and deletion controls", async () => {
  const page = await readFile(
    new URL("../../app/staff/admissions/[caseId]/page.jsx", import.meta.url),
    "utf8",
  );

  assert.match(page, /Saved Reason \/ Notes/);
  assert.match(page, /workflowStatusNotes\.map/);
  assert.match(page, /Delete workflow note/);
  assert.match(page, /Confirm delete/);
});

test("the database limits workflow-note removal to the author or leadership", async () => {
  const migration = await readFile(
    new URL(
      "../../supabase/migrations/20260812140000_restrict_workflow_note_updates.sql",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(migration, /drop policy if exists activity_events_active_staff/i);
  assert.match(migration, /revoke update on public\.activity_events from authenticated/i);
  assert.match(migration, /grant update \(summary\) on public\.activity_events to authenticated/i);
  assert.match(migration, /actor_id in[\s\S]*auth\.uid\(\)/i);
  assert.match(migration, /super_admin[\s\S]*executive_director/i);
});
