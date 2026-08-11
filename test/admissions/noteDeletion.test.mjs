import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const persistenceModuleUrl = new URL("../../lib/caseWorkflowPersistence.mjs", import.meta.url);

test("note deletion returns the deleted note for safe activity logging", async () => {
  const { persistCaseNoteDelete } = await import(persistenceModuleUrl);
  const deletedNote = {
    id: "79bdcc53-442a-463c-813e-150880951629",
    admissions_case_id: "31a60a30-cea9-4fc8-b7d1-a5c0f8d6230e",
    visibility: "general_staff",
  };
  let deletedId;

  const result = await persistCaseNoteDelete({
    noteId: deletedNote.id,
    deleteNote: async (noteId) => {
      deletedId = noteId;
      return { data: deletedNote, error: null };
    },
  });

  assert.equal(deletedId, deletedNote.id);
  assert.deepEqual(result, { success: true, note: deletedNote });
});

test("note deletion reports database errors instead of removing the note from the screen", async () => {
  const { persistCaseNoteDelete } = await import(persistenceModuleUrl);

  const result = await persistCaseNoteDelete({
    noteId: "79bdcc53-442a-463c-813e-150880951629",
    deleteNote: async () => ({ data: null, error: { message: "permission denied" } }),
  });

  assert.deepEqual(result, {
    success: false,
    error: "Unable to delete the note: permission denied",
  });
});

test("note deletion reports when no authorized note was deleted", async () => {
  const { persistCaseNoteDelete } = await import(persistenceModuleUrl);

  const result = await persistCaseNoteDelete({
    noteId: "79bdcc53-442a-463c-813e-150880951629",
    deleteNote: async () => ({ data: null, error: null }),
  });

  assert.deepEqual(result, {
    success: false,
    error: "The note was not found or you do not have permission to delete it.",
  });
});

test("the notes screen requires confirmation before deletion", async () => {
  const page = await readFile(
    new URL("../../app/staff/admissions/[caseId]/page.jsx", import.meta.url),
    "utf8",
  );

  assert.match(page, /Delete note/);
  assert.match(page, /Confirm delete/);
  assert.match(page, /note\.author_id === activeStaff\?\.id/);
  assert.match(page, /\["super_admin", "executive_director"\]/);
});

test("the database removes broad note deletion and limits it to authors or leadership", async () => {
  const migration = await readFile(
    new URL("../../supabase/migrations/20260811180000_restrict_note_deletion.sql", import.meta.url),
    "utf8",
  );

  assert.match(migration, /drop policy if exists notes_active_staff on public\.notes/i);
  assert.match(migration, /for delete/i);
  assert.match(migration, /author_id/i);
  assert.match(migration, /auth_user_id\s*=\s*auth\.uid\(\)/i);
  assert.match(migration, /super_admin/i);
  assert.match(migration, /executive_director/i);
});
