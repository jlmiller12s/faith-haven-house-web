import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const moduleUrl = new URL("../../lib/electronicIntakeForms.mjs", import.meta.url);

test("every approved admissions and intake document has an electronic form definition", async () => {
  const { ELECTRONIC_INTAKE_FORMS } = await import(moduleUrl);
  assert.deepEqual(
    ELECTRONIC_INTAKE_FORMS.map((form) => form.id),
    ["FHH-7.1", "FHH-7.2", "FHH-7.3", "FHH-7.4", "FHH-8.1", "FHH-8.2", "FHH-8.3", "FHH-8.4"],
  );
  for (const form of ELECTRONIC_INTAKE_FORMS) {
    assert.ok(form.sections.length > 0, `${form.id} must include sections`);
    assert.ok(form.fields.length > 0, `${form.id} must include fields`);
  }
});

test("required applicant acknowledgments must be accepted before completion", async () => {
  const { validateElectronicForm } = await import(moduleUrl);
  const result = validateElectronicForm("FHH-8.2", {
    applicant_name: "Test Applicant",
    signature_name: "Test Applicant",
    signature_date: "2026-08-10",
  });
  assert.equal(result.success, false);
  assert.ok(result.errors.some((error) => error.field === "ack_background_required"));
});

test("a fully answered form passes completion validation", async () => {
  const { getElectronicFormDefinition, validateElectronicForm } = await import(moduleUrl);
  const form = getElectronicFormDefinition("FHH-8.2");
  const responses = Object.fromEntries(form.fields.map((field) => [
    field.id,
    field.type === "checkbox" ? true : "Completed",
  ]));
  assert.deepEqual(validateElectronicForm(form.id, responses), { success: true, errors: [] });
});

test("unknown electronic forms are rejected", async () => {
  const { validateElectronicForm } = await import(moduleUrl);
  assert.deepEqual(validateElectronicForm("FHH-99.9", {}), {
    success: false,
    errors: [{ field: "form", message: "Unknown form." }],
  });
});

test("electronic form roles follow the staff workflow and exclude auditors", async () => {
  const {
    canManageElectronicForm,
    getElectronicFormByDocumentTypeId,
  } = await import(moduleUrl);
  const intake = getElectronicFormByDocumentTypeId("doc-1");
  const clinical = getElectronicFormByDocumentTypeId("doc-6");
  const committee = getElectronicFormByDocumentTypeId("doc-7");

  assert.equal(canManageElectronicForm(intake, "admissions_coordinator"), true);
  assert.equal(canManageElectronicForm(intake, "read_only_auditor"), false);
  assert.equal(canManageElectronicForm(clinical, "behavioral_health_clinician"), true);
  assert.equal(canManageElectronicForm(clinical, "admissions_coordinator"), false);
  assert.equal(canManageElectronicForm(committee, "admissions_committee_member"), true);
  assert.equal(canManageElectronicForm(committee, "case_manager"), false);
});

test("electronic form storage is case-scoped and protected by RLS", async () => {
  const migrationUrl = new URL(
    "../../supabase/migrations/20260810090000_create_electronic_intake_forms.sql",
    import.meta.url,
  );
  const sql = await readFile(migrationUrl, "utf8");
  assert.match(sql, /create table if not exists public\.electronic_intake_forms/i);
  assert.match(sql, /unique\s*\(\s*admissions_case_id\s*,\s*document_type_id\s*\)/i);
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /responses jsonb/i);
  assert.match(sql, /revoke all on public\.electronic_intake_forms from anon, authenticated/i);
  assert.doesNotMatch(sql, /grant\s+(?:select|insert|update).*electronic_intake_forms.*authenticated/i);
  assert.match(sql, /document_type_id = 'doc-6'.*behavioral_health_clinician/i);
});

test("the document library links approved forms to the electronic form workflow", async () => {
  const libraryPage = await readFile(
    new URL("../../app/staff/intake-documents/page.jsx", import.meta.url),
    "utf8",
  );
  assert.match(libraryPage, /Complete online/);
  assert.match(libraryPage, /\/staff\/intake-documents\/\$\{doc\.id\}/);
});

test("the electronic form page supports both drafts and completed submissions", async () => {
  const formPage = await readFile(
    new URL("../../app/staff/intake-documents/[documentId]/page.jsx", import.meta.url),
    "utf8",
  );
  assert.match(formPage, /Save draft/);
  assert.match(formPage, /Complete form/);
  assert.match(formPage, /validateElectronicForm/);
  assert.match(formPage, /completed form is locked/i);
  assert.match(formPage, /expectedUpdatedAt/);
});

test("the server route derives staff attribution and rejects stale or completed writes", async () => {
  const route = await readFile(
    new URL("../../app/api/staff/electronic-intake-forms/route.js", import.meta.url),
    "utf8",
  );
  assert.match(route, /getCurrentStaffUser/);
  assert.match(route, /staffUser\.staffProfileId/);
  assert.doesNotMatch(route, /actorId:\s*z\./);
  assert.match(route, /existing\?\.status === "completed"/);
  assert.match(route, /input\.expectedUpdatedAt !== existing\.updated_at/);
  assert.match(route, /validateElectronicForm\(form\.id, input\.responses\)/);
});
