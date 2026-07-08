-- ============================================================
-- RAP Portal: Auth Setup Migration
-- Migration ID: 20260708000000_rap_auth_setup.sql
--
-- This migration adds production-grade auth scaffolding on top
-- of the initial CRM schema (20260707000000_init_crm_schema.sql)
-- ============================================================

-- -------------------------------------------------------
-- 1. Add mfa_required column to staff_profiles
-- -------------------------------------------------------
ALTER TABLE public.staff_profiles
  ADD COLUMN IF NOT EXISTS mfa_required BOOLEAN NOT NULL DEFAULT false;

-- -------------------------------------------------------
-- 2. Index on auth_user_id for fast lookups on every request
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_staff_profiles_auth_user_id
  ON public.staff_profiles (auth_user_id);

-- -------------------------------------------------------
-- 3. updated_at auto-update trigger
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_staff_profiles_updated_at ON public.staff_profiles;
CREATE TRIGGER set_staff_profiles_updated_at
  BEFORE UPDATE ON public.staff_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------
-- 4. Enable Row Level Security on all RAP Portal tables
-- -------------------------------------------------------
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_health_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.welcome_day_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescreen_submissions ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- 5. RLS Policies: staff_profiles
-- -------------------------------------------------------

-- No anonymous access
DROP POLICY IF EXISTS "staff_profiles_anon_deny" ON public.staff_profiles;
CREATE POLICY "staff_profiles_anon_deny"
  ON public.staff_profiles
  FOR ALL
  TO anon
  USING (false);

-- Staff can read their own profile
DROP POLICY IF EXISTS "staff_profiles_self_read" ON public.staff_profiles;
CREATE POLICY "staff_profiles_self_read"
  ON public.staff_profiles
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Any active authenticated staff can list all profiles (for assignments dropdown)
DROP POLICY IF EXISTS "staff_profiles_authenticated_list" ON public.staff_profiles;
CREATE POLICY "staff_profiles_authenticated_list"
  ON public.staff_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      WHERE sp.auth_user_id = auth.uid()
        AND sp.is_active = true
    )
  );

-- Only super_admin can insert/update/delete staff profiles
DROP POLICY IF EXISTS "staff_profiles_admin_write" ON public.staff_profiles;
CREATE POLICY "staff_profiles_admin_write"
  ON public.staff_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      WHERE sp.auth_user_id = auth.uid()
        AND sp.role = 'super_admin'
        AND sp.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      WHERE sp.auth_user_id = auth.uid()
        AND sp.role = 'super_admin'
        AND sp.is_active = true
    )
  );

-- -------------------------------------------------------
-- 6. RLS Policies: audit_logs
-- -------------------------------------------------------

DROP POLICY IF EXISTS "audit_logs_anon_deny" ON public.audit_logs;
CREATE POLICY "audit_logs_anon_deny"
  ON public.audit_logs
  FOR ALL
  TO anon
  USING (false);

-- Only super_admin and read_only_auditor can read audit logs
DROP POLICY IF EXISTS "audit_logs_admin_read" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_read"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      WHERE sp.auth_user_id = auth.uid()
        AND sp.role IN ('super_admin', 'read_only_auditor')
        AND sp.is_active = true
    )
  );

-- Any active staff can insert audit log entries (system writes)
DROP POLICY IF EXISTS "audit_logs_staff_insert" ON public.audit_logs;
CREATE POLICY "audit_logs_staff_insert"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      WHERE sp.auth_user_id = auth.uid()
        AND sp.is_active = true
    )
  );

-- Nobody can update or delete audit logs
DROP POLICY IF EXISTS "audit_logs_no_modify" ON public.audit_logs;
CREATE POLICY "audit_logs_no_modify"
  ON public.audit_logs
  FOR UPDATE
  TO authenticated
  USING (false);

-- -------------------------------------------------------
-- 7. RLS Policies: applicants (active staff only)
-- -------------------------------------------------------

DROP POLICY IF EXISTS "applicants_staff_read" ON public.applicants;
CREATE POLICY "applicants_staff_read"
  ON public.applicants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      WHERE sp.auth_user_id = auth.uid()
        AND sp.is_active = true
    )
  );

DROP POLICY IF EXISTS "applicants_staff_write" ON public.applicants;
CREATE POLICY "applicants_staff_write"
  ON public.applicants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      WHERE sp.auth_user_id = auth.uid()
        AND sp.is_active = true
        AND sp.role NOT IN ('read_only_auditor')
    )
  );

DROP POLICY IF EXISTS "applicants_staff_update" ON public.applicants;
CREATE POLICY "applicants_staff_update"
  ON public.applicants
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      WHERE sp.auth_user_id = auth.uid()
        AND sp.is_active = true
        AND sp.role NOT IN ('read_only_auditor')
    )
  );

-- -------------------------------------------------------
-- 8. RLS Policies: admissions_cases (active staff only)
-- -------------------------------------------------------

DROP POLICY IF EXISTS "cases_staff_read" ON public.admissions_cases;
CREATE POLICY "cases_staff_read"
  ON public.admissions_cases
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      WHERE sp.auth_user_id = auth.uid()
        AND sp.is_active = true
    )
  );

DROP POLICY IF EXISTS "cases_staff_write" ON public.admissions_cases;
CREATE POLICY "cases_staff_write"
  ON public.admissions_cases
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      WHERE sp.auth_user_id = auth.uid()
        AND sp.is_active = true
        AND sp.role NOT IN ('read_only_auditor')
    )
  );

