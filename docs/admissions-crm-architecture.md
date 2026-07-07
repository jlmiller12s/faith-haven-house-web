# Faith Haven House Admissions CRM Architecture

This document describes the design, permissions, workflow stages, database models, and security structures of the private Faith Haven House Admissions CRM.

---

## 1. System Overview & Least-Privilege Role Model

The CRM is built inside Next.js App Router and secured under `/staff/*`. Access control is enforced at both the application router layer and the Supabase Row Level Security (RLS) policies level.

### Permission Role Matrix

| Staff Role | View Applicants | Manage Queue | Restricted Docs | Clinical Notes | Committee packet | welcome day checks | Manage Staff |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `super_admin` | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `executive_director` | Yes | Yes | Yes | No | Yes | Yes | No |
| `admissions_coordinator` | Yes | Yes | Yes | No | No | Yes | No |
| `admissions_interviewer` | Assigned | No | Interview | No | Recommendation | No | No |
| `behavioral_health_clinician` | Assigned | No | Clinical | Yes | Outcome Only | No | No |
| `admissions_committee_member`| Assigned | No | Redacted | No | Yes | No | No |
| `case_manager` | Admitted | No | Redacted | No | No | Checklists | No |
| `read_only_auditor` | Redacted | No | No | No | No | No | No |

- **Restricted clinical visibility**: Full behavioral assessments and clinical visibility notes are restricted to `behavioral_health_clinician` and `super_admin` roles. Committee members see only high-level outcomes.
- **Audit tracking**: Every read, update, download, or role change writes to an immutable `audit_logs` index.

---

## 2. Database Models & Schema Relations

### Tables List

1. **`staff_profiles`**: Roster of internal staff members and permissions roles.
2. **`applicants`**: Basic profile metadata of candidates (names, contact details, shelter status).
3. **`admissions_cases`**: Primary state tracker for admissions files (FHH-ADM-2026-XXXX).
4. **`prescreen_submissions`**: Public pre-screen form answers.
5. **`document_types`**: Configured files checklist schema.
6. **`admissions_documents`**: Tracks required document scans and local bucket file references.
7. **`screenings`**: Workflow state trackers for Checkr background screens and drug tests.
8. **`admissions_interviews`**: Observations, duration logs, and admissions recommendations.
9. **`behavioral_health_reviews`**: Clinician admissions-readiness logs.
10. **`committee_decisions`**: Official committee votes and conditions.
11. **`welcome_day_records`**: Room assignments and onboarding checklists.
12. **`tasks`**: Follow-up checklists assigned to staff.
13. **`notes`**: visibility scoped note logs.
14. **`activity_events`**: Chronological timelines displaying case progression.
15. **`audit_logs`**: Immutable server logs.

---

## 3. Secure File Storage Bucket Model
- Documents are hosted inside a private storage bucket (`admissions-documents`).
- Public download files and raw database URLs are disabled.
- Access to files requires generating a short-lived **signed URL** (300 seconds expiration) after verifying active user role privileges.

---

## 4. Public Pre-Screen Form Integration
- Submissions on `/get-help` execute a server-side endpoint `/api/prescreen`.
- Normalizes coordinates and performs duplicates detection.
- Auto-generates applicant indexes, initializes cases (`pre_screen_received`), writes event logs, and assigns a follow-up task to coordinators.
- Alerts staff using generic context notifications. No sensitive candidate identifiers are sent in email notifications.
