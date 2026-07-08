# Pre-Screen Admissions and Confirmation Email Design

## Objective

Ensure every successful public pre-screen submission creates a complete admissions record visible in the RAP Portal and sends the applicant a confirmation email containing a non-sensitive case reference and next steps.

## Confirmed Production Failures

- The production database does not contain the `applicants`, `admissions_cases`, `prescreen_submissions`, `tasks`, or `activity_events` tables expected by the application.
- The current API constructs string identifiers such as `app-*`, `case-*`, and `staff-3`, while the database schema requires UUIDs.
- Older API code ignored Supabase insert errors and returned a successful response, which produced a thank-you screen without a stored admission.
- The production Vercel project has no `RESEND_API_KEY` or sender configuration, so the confirmation-email branch is skipped.
- Previously failed submissions cannot be reconstructed because their form contents were not persisted or logged.

## Selected Approach

Use a compatibility migration plus one transactional PostgreSQL function for admission creation. The API validates and normalizes input, calls the function with the service-role Supabase client, and sends an idempotent Resend confirmation only after the transaction commits.

This provides stronger consistency than sequential route-level inserts without adding a separate queue or worker system that current submission volume does not require.

## Database Design

Create a new forward-only migration that preserves the existing production `staff_profiles` and `audit_logs` tables while adding the missing CRM tables, indexes, foreign keys, and RLS policies.

The migration will add a `create_prescreen_admission` security-definer function that:

1. Normalizes the applicant's email and phone for duplicate detection.
2. Reuses an existing applicant when an exact email or normalized phone match exists; otherwise creates a new applicant.
3. Creates an admissions case with a database-generated UUID and collision-resistant human-readable case number.
4. Creates the pre-screen answers, timeline event, and follow-up task in the same transaction.
5. Assigns the first active admissions coordinator when one exists; otherwise leaves the case and task unassigned and visible to authorized RAP staff.
6. Returns the case UUID, case number, applicant UUID, applicant first name, and duplicate flag.

Any failed statement rolls back the entire submission. Public clients receive no direct table write access; the Next.js server route uses the service-role client.

## Application Components

### Submission service

Move validation, payload mapping, database invocation, and email delivery into focused server-only helpers. The API route remains a thin HTTP adapter.

### RAP queries

Normalize database snake-case records into the camel-case shape expected by the dashboard and admissions queue. Surface Supabase query errors instead of silently converting them into empty lists.

### Confirmation email

Send through Resend after the database transaction commits. The message includes:

- Faith Haven House branding
- Applicant first name
- Case reference number
- Confirmation that the information was received
- Review and contact next steps
- The existing placement disclaimer
- Faith Haven House phone number

The email excludes form answers and other sensitive information. The sender becomes `Faith Haven House Admissions <admissions@faithhavenhouse.org>` after domain verification. Until the admissions mailbox is operational, replies go to the owner's current Gmail address through a server-side `PRESCREEN_REPLY_TO` variable.

The Resend request uses the case UUID as its idempotency key so a retried HTTP request cannot create duplicate confirmation messages.

## User-Visible Behavior

- The success screen appears only after the complete admission transaction commits.
- The success screen displays the case reference returned by the server.
- When email delivery succeeds, the screen tells the applicant to check their inbox.
- When database creation succeeds but email delivery fails, the admission remains saved and the screen explains that confirmation email is delayed while preserving the case reference.
- Database failures keep the form available and display a safe retry message. Internal details remain in server logs.

## Error Handling and Observability

- Validate required fields and email format before the database call.
- Treat missing server credentials as configuration errors, never as mock-mode production success.
- Log a structured submission result containing only case UUID, case number, duplicate status, and email-delivery status.
- Never log applicant form contents, email addresses, phone numbers, or Resend credentials.
- Check every Supabase and Resend response and return explicit HTTP status codes.

## Testing

Use test-driven development for:

- Required-field and email validation
- Mapping public form fields into the database function payload
- Successful transaction response and case-reference rendering
- Database failure preventing the success state
- Email success and failure behavior after a committed admission
- Resend idempotency and reply-to headers
- RAP database-row normalization and error propagation

Run the complete automated test suite, lint/build checks, database migration verification, and an end-to-end production submission using a clearly labeled test applicant. Verify the case appears in both the RAP dashboard and Admissions queue and that the confirmation reaches the test inbox.

## Deployment Sequence

1. Add tests and implementation locally.
2. Apply the compatibility migration to production Supabase.
3. Configure Resend and Vercel environment variables without exposing secret values.
4. Deploy the application.
5. Submit one labeled production test pre-screen.
6. Verify the database record, RAP dashboard/queue, confirmation email, and server logs.
7. Remove or close the labeled test admission from the operational queue if the portal supports it; otherwise leave it clearly marked as a test record for manual cleanup.

## Out of Scope

- Recovering submissions that were never stored
- Applicant accounts or application-status tracking
- Staff notification emails
- A generalized background job or email campaign system
