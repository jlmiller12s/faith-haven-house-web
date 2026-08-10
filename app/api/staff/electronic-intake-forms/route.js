import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkStaffAccess, getCurrentStaffUser } from "@/lib/rapAuth";
import {
  canManageElectronicForm,
  getElectronicFormByDocumentTypeId,
  validateElectronicForm,
} from "@/lib/electronicIntakeForms.mjs";

const CaseIdSchema = z.string().uuid();
const DocumentTypeIdSchema = z.string().regex(/^doc-[1-8]$/);
const SaveSchema = z.object({
  caseId: CaseIdSchema,
  documentTypeId: DocumentTypeIdSchema,
  formVersion: z.string().min(1).max(20),
  responses: z.record(z.string(), z.union([z.string(), z.boolean()])),
  status: z.enum(["draft", "completed"]),
  expectedUpdatedAt: z.string().datetime().nullable().optional(),
});

function responseError(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

async function authenticatedStaff() {
  const serverClient = await createSupabaseServerClient();
  const staffUser = await getCurrentStaffUser(serverClient);
  const access = checkStaffAccess(staffUser);
  return access.allowed ? staffUser : null;
}

function authorizeForm(documentTypeId, staffUser) {
  const form = getElectronicFormByDocumentTypeId(documentTypeId);
  return canManageElectronicForm(form, staffUser?.role) ? form : null;
}

export async function GET(request) {
  const staffUser = await authenticatedStaff();
  if (!staffUser) return responseError("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const caseIdResult = CaseIdSchema.safeParse(searchParams.get("caseId"));
  const documentTypeResult = DocumentTypeIdSchema.safeParse(searchParams.get("documentTypeId"));
  if (!caseIdResult.success || !documentTypeResult.success) {
    return responseError("A valid applicant file and form are required.", 400);
  }

  if (!authorizeForm(documentTypeResult.data, staffUser)) {
    return responseError("You do not have access to this electronic form.", 403);
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("electronic_intake_forms")
    .select("id, admissions_case_id, document_type_id, form_version, status, responses, completed_at, created_at, updated_at")
    .eq("admissions_case_id", caseIdResult.data)
    .eq("document_type_id", documentTypeResult.data)
    .maybeSingle();

  if (error) {
    console.error("[electronic form load]", error.message);
    return responseError("The electronic form could not be loaded.", 500);
  }

  return NextResponse.json({ success: true, form: data || null });
}

export async function POST(request) {
  const staffUser = await authenticatedStaff();
  if (!staffUser) return responseError("Unauthorized", 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return responseError("The form submission is not valid JSON.", 400);
  }

  const parsed = SaveSchema.safeParse(body);
  if (!parsed.success) return responseError("The form submission is invalid.", 400);

  const input = parsed.data;
  const form = authorizeForm(input.documentTypeId, staffUser);
  if (!form || form.version !== input.formVersion) {
    return responseError("You do not have access to this form version.", 403);
  }

  if (input.status === "completed") {
    const validation = validateElectronicForm(form.id, input.responses);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Complete every required field before submitting.", fieldErrors: validation.errors },
        { status: 400 }
      );
    }
  }

  const admin = createSupabaseAdminClient();
  const { data: admissionsCase, error: caseError } = await admin
    .from("admissions_cases")
    .select("id")
    .eq("id", input.caseId)
    .maybeSingle();
  if (caseError || !admissionsCase) return responseError("The applicant file could not be found.", 404);

  const { data: existing, error: existingError } = await admin
    .from("electronic_intake_forms")
    .select("id, status, updated_at")
    .eq("admissions_case_id", input.caseId)
    .eq("document_type_id", input.documentTypeId)
    .maybeSingle();
  if (existingError) return responseError("The current form version could not be checked.", 500);
  if (existing?.status === "completed") {
    return responseError("This form is complete and locked. Create a corrected revision through an administrator.", 409);
  }
  if (existing && (!input.expectedUpdatedAt || input.expectedUpdatedAt !== existing.updated_at)) {
    return responseError("A newer draft was saved by another user. Reload the form before making more changes.", 409);
  }

  const now = new Date().toISOString();
  const writePayload = {
    admissions_case_id: input.caseId,
    document_type_id: input.documentTypeId,
    form_version: input.formVersion,
    responses: input.responses,
    status: input.status,
    updated_by: staffUser.staffProfileId,
    completed_by: input.status === "completed" ? staffUser.staffProfileId : null,
    completed_at: input.status === "completed" ? now : null,
    updated_at: now,
  };

  let saved;
  let saveError;
  if (existing) {
    ({ data: saved, error: saveError } = await admin
      .from("electronic_intake_forms")
      .update(writePayload)
      .eq("id", existing.id)
      .eq("updated_at", existing.updated_at)
      .select("id, status, updated_at")
      .maybeSingle());
    if (!saveError && !saved) {
      return responseError("A newer draft was saved by another user. Reload the form before making more changes.", 409);
    }
  } else {
    ({ data: saved, error: saveError } = await admin
      .from("electronic_intake_forms")
      .insert({ ...writePayload, created_by: staffUser.staffProfileId })
      .select("id, status, updated_at")
      .single());
  }

  if (saveError) {
    console.error("[electronic form save]", saveError.message);
    const conflict = saveError.code === "23505";
    return responseError(
      conflict ? "Another user created this draft first. Reload the form before continuing." : "The electronic form could not be saved.",
      conflict ? 409 : 500
    );
  }

  let warning = null;
  if (input.status === "completed") {
    const { error: documentError } = await admin.from("admissions_documents").upsert({
      admissions_case_id: input.caseId,
      document_type_id: input.documentTypeId,
      status: "complete",
      reviewed_at: now,
      reviewed_by: staffUser.staffProfileId,
      updated_at: now,
    }, { onConflict: "admissions_case_id,document_type_id" });
    if (documentError) warning = "The form was completed, but its document checklist status could not be updated.";
  }

  const { error: auditError } = await admin.from("audit_logs").insert({
    actor_id: staffUser.staffProfileId,
    action: input.status === "completed" ? "electronic_form_completed" : "electronic_form_saved",
    entity_type: "electronic_intake_form",
    entity_id: saved.id,
    admissions_case_id: input.caseId,
    metadata_safe: { documentTypeId: input.documentTypeId, status: input.status },
    ip_hash: "server_action",
    created_at: now,
  });
  if (auditError) console.error("[electronic form audit]", auditError.message);

  return NextResponse.json({ success: true, formId: saved.id, status: saved.status, updatedAt: saved.updated_at, warning });
}
