-- Supabase Migrations: Initial Admissions CRM Schema
-- Migration ID: 20260707000000_init_crm_schema.sql

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABLES DEFINITIONS
-- =====================================================

-- Table: staff_profiles
CREATE TABLE public.staff_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- Nullable to support invites/pending registration
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN (
        'super_admin',
        'executive_director',
        'admissions_coordinator',
        'admissions_interviewer',
        'behavioral_health_clinician',
        'admissions_committee_member',
        'case_manager',
        'read_only_auditor'
    )),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: applicants
CREATE TABLE public.applicants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_first_name TEXT NOT NULL,
    legal_last_name TEXT NOT NULL,
    preferred_name TEXT,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    preferred_contact_method TEXT CHECK (preferred_contact_method IN ('phone', 'email', 'text')),
    city TEXT,
    county TEXT,
    referral_source TEXT,
    current_housing_situation TEXT,
    housing_urgency TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: admissions_cases
CREATE TABLE public.admissions_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL CHECK (status IN (
        'initial_contact',
        'pre_screen_received',
        'staff_follow_up',
        'secure_documents_requested',
        'documents_in_progress',
        'background_screening_pending',
        'drug_screening_pending',
        'admissions_interview_pending',
        'admissions_interview_complete',
        'behavioral_health_review_pending',
        'committee_review_pending',
        'wait_list',
        'deferred',
        'welcome_day_scheduled',
        'admitted',
        'closed'
    )),
    applicant_id UUID NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
    assigned_coordinator_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    assigned_interviewer_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    assigned_clinician_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    welcome_day_date TIMESTAMPTZ,
    admitted_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    closed_reason_category TEXT
);

-- Table: prescreen_submissions
CREATE TABLE public.prescreen_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
    requested_supports TEXT[],
    primary_challenge TEXT,
    six_to_twelve_month_goal TEXT,
    structured_program_readiness TEXT,
    roadmap_readiness TEXT,
    substance_free_environment_readiness TEXT,
    employment_status TEXT,
    income_source TEXT,
    has_government_id TEXT,
    work_documents_status TEXT,
    transportation_status TEXT,
    immediate_support_flag TEXT,
    support_organization_flag TEXT,
    support_organization_contact_permission TEXT,
    accommodation_request_preference TEXT,
    additional_notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    source TEXT NOT NULL DEFAULT 'web',
    submission_ip_hash TEXT NOT NULL,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL
);

-- Table: document_types
CREATE TABLE public.document_types (
    id TEXT PRIMARY KEY,
    binder_reference TEXT NOT NULL,
    document_number TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    completed_by TEXT NOT NULL,
    sensitivity TEXT NOT NULL CHECK (sensitivity IN ('low', 'medium', 'high', 'restricted', 'clinical'))
);

-- Table: admissions_documents
CREATE TABLE public.admissions_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admissions_case_id UUID NOT NULL REFERENCES public.admissions_cases(id) ON DELETE CASCADE,
    document_type_id TEXT NOT NULL REFERENCES public.document_types(id),
    status TEXT NOT NULL CHECK (status IN ('not_requested', 'requested', 'submitted', 'reviewed', 'complete')),
    requested_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    file_path TEXT,
    file_name TEXT,
    file_mime_type TEXT,
    file_size INTEGER,
    expires_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: screenings
CREATE TABLE public.screenings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admissions_case_id UUID NOT NULL REFERENCES public.admissions_cases(id) ON DELETE CASCADE,
    screening_type TEXT NOT NULL CHECK (screening_type IN ('background_check', 'drug_alcohol_screen', 'behavioral_health_readiness')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'requested', 'completed', 'failed', 'passed', 'reviewed')),
    provider TEXT,
    requested_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    restricted_document_id UUID REFERENCES public.admissions_documents(id) ON DELETE SET NULL,
    notes TEXT
);

