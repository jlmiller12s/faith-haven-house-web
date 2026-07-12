export const ADMISSIONS_DOCUMENT_TYPES = [
  { id: "doc-1", number: "FHH-INT-001", title: "Resident Intake Application", comp: "Applicant", sens: "high" },
  { id: "doc-2", number: "FHH-INT-002", title: "Background Check Acknowledgment", comp: "Applicant", sens: "high" },
  { id: "doc-3", number: "FHH-INT-003", title: "Authorization for Release of Information", comp: "Applicant", sens: "high" },
  { id: "doc-4", number: "FHH-INT-004", title: "Drug & Alcohol Testing Consent", comp: "Applicant", sens: "high" },
  { id: "doc-5", number: "FHH-ADM-001", title: "Admissions Interview Evaluation", comp: "Staff", sens: "restricted" },
  { id: "doc-6", number: "FHH-ADM-002", title: "Behavioral Health Admission Readiness Assessment", comp: "Licensed Professional", sens: "clinical" },
  { id: "doc-7", number: "FHH-ADM-003", title: "Admissions Committee Decision Form", comp: "Committee", sens: "restricted" },
  { id: "doc-8", number: "FHH-ADM-004", title: "Welcome Day Checklist", comp: "Staff", sens: "restricted" },
];

export function buildDocumentStatusPayload({ status, actorId, now }) {
  const payload = {
    status,
    updated_at: now,
  };

  if (status === "requested") {
    payload.requested_at = now;
    payload.reviewed_at = null;
    payload.reviewed_by = null;
  }

  if (status === "submitted") payload.submitted_at = now;

  if (status === "reviewed" || status === "complete") {
    payload.reviewed_at = now;
    payload.reviewed_by = actorId;
  }

  return payload;
}

function mutationError(prefix, error) {
  return {
    success: false,
    error: `${prefix}: ${error?.message || "Unknown database error"}`,
  };
}

export async function persistDocumentStatus({
  caseId,
  documentTypeId,
  status,
  actorId,
  notes,
  saveDocument,
  findExisting,
  updateExisting,
  insertNew,
  now = () => new Date().toISOString(),
}) {
  const payload = buildDocumentStatusPayload({
    status,
    actorId,
    now: now(),
  });
  if (notes) payload.notes = notes;

  if (saveDocument) {
    const saveResult = await saveDocument({
      admissions_case_id: caseId,
      document_type_id: documentTypeId,
      ...payload,
    });
    if (saveResult.error) {
      return mutationError("Unable to save the document status", saveResult.error);
    }
    return {
      success: true,
      documentId: saveResult.data?.id || documentTypeId,
    };
  }

  const existingResult = await findExisting(caseId, documentTypeId);
  if (existingResult.error) {
    return mutationError("Unable to check the current document status", existingResult.error);
  }

  const writeResult = existingResult.data
    ? await updateExisting(existingResult.data.id, payload)
    : await insertNew({
        admissions_case_id: caseId,
        document_type_id: documentTypeId,
        ...payload,
      });

  if (writeResult.error) {
    return mutationError("Unable to save the document status", writeResult.error);
  }

  return {
    success: true,
    documentId: writeResult.data?.id || existingResult.data?.id || documentTypeId,
  };
}
