import test from "node:test";
import assert from "node:assert/strict";
import {
  buildConfirmationEmail,
  sendConfirmationEmail,
} from "../../lib/prescreen/email.mjs";

test("builds a non-sensitive confirmation email with reply-to", () => {
  const message = buildConfirmationEmail({
    to: "person@example.com",
    from: "Faith Haven House Admissions <admissions@faithhavenhouse.org>",
    replyTo: "owner@example.com",
    firstName: "Test",
    caseNumber: "FHH-ADM-2026-000001",
    contactMethod: "email",
  });

  assert.equal(message.reply_to, "owner@example.com");
  assert.match(message.subject, /received/i);
  assert.match(message.html, /FHH-ADM-2026-000001/);
  assert.doesNotMatch(message.html, /Stable housing|additionalNotes|housingSituation/);
});

test("escapes applicant-controlled values in email HTML", () => {
  const message = buildConfirmationEmail({
    to: "person@example.com",
    from: "Faith Haven House <admissions@faithhavenhouse.org>",
    replyTo: "owner@example.com",
    firstName: "<script>alert(1)</script>",
    caseNumber: "FHH-ADM-2026-000001",
    contactMethod: "email",
  });
  assert.doesNotMatch(message.html, /<script>/);
  assert.match(message.html, /&lt;script&gt;/);
});

test("uses the admission idempotency key when calling Resend", async () => {
  let request;
  const result = await sendConfirmationEmail({
    apiKey: "test-key",
    idempotencyKey: "prescreen-confirmation/11111111-1111-4111-8111-111111111111",
    message: { to: "person@example.com" },
    fetchImpl: async (url, options) => {
      request = { url, options };
      return { ok: true, json: async () => ({ id: "email-id" }) };
    },
  });

  assert.equal(request.url, "https://api.resend.com/emails");
  assert.equal(
    request.options.headers["Idempotency-Key"],
    "prescreen-confirmation/11111111-1111-4111-8111-111111111111"
  );
  assert.equal(result.sent, true);
});

test("throws the provider response when Resend rejects delivery", async () => {
  await assert.rejects(
    sendConfirmationEmail({
      apiKey: "test-key",
      idempotencyKey: "prescreen-confirmation/id",
      message: {},
      fetchImpl: async () => ({ ok: false, text: async () => "domain not verified" }),
    }),
    /domain not verified/
  );
});
