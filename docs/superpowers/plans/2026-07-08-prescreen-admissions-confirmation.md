# Pre-Screen Admissions and Confirmation Email Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist every successful public pre-screen as a complete RAP admission and send a non-sensitive confirmation email.

**Architecture:** A compatibility migration adds the missing CRM tables and a transactional `create_prescreen_admission(jsonb)` PostgreSQL function. Focused server-only JavaScript modules validate/map submissions and deliver Resend email; RAP query mappers convert database rows to the existing UI model.

**Tech Stack:** Next.js 15, React 19, Node.js test runner, Supabase/PostgreSQL, Resend HTTP API, Vercel.

## Global Constraints

- Never expose the Supabase service-role key or Resend API key to client code.
- Never log applicant names, email addresses, phone numbers, or form answers.
- A database failure must never render the success state.
- An email failure must never delete or duplicate a committed admission.
- Confirmation emails must not include form answers or other sensitive information.
- Production database changes must preserve the existing `staff_profiles` and `audit_logs` tables.

---

## File Structure

- `lib/prescreen/validation.mjs`: validate and normalize the public form payload.
- `lib/prescreen/email.mjs`: construct and send the Resend confirmation.
- `lib/prescreen/submission.mjs`: orchestrate one database RPC followed by email delivery.
- `lib/crmRecordMappers.mjs`: translate Supabase snake-case case rows into the RAP camel-case model.
- `app/api/prescreen/route.js`: thin HTTP adapter with server-only dependencies.
- `components/prescreen/PreScreenForm.jsx`: retain server response and block false success.
- `components/prescreen/SubmissionSuccess.jsx`: show case reference and email-delivery state.
- `lib/crmService.js`: use the shared case mapper and surface query errors.
- `supabase/migrations/20260708020000_create_prescreen_admissions.sql`: compatible schema, RLS, indexes, and transaction function.
- `test/prescreen/*.test.mjs`: Node unit tests for validation, orchestration, email, and RAP mapping.

### Task 1: Validation and payload mapping

**Files:**
- Create: `lib/prescreen/validation.mjs`
- Create: `test/prescreen/validation.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `validatePrescreen(payload) -> { ok: true, value } | { ok: false, error }`
- The normalized value preserves all public form field names used by the database RPC.

- [ ] **Step 1: Add the Node test command and failing tests**

Test required fields, optional email validation, whitespace trimming, lower-cased email, full-name splitting, and the exact mapping of `cityCounty`, `supportGoals`, `biggestChallenge`, `futureGoals`, readiness fields, employment fields, safety fields, and acknowledgements.

```js
import test from "node:test";
import assert from "node:assert/strict";
import { validatePrescreen } from "../../lib/prescreen/validation.mjs";

test("maps the public form into the RPC payload", () => {
  const result = validatePrescreen(validPayload);
  assert.equal(result.ok, true);
  assert.equal(result.value.email, "person@example.com");
  assert.deepEqual(result.value.requestedSupports, ["Employment"]);
  assert.equal(result.value.primaryChallenge, "Stable housing");
});
```

- [ ] **Step 2: Run `npm test -- test/prescreen/validation.test.mjs`**

Expected: FAIL because `validation.mjs` does not exist.

- [ ] **Step 3: Implement validation**

```js
export function validatePrescreen(input) {
  const required = ["fullName", "phone", "contactMethod", "cityCounty", "housingSituation", "timeframe"];
  const missing = required.find((key) => !String(input?.[key] ?? "").trim());
  if (missing) return { ok: false, error: "Please complete all required pre-screen fields." };
  const email = String(input.email ?? "").trim().toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  const parts = String(input.fullName).trim().split(/\s+/);
  return { ok: true, value: {
    firstName: parts[0], lastName: parts.slice(1).join(" ") || "Applicant",
    phone: String(input.phone).trim(), email, contactMethod: input.contactMethod,
    cityCounty: input.cityCounty.trim(), housingSituation: input.housingSituation,
    timeframe: input.timeframe, referralSource: input.referralSource,
    requestedSupports: input.supportGoals ?? [], primaryChallenge: input.biggestChallenge,
    futureGoals: input.futureGoals ?? "", willingStructured: input.willingStructured,
    willingRoadmap: input.willingRoadmap, willingSubstanceFree: input.willingSubstanceFree,
    employmentStatus: input.employmentStatus, incomeSource: input.incomeSource,
    hasPhotoId: input.hasPhotoId, hasWorkDocs: input.hasWorkDocs,
    transportationStatus: input.transportationStatus, immediateCrisis: input.immediateCrisis,
    safeContactDetails: input.safeContactDetails ?? "", workingWithOrg: input.workingWithOrg,
    permissionContactOrg: input.permissionContactOrg ?? "", needsAccommodation: input.needsAccommodation,
    additionalNotes: input.additionalNotes ?? "", acknowledgements: input.acknowledgements ?? {}
  }};
}
```

- [ ] **Step 4: Re-run the test and commit**

Expected: PASS.

### Task 2: Atomic production schema and RPC

**Files:**
- Create: `supabase/migrations/20260708020000_create_prescreen_admissions.sql`

**Interfaces:**
- Produces: `public.create_prescreen_admission(p_payload jsonb)` returning `case_id`, `case_number`, `applicant_id`, `first_name`, and `duplicate_flag`.

- [ ] **Step 1: Add the compatibility migration**

Use `CREATE TABLE IF NOT EXISTS` for missing CRM tables; use existing UUID `staff_profiles.id` foreign keys; add indexes on case status/applicant/timestamps. Enable RLS and create authenticated-active-staff read policies. Revoke direct function access from `anon` and `authenticated`; grant it to `service_role`.

The function must use database defaults for every UUID, calculate the next case reference from a sequence, use exact normalized email/phone matching for duplicate detection, select an active coordinator when available, insert applicant/case/pre-screen/event/task/audit rows, and return the created identifiers. PostgreSQL function execution supplies transaction atomicity.

- [ ] **Step 2: Check SQL consistency**

Run schema parsing through the production SQL editor in a transaction with `ROLLBACK` where supported, then apply the migration once. Query `information_schema.tables`, `pg_proc`, and the RLS policy catalog to verify the expected objects.

- [ ] **Step 3: Commit the migration**

```bash
git add supabase/migrations/20260708020000_create_prescreen_admissions.sql
git commit -m "feat: add atomic prescreen admissions schema"
```

### Task 3: Submission orchestration and confirmation email

**Files:**
- Create: `lib/prescreen/email.mjs`
- Create: `lib/prescreen/submission.mjs`
- Create: `test/prescreen/email.test.mjs`
- Create: `test/prescreen/submission.test.mjs`
- Modify: `app/api/prescreen/route.js`

**Interfaces:**
- `buildConfirmationEmail({ firstName, caseNumber, contactMethod, to, from, replyTo })`
- `sendConfirmationEmail({ fetchImpl, apiKey, message, idempotencyKey })`
- `submitPrescreen({ payload, createAdmission, sendEmail }) -> { caseNumber, caseId, emailSent, emailStatus }`

- [ ] **Step 1: Write failing orchestration tests**

Cover a single RPC invocation, no email before commit, idempotency key equal to case UUID, successful email, skipped email when no applicant email, and preserved admission with `emailSent: false` after email failure.

- [ ] **Step 2: Run tests and verify expected failures**

```bash
npm test -- test/prescreen/email.test.mjs test/prescreen/submission.test.mjs
```

- [ ] **Step 3: Implement email and submission helpers**

Use `Idempotency-Key: prescreen-confirmation/<case UUID>` on the Resend request. Require `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `PRESCREEN_REPLY_TO` only when an email recipient exists. Return a delivery status without throwing away the committed admission.

