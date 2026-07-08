import test from "node:test";
import assert from "node:assert/strict";
import { submitPrescreen } from "../../lib/prescreen/submission.mjs";

const admission = {
  case_id: "11111111-1111-4111-8111-111111111111",
  case_number: "FHH-ADM-2026-000001",
  applicant_id: "22222222-2222-4222-8222-222222222222",
  first_name: "Test",
  duplicate_flag: false,
};

test("sends email only after the admission commits", async () => {
  const calls = [];
  const result = await submitPrescreen({
    payload: { email: "person@example.com", contactMethod: "email" },
    createAdmission: async () => {
      calls.push("database");
      return admission;
    },
    sendEmail: async ({ idempotencyKey }) => {
      calls.push("email");
      assert.equal(idempotencyKey, `prescreen-confirmation/${admission.case_id}`);
      return { sent: true };
    },
  });

  assert.deepEqual(calls, ["database", "email"]);
  assert.deepEqual(result, {
    caseId: admission.case_id,
    caseNumber: admission.case_number,
    emailSent: true,
    emailStatus: "sent",
  });
});

test("does not send email when the database transaction fails", async () => {
  let emailCalls = 0;
  await assert.rejects(
    submitPrescreen({
      payload: { email: "person@example.com" },
      createAdmission: async () => { throw new Error("database unavailable"); },
      sendEmail: async () => { emailCalls += 1; },
    }),
    /database unavailable/
  );
  assert.equal(emailCalls, 0);
});

test("preserves a committed admission when email delivery fails", async () => {
  const result = await submitPrescreen({
    payload: { email: "person@example.com", contactMethod: "email" },
    createAdmission: async () => admission,
    sendEmail: async () => { throw new Error("email unavailable"); },
  });

  assert.equal(result.caseNumber, admission.case_number);
  assert.equal(result.emailSent, false);
  assert.equal(result.emailStatus, "delayed");
});

test("skips email cleanly when the applicant did not supply one", async () => {
  const result = await submitPrescreen({
    payload: { email: "" },
    createAdmission: async () => admission,
    sendEmail: async () => { throw new Error("should not be called"); },
  });

  assert.equal(result.emailSent, false);
  assert.equal(result.emailStatus, "not_requested");
});