-- Table: admissions_interviews
CREATE TABLE public.admissions_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admissions_case_id UUID NOT NULL REFERENCES public.admissions_cases(id) ON DELETE CASCADE,
    interviewer_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    interview_date TIMESTAMPTZ NOT NULL,
    duration_category TEXT,
    motivation_summary TEXT,
    goals_summary TEXT,
    strengths_observed TEXT,
    follow_up_concerns TEXT,
    recommendation TEXT NOT NULL CHECK (recommendation IN (
        'recommend_admission',
        'recommend_admission_with_conditions',
        'recommend_wait_list',
        'recommend_deferring_pending_information',
        'do_not_recommend'
    )),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: behavioral_health_reviews
CREATE TABLE public.behavioral_health_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admissions_case_id UUID NOT NULL REFERENCES public.admissions_cases(id) ON DELETE CASCADE,
    clinician_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    readiness_outcome TEXT NOT NULL CHECK (readiness_outcome IN (
        'appropriate_for_admission',
        'appropriate_with_supports',
        'defer_pending_additional_treatment',
        'recommend_alternative_level_of_care'
    )),
    recommended_supports TEXT,
    restricted_document_id UUID REFERENCES public.admissions_documents(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: committee_decisions
CREATE TABLE public.committee_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admissions_case_id UUID NOT NULL REFERENCES public.admissions_cases(id) ON DELETE CASCADE,
    committee_review_date TIMESTAMPTZ NOT NULL,
    decision TEXT NOT NULL CHECK (decision IN (
        'admit',
        'admit_with_conditions',
        'wait_list',
        'defer_pending_information_or_treatment',
        'decline_admission'
    )),
    conditions_of_admission TEXT,
    committee_comments TEXT,
    chair_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    executive_director_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: welcome_day_records
CREATE TABLE public.welcome_day_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admissions_case_id UUID NOT NULL REFERENCES public.admissions_cases(id) ON DELETE CASCADE,
    resident_id UUID, -- Links to active resident record once converted
    welcome_day_date TIMESTAMPTZ NOT NULL,
    staff_member_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    room_assignment TEXT,
    admission_approved_confirmed BOOLEAN NOT NULL DEFAULT false,
    bedroom_prepared BOOLEAN NOT NULL DEFAULT false,
    entrance_access_created BOOLEAN NOT NULL DEFAULT false,
    resident_file_complete BOOLEAN NOT NULL DEFAULT false,
    identity_verified BOOLEAN NOT NULL DEFAULT false,
    covenant_signed BOOLEAN NOT NULL DEFAULT false,
    financial_snapshot_complete BOOLEAN NOT NULL DEFAULT false,
    emergency_contact_complete BOOLEAN NOT NULL DEFAULT false,
    access_code_assignment_complete BOOLEAN NOT NULL DEFAULT false,
    house_tour_complete BOOLEAN NOT NULL DEFAULT false,
    first_case_management_meeting_date TIMESTAMPTZ,
    prayer_offered_if_desired BOOLEAN NOT NULL DEFAULT false,
    officially_admitted BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: tasks
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admissions_case_id UUID NOT NULL REFERENCES public.admissions_cases(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: notes
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admissions_case_id UUID NOT NULL REFERENCES public.admissions_cases(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    visibility TEXT NOT NULL CHECK (visibility IN ('general_staff', 'restricted_admissions', 'clinical_restricted', 'committee_restricted')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: activity_events (case timelines)
CREATE TABLE public.activity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admissions_case_id UUID NOT NULL REFERENCES public.admissions_cases(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    actor_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    visibility TEXT NOT NULL DEFAULT 'general_staff' CHECK (visibility IN ('general_staff', 'restricted_admissions', 'clinical_restricted', 'committee_restricted'))
);

-- Table: audit_logs (immutable logs)
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    admissions_case_id UUID REFERENCES public.admissions_cases(id) ON DELETE SET NULL,
    metadata_safe JSONB,
    ip_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 2. SECURITY HELPER FUNCTION
-- =====================================================

-- Get active role of currently authenticated user (running security definer to bypass recursion)
CREATE OR REPLACE FUNCTION public.get_auth_role() 
RETURNS TEXT AS $$
    SELECT role FROM public.staff_profiles 
    WHERE auth_user_id = auth.uid() AND is_active = true 
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescreen_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_health_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.welcome_day_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. staff_profiles Policies
CREATE POLICY staff_profiles_read_all ON public.staff_profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY staff_profiles_write_admin ON public.staff_profiles
    FOR ALL USING (public.get_auth_role() = 'super_admin');

-- 2. applicants Policies
CREATE POLICY applicants_read_staff ON public.applicants
    FOR SELECT USING (
        public.get_auth_role() IS NOT NULL 
        AND public.get_auth_role() != 'read_only_auditor'
    );

CREATE POLICY applicants_write_staff ON public.applicants
    FOR ALL USING (
        public.get_auth_role() IN ('super_admin', 'executive_director', 'admissions_coordinator')
    );

-- 3. admissions_cases Policies
CREATE POLICY cases_read_staff ON public.admissions_cases
    FOR SELECT USING (
        public.get_auth_role() IS NOT NULL 
        AND public.get_auth_role() != 'read_only_auditor'
    );

CREATE POLICY cases_write_staff ON public.admissions_cases
    FOR ALL USING (
        public.get_auth_role() IN ('super_admin', 'executive_director', 'admissions_coordinator')
    );

-- 4. prescreen_submissions Policies
CREATE POLICY prescreen_read_staff ON public.prescreen_submissions
    FOR SELECT USING (
        public.get_auth_role() IS NOT NULL 
        AND public.get_auth_role() != 'read_only_auditor'
    );

CREATE POLICY prescreen_insert_public ON public.prescreen_submissions
    FOR INSERT WITH CHECK (true); -- Public forms are allowed to insert

CREATE POLICY prescreen_write_staff ON public.prescreen_submissions
    FOR UPDATE USING (
        public.get_auth_role() IN ('super_admin', 'executive_director', 'admissions_coordinator')
    );

-- 5. document_types Policies
CREATE POLICY document_types_read ON public.document_types
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY document_types_write_admin ON public.document_types
    FOR ALL USING (public.get_auth_role() = 'super_admin');

-- 6. admissions_documents Policies
CREATE POLICY documents_read_authorized ON public.admissions_documents
    FOR SELECT USING (
        public.get_auth_role() IS NOT NULL
        AND public.get_auth_role() != 'read_only_auditor'
        -- Filter clinical files
        AND (
            SELECT sensitivity FROM public.document_types WHERE id = document_type_id
        ) != 'clinical' OR public.get_auth_role() IN ('super_admin', 'behavioral_health_clinician')
    );

CREATE POLICY documents_write_authorized ON public.admissions_documents
    FOR ALL USING (
        public.get_auth_role() IN ('super_admin', 'executive_director', 'admissions_coordinator', 'behavioral_health_clinician')
    );

-- 7. screenings Policies
CREATE POLICY screenings_read_authorized ON public.screenings
    FOR SELECT USING (
        public.get_auth_role() IS NOT NULL
        AND public.get_auth_role() != 'read_only_auditor'
    );

CREATE POLICY screenings_write_authorized ON public.screenings
    FOR ALL USING (
        public.get_auth_role() IN ('super_admin', 'executive_director', 'admissions_coordinator', 'behavioral_health_clinician')
    );

-- 8. admissions_interviews Policies
CREATE POLICY interviews_read_authorized ON public.admissions_interviews
    FOR SELECT USING (
        public.get_auth_role() IN ('super_admin', 'executive_director', 'admissions_coordinator', 'admissions_interviewer', 'admissions_committee_member')
    );

CREATE POLICY interviews_write_authorized ON public.admissions_interviews
    FOR ALL USING (
        public.get_auth_role() IN ('super_admin', 'admissions_interviewer', 'admissions_coordinator')
    );

-- 9. behavioral_health_reviews Policies (Restricted clinical table)
CREATE POLICY bh_reviews_read_clinician ON public.behavioral_health_reviews
    FOR SELECT USING (
        public.get_auth_role() IN ('super_admin', 'behavioral_health_clinician')
    );

CREATE POLICY bh_reviews_write_clinician ON public.behavioral_health_reviews
    FOR ALL USING (
        public.get_auth_role() IN ('super_admin', 'behavioral_health_clinician')
    );

-- 10. committee_decisions Policies
CREATE POLICY decisions_read_committee ON public.committee_decisions
    FOR SELECT USING (
        public.get_auth_role() IN ('super_admin', 'executive_director', 'admissions_coordinator', 'admissions_committee_member')
    );

CREATE POLICY decisions_write_committee ON public.committee_decisions
    FOR ALL USING (
        public.get_auth_role() IN ('super_admin', 'admissions_committee_member', 'executive_director')
    );

-- 11. welcome_day_records Policies
CREATE POLICY welcome_read_staff ON public.welcome_day_records
    FOR SELECT USING (
        public.get_auth_role() IS NOT NULL
        AND public.get_auth_role() != 'read_only_auditor'
    );

CREATE POLICY welcome_write_staff ON public.welcome_day_records
    FOR ALL USING (
        public.get_auth_role() IN ('super_admin', 'executive_director', 'admissions_coordinator', 'case_manager')
    );

-- 12. tasks Policies
CREATE POLICY tasks_read_staff ON public.tasks
    FOR SELECT USING (
        public.get_auth_role() IS NOT NULL
        AND public.get_auth_role() != 'read_only_auditor'
    );

CREATE POLICY tasks_write_staff ON public.tasks
    FOR ALL USING (
        public.get_auth_role() IS NOT NULL
        AND public.get_auth_role() != 'read_only_auditor'
    );

-- 13. notes Policies
CREATE POLICY notes_read_scoped ON public.notes
    FOR SELECT USING (
        public.get_auth_role() IS NOT NULL
        AND (
            visibility = 'general_staff'
            OR (visibility = 'restricted_admissions' AND public.get_auth_role() IN ('super_admin', 'executive_director', 'admissions_coordinator'))
            OR (visibility = 'clinical_restricted' AND public.get_auth_role() IN ('super_admin', 'behavioral_health_clinician'))
            OR (visibility = 'committee_restricted' AND public.get_auth_role() IN ('super_admin', 'executive_director', 'admissions_committee_member'))
        )
    );

CREATE POLICY notes_write_staff ON public.notes
    FOR INSERT WITH CHECK (
        public.get_auth_role() IS NOT NULL
        AND public.get_auth_role() != 'read_only_auditor'
    );

-- 14. activity_events Policies
CREATE POLICY events_read_scoped ON public.activity_events
    FOR SELECT USING (
        public.get_auth_role() IS NOT NULL
        AND (
            visibility = 'general_staff'
            OR (visibility = 'restricted_admissions' AND public.get_auth_role() IN ('super_admin', 'executive_director', 'admissions_coordinator'))
            OR (visibility = 'clinical_restricted' AND public.get_auth_role() IN ('super_admin', 'behavioral_health_clinician'))
            OR (visibility = 'committee_restricted' AND public.get_auth_role() IN ('super_admin', 'executive_director', 'admissions_committee_member'))
        )
    );

CREATE POLICY events_write_staff ON public.activity_events
    FOR INSERT WITH CHECK (
        public.get_auth_role() IS NOT NULL
        AND public.get_auth_role() != 'read_only_auditor'
    );

-- 15. audit_logs Policies (Immutable logs - read-only for super_admin & read_only_auditor)
CREATE POLICY audit_read_auditors ON public.audit_logs
    FOR SELECT USING (
        public.get_auth_role() IN ('super_admin', 'read_only_auditor')
    );

-- =====================================================
-- 4. DEVELOPER SEED / COMPLIANCE ADMIN PROVISIONING
-- =====================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Provision admin auth user
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'authenticated',
    'authenticated',
    'admin@faithhavenhouse.org',
    crypt('AdminPass123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

-- Link public staff profile for the admin auth user
INSERT INTO public.staff_profiles (
    id,
    auth_user_id,
    first_name,
    last_name,
    email,
    role,
    is_active
)
VALUES (
    'e6b7d8c9-fa1b-2c3d-4e5f-6a7b8c9d0e1f',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'RAP',
    'Administrator',
    'admin@faithhavenhouse.org',
    'super_admin',
    true
) ON CONFLICT (email) DO NOTHING;
