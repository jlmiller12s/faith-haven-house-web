# Admissions CRM Production Launch Checklist

Verify each of these security and compliance steps before launching the CRM in production.

---

## 1. Authentication & Access Setup
- [ ] **MFA Constraints**: Require multi-factor authentication (MFA) for staff accounts inside the Supabase Auth dashboard.
- [ ] **Disable Public Registrations**: Confirm that public user signups are disabled in the Supabase Auth settings. All staff accounts must be manually invited by a `super_admin`.
- [ ] **Confirm Generic Errors**: Verify that failed sign-ins and password resets do not leak user existence (generic error messages only).

---

## 2. Row Level Security & Storage Audits
- [ ] **RLS Enabled**: Confirm RLS is enabled on all 15 sensitive tables.
- [ ] **Policy Tests**: Confirm that a `read_only_auditor` cannot view applicant contact details or download files.
- [ ] **Bucket Isolation**: Confirm the `admissions-documents` storage bucket is set to **private**. Confirm that direct public access to objects is rejected with a 403 error.
- [ ] **Signed URL Lifespans**: Verify that generated signed URLs are configured to expire after 300 seconds.

---

## 3. Logs & Notification Validation
- [ ] **Logs Sanitation Check**: Confirm that applicant names, phone numbers, SSNs, medical diagnoses, or document body contents are not written to the immutable `audit_logs` index.
- [ ] **Notification Check**: Verify that notification emails or system logs containing alerts (e.g. "A new pre-screen submission is ready for coordinator review") do not include PII or sensitive screening answers.

---

## 4. Disaster Recovery & Retention Setup
- [ ] **Backup Routines**: Schedule weekly backups of database tables.
- [ ] **Retention Rules**: Configure automatic document deletion scripts for archiving files after 7 years.
- [ ] **Incident Response Team**: Identify and document the technical contact for incident responses.
- [ ] **Legal Consent Agreement Check**: Complete a privacy and legal review of the Resident Covenant, release authorizations, and testing consent forms before publishing the upload gateway.
