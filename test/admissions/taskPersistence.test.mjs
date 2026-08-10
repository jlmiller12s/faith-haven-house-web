import assert from "node:assert/strict";
import test from "node:test";

const moduleUrl = new URL("../../lib/taskPersistence.mjs", import.meta.url);

test("production task inserts let PostgreSQL generate the UUID", async () => {
  const { persistTask } = await import(moduleUrl);
  let insertedPayload;

  const result = await persistTask({
    task: {
      admissions_case_id: "31a60a30-cea9-4fc8-b7d1-a5c0f8d6230e",
      title: "Call applicant",
      description: "Confirm a safe callback time.",
      assigned_to: null,
      due_date: null,
      status: "todo",
      priority: "high",
      created_by: "e967f687-d8d8-4d8f-9d26-91c88238115f",
    },
    insertTask: async (payload) => {
      insertedPayload = payload;
      return { data: { id: "79bdcc53-442a-463c-813e-150880951629" }, error: null };
    },
  });

  assert.equal("id" in insertedPayload, false);
  assert.equal(result.success, true);
  assert.equal(result.taskId, "79bdcc53-442a-463c-813e-150880951629");
});

test("task insert errors are returned to the interface", async () => {
  const { persistTask } = await import(moduleUrl);
  const result = await persistTask({
    task: { title: "Call applicant" },
    insertTask: async () => ({ data: null, error: { message: "permission denied" } }),
  });

  assert.deepEqual(result, {
    success: false,
    error: "Unable to create the task: permission denied",
  });
});

test("task toggle reports update failures instead of claiming success", async () => {
  const { persistTaskToggle } = await import(moduleUrl);
  const result = await persistTaskToggle({
    task: { id: "task-1", status: "todo" },
    updateTask: async () => ({ data: null, error: { message: "row blocked" } }),
    now: () => "2026-08-10T15:00:00.000Z",
  });

  assert.deepEqual(result, {
    success: false,
    error: "Unable to update the task: row blocked",
  });
});

test("task toggle completes an open task with one consistent timestamp", async () => {
  const { persistTaskToggle } = await import(moduleUrl);
  let write;
  const result = await persistTaskToggle({
    task: { id: "task-1", status: "todo" },
    updateTask: async (_id, payload) => {
      write = payload;
      return { data: { id: "task-1", ...payload }, error: null };
    },
    now: () => "2026-08-10T15:00:00.000Z",
  });

  assert.deepEqual(write, {
    status: "completed",
    completed_at: "2026-08-10T15:00:00.000Z",
    updated_at: "2026-08-10T15:00:00.000Z",
  });
  assert.equal(result.success, true);
  assert.equal(result.status, "completed");
});

test("task toggle reopens a completed task and clears completion time", async () => {
  const { persistTaskToggle } = await import(moduleUrl);
  const result = await persistTaskToggle({
    task: { id: "task-1", status: "completed", completed_at: "earlier" },
    updateTask: async (_id, payload) => ({ data: null, error: null, payload }),
    now: () => "2026-08-10T16:00:00.000Z",
  });

  assert.equal(result.success, true);
  assert.equal(result.status, "todo");
  assert.equal(result.task.completed_at, null);
});
