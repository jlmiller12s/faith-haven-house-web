-- Seed the document catalog used by the RAP Portal and enforce one status row
-- per document type for each admissions case.

INSERT INTO public.document_types (
  id,
  binder_reference,
  document_number,
  title,
  completed_by,
  sensitivity
)
VALUES
  ('doc-1', '8.1', 'FHH-INT-001', 'Resident Intake Application', 'Applicant', 'high'),
  ('doc-2', '8.2', 'FHH-INT-002', 'Background Check Acknowledgment', 'Applicant', 'high'),
  ('doc-3', '8.3', 'FHH-INT-003', 'Authorization for Release of Information', 'Applicant', 'high'),
  ('doc-4', '8.4', 'FHH-INT-004', 'Drug & Alcohol Testing Consent', 'Applicant', 'high'),
  ('doc-5', '7.1', 'FHH-ADM-001', 'Admissions Interview Evaluation', 'Staff', 'restricted'),
  ('doc-6', '7.2', 'FHH-ADM-002', 'Behavioral Health Admission Readiness Assessment', 'Licensed Behavioral Health Professional', 'clinical'),
  ('doc-7', '7.3', 'FHH-ADM-003', 'Admissions Committee Decision Form', 'Admissions Committee', 'restricted'),
  ('doc-8', '7.4', 'FHH-ADM-004', 'Welcome Day Checklist', 'Faith Haven House Staff', 'restricted'),
  ('doc-9', '8.5', 'FHH-COV-001', 'Resident Covenant and Rules Agreement', 'Applicant & Staff', 'restricted'),
  ('doc-10', '8.6', 'FHH-FIN-001', 'Financial Snapshot & Net Worth Tracker', 'Applicant', 'restricted'),
  ('doc-11', '8.7', 'FHH-ACC-001', 'Resident Access Code Assignment Form', 'Staff', 'restricted')
ON CONFLICT (id) DO UPDATE SET
  binder_reference = EXCLUDED.binder_reference,
  document_number = EXCLUDED.document_number,
  title = EXCLUDED.title,
  completed_by = EXCLUDED.completed_by,
  sensitivity = EXCLUDED.sensitivity;

-- Retain the most recently updated row if older deployments created duplicates.
WITH ranked_documents AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY admissions_case_id, document_type_id
      ORDER BY updated_at DESC, created_at DESC, id DESC
    ) AS duplicate_rank
  FROM public.admissions_documents
)
DELETE FROM public.admissions_documents AS document
USING ranked_documents
WHERE document.id = ranked_documents.id
  AND ranked_documents.duplicate_rank > 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'admissions_documents_case_document_type_unique'
      AND conrelid = 'public.admissions_documents'::regclass
  ) THEN
    ALTER TABLE public.admissions_documents
      ADD CONSTRAINT admissions_documents_case_document_type_unique
      UNIQUE (admissions_case_id, document_type_id);
  END IF;
END
$$;