-- -------------------------------------------------------
-- 9. RLS: notes — visibility enforcement
-- -------------------------------------------------------
DROP POLICY IF EXISTS "notes_staff_read" ON public.notes;
CREATE POLICY "notes_staff_read"
  ON public.notes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      WHERE sp.auth_user_id = auth.uid()
        AND sp.is_active = true
    )
    AND (
      -- General notes visible to all active staff
      visibility = 'general_staff'
      -- Restricted notes: admissions-role staff
      OR (visibility = 'restricted_admissions' AND EXISTS (
        SELECT 1 FROM public.staff_profiles sp
        WHERE sp.auth_user_id = auth.uid()
          AND sp.role IN ('super_admin', 'executive_director', 'admissions_coordinator', 'admissions_interviewer', 'admissions_committee_member')
      ))
      -- Clinical notes: clinician and super_admin only
      OR (visibility = 'clinical_restricted' AND EXISTS (
        SELECT 1 FROM public.staff_profiles sp
        WHERE sp.auth_user_id = auth.uid()
          AND sp.role IN ('super_admin', 'behavioral_health_clinician')
      ))
      -- Committee notes: committee and super_admin only
      OR (visibility = 'committee_restricted' AND EXISTS (
        SELECT 1 FROM public.staff_profiles sp
        WHERE sp.auth_user_id = auth.uid()
          AND sp.role IN ('super_admin', 'executive_director', 'admissions_committee_member')
      ))
    )
  );

DROP POLICY IF EXISTS "notes_staff_insert" ON public.notes;
CREATE POLICY "notes_staff_insert"
  ON public.notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      WHERE sp.auth_user_id = auth.uid()
        AND sp.is_active = true
        AND sp.role NOT IN ('read_only_auditor')
    )
  );

-- -------------------------------------------------------
-- 10. Generic RLS: remaining tables (active staff read/write)
-- -------------------------------------------------------

-- admissions_documents
DROP POLICY IF EXISTS "docs_staff_access" ON public.admissions_documents;
CREATE POLICY "docs_staff_access"
  ON public.admissions_documents FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.staff_profiles sp WHERE sp.auth_user_id = auth.uid() AND sp.is_active = true));

-- behavioral_health_reviews (clinician + admin only)
DROP POLICY IF EXISTS "clinical_restricted_access" ON public.behavioral_health_reviews;
CREATE POLICY "clinical_restricted_access"
  ON public.behavioral_health_reviews FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.staff_profiles sp
    WHERE sp.auth_user_id = auth.uid()
      AND sp.is_active = true
      AND sp.role IN ('super_admin', 'executive_director', 'behavioral_health_clinician', 'admissions_committee_member')
  ));

-- committee_decisions (committee + admin only)
DROP POLICY IF EXISTS "committee_restricted_access" ON public.committee_decisions;
CREATE POLICY "committee_restricted_access"
  ON public.committee_decisions FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.staff_profiles sp
    WHERE sp.auth_user_id = auth.uid()
      AND sp.is_active = true
      AND sp.role IN ('super_admin', 'executive_director', 'admissions_committee_member')
  ));

-- welcome_day_records
DROP POLICY IF EXISTS "welcome_staff_access" ON public.welcome_day_records;
CREATE POLICY "welcome_staff_access"
  ON public.welcome_day_records FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.staff_profiles sp WHERE sp.auth_user_id = auth.uid() AND sp.is_active = true));

-- tasks
DROP POLICY IF EXISTS "tasks_staff_access" ON public.tasks;
CREATE POLICY "tasks_staff_access"
  ON public.tasks FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.staff_profiles sp WHERE sp.auth_user_id = auth.uid() AND sp.is_active = true));

-- activity_events
DROP POLICY IF EXISTS "events_staff_read" ON public.activity_events;
CREATE POLICY "events_staff_read"
  ON public.activity_events FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.staff_profiles sp WHERE sp.auth_user_id = auth.uid() AND sp.is_active = true));

DROP POLICY IF EXISTS "events_staff_insert" ON public.activity_events;
CREATE POLICY "events_staff_insert"
  ON public.activity_events FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.staff_profiles sp WHERE sp.auth_user_id = auth.uid() AND sp.is_active = true));

-- prescreen_submissions
DROP POLICY IF EXISTS "prescreen_staff_access" ON public.prescreen_submissions;
CREATE POLICY "prescreen_staff_access"
  ON public.prescreen_submissions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.staff_profiles sp WHERE sp.auth_user_id = auth.uid() AND sp.is_active = true));

-- admissions_interviews
DROP POLICY IF EXISTS "interviews_staff_access" ON public.admissions_interviews;
CREATE POLICY "interviews_staff_access"
  ON public.admissions_interviews FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.staff_profiles sp
    WHERE sp.auth_user_id = auth.uid()
      AND sp.is_active = true
      AND sp.role IN ('super_admin', 'executive_director', 'admissions_coordinator', 'admissions_interviewer', 'admissions_committee_member')
  ));

-- -------------------------------------------------------
-- Notes
-- -------------------------------------------------------
-- After running this migration:
-- 1. In Supabase Dashboard → Authentication → Email, verify:
--    - "Enable Email Confirmations" is ON
--    - Email templates are customized (see docs/rap-portal-supabase-auth-setup.md)
-- 2. In Authentication → Settings, set Site URL and redirect URLs:
--    - https://faith-haven-house-web.vercel.app
--    - https://faith-haven-house-web.vercel.app/auth/callback
--    - https://faith-haven-house-web.vercel.app/staff/reset-password
-- 3. In Authentication → MFA, enable TOTP
-- 4. Set SUPABASE_SERVICE_ROLE_KEY as a secret Vercel environment variable
