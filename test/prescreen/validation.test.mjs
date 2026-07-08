import test from "node:test";
import assert from "node:assert/strict";
import { validatePrescreen } from "../../lib/prescreen/validation.mjs";

const validPayload = {
  fullName: "  Test Person  ",
  phone: "(636) 555-0101",
  contactMethod: "email",
  cityCounty: "St. Charles, St. Charles County",
  email: " PERSON@EXAMPLE.COM ",
  canContactMessage: "Yes",
  housingSituation: "Temporarily staying with others",
  timeframe: "Within 30 days",
  referralSource: "Community organization",
  supportGoals: ["Employment", "Stable housing"],
  biggestChallenge: "Stable housing",
  futureGoals: "Working and living independently",
  willingStructured: "Yes",
  willingRoadmap: "Yes",
  willingSubstanceFree: "Yes",
  employmentStatus: "Seeking work",
  incomeSource: "None",
  hasPhotoId: "Yes",
  hasWorkDocs: "Yes",
  transportationStatus: "Public transportation",
  immediateCrisis: "No",
  safeContactDetails: "Email first",
  workingWithOrg: "Yes",
  permissionContactOrg: "Yes",
  needsAccommodation: "No",
  additionalNotes: "Test submission",
  acknowledgements: {
    ackNotGuarantee: true,
    ackStaffConversation: true,
    ackNoSensitiveData: true,
    ackAccurate: true,
    ackPermissionContact: true,
  },
};

test("maps every public form field into the admission payload", () => {
  const result = validatePrescreen(validPayload);

  assert.equal(result.ok, true);
  assert.deepEqual(result.value, {
    firstName: "Test",
    lastName: "Person",
    phone: "(636) 555-0101",
    email: "person@example.com",
    contactMethod: "email",
    cityCounty: "St. Charles, St. Charles County",
    canContactMessage: "Yes",
    housingSituation: "Temporarily staying with others",
    timeframe: "Within 30 days",
    referralSource: "Community organization",
    requestedSupports: ["Employment", "Stable housing"],
    primaryChallenge: "Stable housing",
    futureGoals: "Working and living independently",
    willingStructured: "Yes",
    willingRoadmap: "Yes",
    willingSubstanceFree: "Yes",
    employmentStatus: "Seeking work",
    incomeSource: "None",
    hasPhotoId: "Yes",
    hasWorkDocs: "Yes",
    transportationStatus: "Public transportation",
    immediateCrisis: "No",
    safeContactDetails: "Email first",
    workingWithOrg: "Yes",
    permissionContactOrg: "Yes",
    needsAccommodation: "No",
    additionalNotes: "Test submission",
    acknowledgements: validPayload.acknowledgements,
  });
});

test("rejects a malformed optional email", () => {
  const result = validatePrescreen({ ...validPayload, email: "not-an-email" });
  assert.deepEqual(result, { ok: false, error: "Please enter a valid email address." });
});

test("rejects a missing required field", () => {
  const result = validatePrescreen({ ...validPayload, fullName: "" });
  assert.deepEqual(result, {
    ok: false,
    error: "Please complete all required pre-screen fields.",
  });
});

test("requires all submission acknowledgements", () => {
  const result = validatePrescreen({
    ...validPayload,
    acknowledgements: { ...validPayload.acknowledgements, ackAccurate: false },
  });
  assert.deepEqual(result, {
    ok: false,
    error: "Please review and accept all required acknowledgements.",
  });
});

test("accepts an empty optional email", () => {
  const result = validatePrescreen({ ...validPayload, email: "" });
  assert.equal(result.ok, true);
  assert.equal(result.value.email, "");
});