- [ ] **Step 4: Replace the route with a thin adapter**

The route validates input, builds a server-only admin client, calls `.rpc("create_prescreen_admission", { p_payload: normalized })`, checks `error`, then invokes `submitPrescreen`. Return HTTP 201 only for a committed admission; return safe 400 validation and 500 persistence responses.

- [ ] **Step 5: Run tests and commit**

```bash
npm test
git add app/api/prescreen/route.js lib/prescreen test/prescreen package.json
git commit -m "feat: persist prescreens and send confirmations"
```

### Task 4: RAP data normalization and public success state

**Files:**
- Create: `lib/crmRecordMappers.mjs`
- Create: `test/prescreen/crmRecordMappers.test.mjs`
- Modify: `lib/crmService.js`
- Modify: `components/prescreen/PreScreenForm.jsx`
- Modify: `components/prescreen/SubmissionSuccess.jsx`

**Interfaces:**
- `mapAdmissionsCase(row)` returns `caseNumber`, `applicantId`, assignment IDs, and camel-case timestamps while retaining `id` and `status`.
- `SubmissionSuccess({ caseNumber, emailSent, emailProvided })` renders committed response state.

- [ ] **Step 1: Write failing case-mapper tests**

Assert every snake-case field used by the dashboard, queue, and case-details screen maps to its existing camel-case property.

- [ ] **Step 2: Implement and use the mapper**

Map rows returned by `getAdmissionsQueue` and the case object returned by `getCaseDetails`. Throw on Supabase query errors instead of returning an empty list.

- [ ] **Step 3: Preserve the API response in the form**

Parse JSON for success and failure. Store `caseNumber`, `emailSent`, and whether an email was supplied. Render success only when `res.ok && body.success && body.caseNumber`.

- [ ] **Step 4: Render applicant confirmation details**

Show the case reference. If email was supplied, show either “A confirmation email was sent” or “Your admission was saved; email confirmation is delayed.”

- [ ] **Step 5: Run tests, build, and commit**

```bash
npm test
npm run build
git add lib/crmRecordMappers.mjs lib/crmService.js components/prescreen test/prescreen
git commit -m "fix: surface committed prescreens in RAP"
```

### Task 5: Production configuration, deployment, and verification

**Files:**
- Modify: Vercel project environment variables
- Modify: Supabase production schema through the committed migration

**Interfaces:**
- Vercel secrets: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `PRESCREEN_REPLY_TO`

- [ ] **Step 1: Configure Resend**

Verify `faithhavenhouse.org` with Resend. Use `Faith Haven House Admissions <admissions@faithhavenhouse.org>` as the sender and the owner's current Gmail as reply-to. Store secrets in Vercel Production and Preview; never place their values in source control or logs.

- [ ] **Step 2: Deploy the tested commit**

Push `main` and confirm the Vercel production deployment uses the expected commit and environment variables.

- [ ] **Step 3: Run one labeled end-to-end submission**

Use a test applicant name clearly containing `TEST`, a controlled test inbox, and non-sensitive sample answers. Confirm the HTTP response is 201 and contains a case reference.

- [ ] **Step 4: Verify all outcomes**

Confirm the applicant, case, pre-screen, activity, and task rows exist; the RAP dashboard count increases; the Admissions queue and detail screen render; the confirmation reaches the test inbox; and Vercel logs contain no submission error or PII.

- [ ] **Step 5: Final repository checks**

```bash
npm test
npm run build
git status --short
```

Expected: tests and build pass; worktree is clean.
