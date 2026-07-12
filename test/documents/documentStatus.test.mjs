import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const moduleUrl = new URL("../../lib/documentStatus.mjs", import.meta.url);

async function loadDocumentStatusModule() {
  try {
    return await import(moduleUrl);
  } catch {
    return null;
  }
}

test("requested documents receive a requested timestamp", async () => {
  const documentStatus = await loadDocumentStatusModule();
  assert.ok(documentStatus, "expected lib/documentStatus.mjs to exist");

  const payload = documentStatus.buildDocumentStatusPayload({
    status: "requested",
    actorId: "staff-1",
    now: "2026-07-12T18:00:00.000Z",
  });

  assert.deepEqual(payload, {
    status: "requested",
    requested_at: "2026-07-12T18:00:00.000Z",
    reviewed_at: null,
    reviewed_by: null,
    updated_at: "2026-07-12T18:00:00.000Z",
  });
});

test("completed documents record the reviewer and review timestamp", async () => {
  const documentStatus = await loadDocumentStatusModule();
  assert.ok(documentStatus, "expected lib/documentStatus.mjs to exist");

  const payload = documentStatus.buildDocumentStatusPayload({
    status: "complete",
    actorId: "staff-1",
    now: "2026-07-12T18:00:00.000Z",
  });

  assert.deepEqual(payload, {
    status: "complete",
    reviewed_at: "2026-07-12T18:00:00.000Z",
    reviewed_by: "staff-1",
    updated_at: "2026-07-12T18:00:00.000Z",
  });
});

test("database lookup errors stop the document mutation and are returned", async () => {
  const documentStatus = await loadDocumentStatusModule();
  assert.ok(documentStatus, "expected lib/documentStatus.mjs to exist");
  let inserted = false;

  const result = await documentStatus.persistDocumentStatus({
    caseId: "case-1",
    documentTypeId: "doc-1",
    status: "requested",
    actorId: "staff-1",
    findExisting: async () => ({ data: null, error: { message: "permission denied" } }),
    updateExisting: async () => ({ data: null, error: null }),
    insertNew: async () => {
      inserted = true;
      return { data: null, error: null };
    },
    now: () => "2026-07-12T18:00:00.000Z",
  });

  assert.equal(inserted, false);
  assert.deepEqual(result, {
    success: false,
    error: "Unable to check the current document status: permission denied",
  });
});

test("database write errors are returned instead of reporting success", async () => {
  const documentStatus = await loadDocumentStatusModule();
  assert.ok(documentStatus, "expected lib/documentStatus.mjs to exist");

  const result = await documentStatus.persistDocumentStatus({
    caseId: "case-1",
    documentTypeId: "doc-1",
    status: "requested",
    actorId: "staff-1",
    findExisting: async () => ({ data: null, error: null }),
    updateExisting: async () => ({ data: null, error: null }),
    insertNew: async () => ({
      data: null,
      error: { message: "foreign key constraint failed" },
    }),
    now: () => "2026-07-12T18:00:00.000Z",
  });

  assert.deepEqual(result, {
    success: false,
    error: "Unable to save the document status: foreign key constraint failed",
  });
});

test("document status is saved atomically when an upsert adapter is provided", async () => {
  const documentStatus = await loadDocumentStatusModule();
  assert.ok(documentStatus, "expected lib/documentStatus.mjs to exist");
  let savedPayload = null;

  const result = await documentStatus.persistDocumentStatus({
    caseId: "case-1",
    documentTypeId: "doc-1",
    status: "requested",
    actorId: "staff-1",
    saveDocument: async (payload) => {
      savedPayload = payload;
      return { data: { id: "document-1" }, error: null };
    },
    findExisting: async () => ({
      data: null,
      error: { message: "the non-atomic lookup should not run" },
    }),
    updateExisting: async () => ({ data: null, error: null }),
    insertNew: async () => ({ data: null, error: null }),
    now: () => "2026-07-12T18:00:00.000Z",
  });

  assert.deepEqual(savedPayload, {
    admissions_case_id: "case-1",
    document_type_id: "doc-1",
    status: "requested",
    requested_at: "2026-07-12T18:00:00.000Z",
    reviewed_at: null,
    reviewed_by: null,
    updated_at: "2026-07-12T18:00:00.000Z",
  });
  assert.deepEqual(result, { success: true, documentId: "document-1" });
});

test("document action success and error feedback have visible banner styles", async () => {
  const css = await readFile(new URL("../../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /\.crm-alert-banner\.success\s*\{/);
  assert.match(css, /\.crm-alert-banner\.error\s*\{/);
});
