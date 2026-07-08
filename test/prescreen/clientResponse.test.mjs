import test from "node:test";
import assert from "node:assert/strict";
import { parseSubmissionResponse } from "../../lib/prescreen/clientResponse.mjs";

test("accepts only a committed submission with a case reference", () => {
  const result = parseSubmissionResponse(true, {
    success: true,
    caseNumber: "FHH-ADM-2026-000001",
    emailSent: true,
  });
  assert.deepEqual(result, {
    ok: true,
    caseNumber: "FHH-ADM-2026-000001",
    emailSent: true,
  });
});

test("rejects a nominal HTTP success without a committed case", () => {
  assert.deepEqual(parseSubmissionResponse(true, { success: true }), {
    ok: false,
    error: "We could not confirm that your pre-screen was saved.",
  });
});

test("returns a safe server error", () => {
  assert.deepEqual(
    parseSubmissionResponse(false, { error: "Please try again." }),
    { ok: false, error: "Please try again." }
  );
});
