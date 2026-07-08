-- Restore the CRM tables required by public pre-screen submissions and RAP.
-- This migration is compatible with production, where staff_profiles and
-- audit_logs already exist but the remaining CRM schema was never applied.

begin;

create extension if not exists pgcrypto;

create table if not exists public.applicants (
  id uuid primary key default gen_random_uuid(),
  legal_first_name text not null,
  legal_last_name text not null,
  preferred_name text,
  phone text not null,
  email text,
  preferred_contact_method text,
  city text,
  county text,
  referral_source text,
  current_housing_situation text,
  housing_urgency text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence if not exists public.admissions_case_number_seq start with 1;

create table if not exists public.admissions_cases (
  id uuid primary key default gen_random_uuid(),
  case_number text unique not null,
  status text not null check (status in (
    'initial_contact', 'pre_screen_received', 'staff_follow_up',
    'secure_documents_requested', 'documents_in_progress',
    'background_screening_pending', 'admissions_interview_pending',
    'behavioral_health_review_pending', 'committee_review_pending',
    'approved', 'approved_with_conditions', 'wait_list', 'deferred',
    'welcome_day_scheduled', 'admitted', 'closed'
  )),
  applicant_id uuid not null references public.applicants(id) on delete cascade,
  assigned_coordinator_id uuid references public.staff_profiles(id) on delete set null,
  assigned_interviewer_id uuid references public.staff_profiles(id) on delete set null,
  assigned_clinician_id uuid references public.staff_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  welcome_day_date timestamptz,
  admitted_at timestamptz,
  closed_at timestamptz,
  closed_reason_category text
);

create table if not exists public.prescreen_submissions (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.applicants(id) on delete cascade,
  admissions_case_id uuid not null references public.admissions_cases(id) on delete cascade,
  requested_supports text[],
  primary_challenge text,
  six_to_twelve_month_goal text,
  structured_program_readiness text,
  roadmap_readiness text,
  substance_free_environment_readiness text,
  employment_status text,
  income_source text,
  has_government_id text,
  work_documents_status text,
  transportation_status text,
  immediate_support_flag text,
  support_organization_flag text,
  support_organization_contact_permission text,
  accommodation_request_preference text,
  safe_contact_details text,
  can_leave_message text,
  acknowledgements jsonb not null default '{}'::jsonb,
  additional_notes text,
  submitted_at timestamptz not null default now(),
  source text not null default 'web',
  submission_ip_hash text,
  reviewed_at timestamptz,
  reviewed_by uuid references public.staff_profiles(id) on delete set null
);

alter table public.prescreen_submissions
  add column if not exists admissions_case_id uuid references public.admissions_cases(id) on delete cascade;

create table if not exists public.document_types (
  id text primary key,
  binder_reference text,
  document_number text unique not null,
  title text not null,
  completed_by text not null,
  sensitivity text not null check (sensitivity in ('low', 'medium', 'high', 'restricted', 'clinical'))
);

create table if not exists public.admissions_documents (
  id uuid primary key default gen_random_uuid(),
  admissions_case_id uuid not null references public.admissions_cases(id) on delete cascade,
  document_type_id text not null references public.document_types(id),
  status text not null default 'not_requested' check (status in ('not_requested', 'requested', 'submitted', 'reviewed', 'complete')),
  requested_at timestamptz,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.staff_profiles(id) on delete set null,
  file_path text,
  file_name text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.screenings (
  id uuid primary key default gen_random_uuid(),
  admissions_case_id uuid not null references public.admissions_cases(id) on delete cascade,
  screening_type text not null check (screening_type in ('background_check', 'drug_alcohol_screen', 'behavioral_health_readiness')),
  status text not null check (status in ('pending', 'requested', 'completed', 'failed', 'passed', 'reviewed')),
  provider text,
  requested_at timestamptz,
  completed_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.staff_profiles(id) on delete set null,
  restricted_document_id uuid references public.admissions_documents(id) on delete set null,
  notes text
);

create table if not exists public.admissions_interviews (
  id uuid primary key default gen_random_uuid(),
  admissions_case_id uuid not null references public.admissions_cases(id) on delete cascade,
  interviewer_id uuid references public.staff_profiles(id) on delete set null,
  interview_date timestamptz not null,
  duration_category text,
  motivation_summary text,
  goals_summary text,
  strengths_observed text,
  follow_up_concerns text,
  program_fit_assessment text,
  recommendation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.behavioral_health_reviews (
  id uuid primary key default gen_random_uuid(),
  admissions_case_id uuid not null references public.admissions_cases(id) on delete cascade,
  clinician_id uuid references public.staff_profiles(id) on delete set null,
  readiness_outcome text not null,
  recommended_supports text,
  restricted_document_id uuid references public.admissions_documents(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.committee_decisions (
  id uuid primary key default gen_random_uuid(),
  admissions_case_id uuid not null references public.admissions_cases(id) on delete cascade,
  committee_review_date timestamptz not null,
  decision text not null,
  conditions_of_admission text,
  committee_comments text,
  chair_id uuid references public.staff_profiles(id) on delete set null,
  executive_director_id uuid references public.staff_profiles(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.welcome_day_records (
  id uuid primary key default gen_random_uuid(),
  admissions_case_id uuid not null references public.admissions_cases(id) on delete cascade,
  resident_id uuid,
  welcome_day_date timestamptz not null,
  staff_member_id uuid references public.staff_profiles(id) on delete set null,
  room_assignment text,
  admission_approved_confirmed boolean not null default false,
  bedroom_prepared boolean not null default false,
  entrance_access_created boolean not null default false,
  resident_file_complete boolean not null default false,
  identity_verified boolean not null default false,
  covenant_signed boolean not null default false,
  financial_snapshot_complete boolean not null default false,
  emergency_contact_complete boolean not null default false,
  access_code_assignment_complete boolean not null default false,
  house_tour_complete boolean not null default false,
  first_case_management_meeting_date timestamptz,
  prayer_offered_if_desired boolean not null default false,
  officially_admitted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  admissions_case_id uuid not null references public.admissions_cases(id) on delete cascade,
  title text not null,
  description text,
  assigned_to uuid references public.staff_profiles(id) on delete set null,
  due_date timestamptz,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'completed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_by uuid references public.staff_profiles(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  admissions_case_id uuid not null references public.admissions_cases(id) on delete cascade,
  author_id uuid references public.staff_profiles(id) on delete set null,
  visibility text not null check (visibility in ('general_staff', 'restricted_admissions', 'clinical_restricted', 'committee_restricted')),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  admissions_case_id uuid not null references public.admissions_cases(id) on delete cascade,
  event_type text not null,
  title text not null,
  summary text not null,
  actor_id uuid references public.staff_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  visibility text not null default 'general_staff' check (visibility in ('general_staff', 'restricted_admissions', 'clinical_restricted', 'committee_restricted'))
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.staff_profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  admissions_case_id uuid references public.admissions_cases(id) on delete set null,
  metadata_safe jsonb,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists admissions_cases_applicant_id_idx on public.admissions_cases(applicant_id);
create index if not exists admissions_cases_status_created_at_idx on public.admissions_cases(status, created_at desc);
create index if not exists admissions_cases_coordinator_idx on public.admissions_cases(assigned_coordinator_id);
create index if not exists prescreen_submissions_applicant_id_idx on public.prescreen_submissions(applicant_id);
create index if not exists prescreen_submissions_case_id_idx on public.prescreen_submissions(admissions_case_id);
create index if not exists tasks_case_id_idx on public.tasks(admissions_case_id);
create index if not exists tasks_assigned_to_idx on public.tasks(assigned_to);
create index if not exists activity_events_case_id_idx on public.activity_events(admissions_case_id);
create index if not exists admissions_documents_case_id_idx on public.admissions_documents(admissions_case_id);
create index if not exists screenings_case_id_idx on public.screenings(admissions_case_id);
create index if not exists admissions_interviews_case_id_idx on public.admissions_interviews(admissions_case_id);
create index if not exists behavioral_health_reviews_case_id_idx on public.behavioral_health_reviews(admissions_case_id);
create index if not exists committee_decisions_case_id_idx on public.committee_decisions(admissions_case_id);
create index if not exists welcome_day_records_case_id_idx on public.welcome_day_records(admissions_case_id);
create index if not exists notes_case_id_idx on public.notes(admissions_case_id);
create index if not exists audit_logs_case_id_idx on public.audit_logs(admissions_case_id);

create or replace function public.get_auth_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select sp.role
  from public.staff_profiles as sp
  where sp.auth_user_id = (select auth.uid())
    and sp.is_active is true
  limit 1;
$$;

revoke all on function public.get_auth_role() from public;
grant execute on function public.get_auth_role() to authenticated;

alter table public.applicants enable row level security;
alter table public.admissions_cases enable row level security;
alter table public.prescreen_submissions enable row level security;
alter table public.document_types enable row level security;
alter table public.admissions_documents enable row level security;
alter table public.screenings enable row level security;
alter table public.admissions_interviews enable row level security;
alter table public.behavioral_health_reviews enable row level security;
alter table public.committee_decisions enable row level security;
alter table public.welcome_day_records enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.activity_events enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists applicants_active_staff on public.applicants;
create policy applicants_active_staff on public.applicants for all to authenticated
  using ((select public.get_auth_role()) is not null and (select public.get_auth_role()) <> 'read_only_auditor')
  with check ((select public.get_auth_role()) in ('super_admin', 'executive_director', 'admissions_coordinator'));

drop policy if exists admissions_cases_active_staff on public.admissions_cases;
create policy admissions_cases_active_staff on public.admissions_cases for all to authenticated
  using ((select public.get_auth_role()) is not null)
  with check ((select public.get_auth_role()) in ('super_admin', 'executive_director', 'admissions_coordinator'));

drop policy if exists prescreens_active_staff on public.prescreen_submissions;
create policy prescreens_active_staff on public.prescreen_submissions for all to authenticated
  using ((select public.get_auth_role()) is not null and (select public.get_auth_role()) <> 'read_only_auditor')
  with check ((select public.get_auth_role()) in ('super_admin', 'executive_director', 'admissions_coordinator'));

drop policy if exists document_types_active_staff on public.document_types;
create policy document_types_active_staff on public.document_types for select to authenticated
  using ((select public.get_auth_role()) is not null);

drop policy if exists admissions_documents_active_staff on public.admissions_documents;
create policy admissions_documents_active_staff on public.admissions_documents for all to authenticated
  using ((select public.get_auth_role()) is not null)
  with check ((select public.get_auth_role()) is not null and (select public.get_auth_role()) <> 'read_only_auditor');

drop policy if exists screenings_active_staff on public.screenings;
create policy screenings_active_staff on public.screenings for all to authenticated
  using ((select public.get_auth_role()) is not null)
  with check ((select public.get_auth_role()) in ('super_admin', 'executive_director', 'admissions_coordinator', 'behavioral_health_clinician'));

drop policy if exists interviews_active_staff on public.admissions_interviews;
create policy interviews_active_staff on public.admissions_interviews for all to authenticated
  using ((select public.get_auth_role()) is not null)
  with check ((select public.get_auth_role()) in ('super_admin', 'executive_director', 'admissions_coordinator', 'admissions_interviewer'));

drop policy if exists behavioral_health_active_staff on public.behavioral_health_reviews;
create policy behavioral_health_active_staff on public.behavioral_health_reviews for all to authenticated
  using ((select public.get_auth_role()) in ('super_admin', 'executive_director', 'behavioral_health_clinician'))
  with check ((select public.get_auth_role()) in ('super_admin', 'behavioral_health_clinician'));

drop policy if exists committee_decisions_active_staff on public.committee_decisions;
create policy committee_decisions_active_staff on public.committee_decisions for all to authenticated
  using ((select public.get_auth_role()) in ('super_admin', 'executive_director', 'admissions_coordinator', 'admissions_committee_member'))
  with check ((select public.get_auth_role()) in ('super_admin', 'executive_director', 'admissions_committee_member'));

drop policy if exists welcome_day_active_staff on public.welcome_day_records;
create policy welcome_day_active_staff on public.welcome_day_records for all to authenticated
  using ((select public.get_auth_role()) is not null)
  with check ((select public.get_auth_role()) in ('super_admin', 'executive_director', 'admissions_coordinator', 'case_manager'));

drop policy if exists tasks_active_staff on public.tasks;
create policy tasks_active_staff on public.tasks for all to authenticated
  using ((select public.get_auth_role()) is not null)
  with check ((select public.get_auth_role()) is not null and (select public.get_auth_role()) <> 'read_only_auditor');

drop policy if exists notes_active_staff on public.notes;
create policy notes_active_staff on public.notes for all to authenticated
  using ((select public.get_auth_role()) is not null)
  with check ((select public.get_auth_role()) is not null and (select public.get_auth_role()) <> 'read_only_auditor');

drop policy if exists activity_events_active_staff on public.activity_events;
create policy activity_events_active_staff on public.activity_events for all to authenticated
  using ((select public.get_auth_role()) is not null)
  with check ((select public.get_auth_role()) is not null and (select public.get_auth_role()) <> 'read_only_auditor');

drop policy if exists audit_logs_active_staff on public.audit_logs;
create policy audit_logs_active_staff on public.audit_logs for select to authenticated
  using ((select public.get_auth_role()) in ('super_admin', 'read_only_auditor'));

revoke all on public.applicants, public.admissions_cases, public.prescreen_submissions,
  public.document_types, public.admissions_documents, public.screenings,
  public.admissions_interviews, public.behavioral_health_reviews,
  public.committee_decisions, public.welcome_day_records, public.tasks,
  public.notes, public.activity_events from anon;

grant select, insert, update, delete on public.applicants, public.admissions_cases,
  public.prescreen_submissions, public.admissions_documents, public.screenings,
  public.admissions_interviews, public.behavioral_health_reviews,
  public.committee_decisions, public.welcome_day_records, public.tasks,
  public.notes, public.activity_events to authenticated;
grant select on public.document_types, public.audit_logs to authenticated;

create or replace function public.create_prescreen_admission(p_payload jsonb)
returns table (
  case_id uuid,
  case_number text,
  applicant_id uuid,
  first_name text,
  duplicate_flag boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_applicant_id uuid;
  v_case_id uuid;
  v_case_number text;
  v_coordinator_id uuid;
  v_duplicate boolean := false;
  v_email text := nullif(lower(trim(p_payload->>'email')), '');
  v_phone_digits text := regexp_replace(coalesce(p_payload->>'phone', ''), '\D', '', 'g');
begin
  select a.id into v_applicant_id
  from public.applicants a
  where (v_email is not null and lower(a.email) = v_email)
     or (v_phone_digits <> '' and regexp_replace(a.phone, '\D', '', 'g') = v_phone_digits)
  order by a.created_at
  limit 1;

  if v_applicant_id is not null then
    v_duplicate := true;
  else
    insert into public.applicants (
      legal_first_name, legal_last_name, phone, email,
      preferred_contact_method, city, referral_source,
      current_housing_situation, housing_urgency
    ) values (
      trim(p_payload->>'firstName'), trim(p_payload->>'lastName'),
      trim(p_payload->>'phone'), v_email,
      trim(p_payload->>'contactMethod'), trim(p_payload->>'cityCounty'),
      trim(p_payload->>'referralSource'), trim(p_payload->>'housingSituation'),
      trim(p_payload->>'timeframe')
    ) returning id into v_applicant_id;
  end if;

  select sp.id into v_coordinator_id
  from public.staff_profiles sp
  where sp.is_active is true and sp.role = 'admissions_coordinator'
  order by sp.created_at
  limit 1;

  v_case_number := 'FHH-ADM-' || to_char(current_date, 'YYYY') || '-' ||
    lpad(nextval('public.admissions_case_number_seq')::text, 6, '0');

  insert into public.admissions_cases (
    case_number, status, applicant_id, assigned_coordinator_id
  ) values (
    v_case_number, 'pre_screen_received', v_applicant_id, v_coordinator_id
  ) returning id into v_case_id;

  insert into public.prescreen_submissions (
    applicant_id, admissions_case_id, requested_supports, primary_challenge,
    six_to_twelve_month_goal, structured_program_readiness,
    roadmap_readiness, substance_free_environment_readiness,
    employment_status, income_source, has_government_id,
    work_documents_status, transportation_status, immediate_support_flag,
    support_organization_flag, support_organization_contact_permission,
    accommodation_request_preference, safe_contact_details,
    can_leave_message, acknowledgements, additional_notes, source
  ) values (
    v_applicant_id, v_case_id,
    array(select jsonb_array_elements_text(coalesce(p_payload->'requestedSupports', '[]'::jsonb))),
    p_payload->>'primaryChallenge', p_payload->>'futureGoals',
    p_payload->>'willingStructured', p_payload->>'willingRoadmap',
    p_payload->>'willingSubstanceFree', p_payload->>'employmentStatus',
    p_payload->>'incomeSource', p_payload->>'hasPhotoId',
    p_payload->>'hasWorkDocs', p_payload->>'transportationStatus',
    p_payload->>'immediateCrisis', p_payload->>'workingWithOrg',
    p_payload->>'permissionContactOrg', p_payload->>'needsAccommodation',
    p_payload->>'safeContactDetails', p_payload->>'canContactMessage',
    coalesce(p_payload->'acknowledgements', '{}'::jsonb),
    case when v_duplicate then
      concat_ws(E'\n', nullif(p_payload->>'additionalNotes', ''), 'Possible duplicate applicant match detected.')
    else nullif(p_payload->>'additionalNotes', '') end,
    'web'
  );

  insert into public.activity_events (
    admissions_case_id, event_type, title, summary, actor_id
  ) values (
    v_case_id, 'pre_screen_received', 'Pre-Screen Submission Received',
    case when v_duplicate
      then 'Public pre-screen received; possible duplicate applicant match flagged for staff review.'
      else 'Public pre-screen received through the Faith Haven House website.'
    end,
    null
  );

  insert into public.tasks (
    admissions_case_id, title, description, assigned_to,
    due_date, status, priority, created_by
  ) values (
    v_case_id, 'Review pre-screen answers',
    'Review the public pre-screen, verify duplicate status, and initiate staff contact.',
    v_coordinator_id, now() + interval '48 hours', 'todo', 'high', null
  );

  insert into public.audit_logs (
    actor_id, action, entity_type, entity_id,
    admissions_case_id, metadata_safe, ip_hash
  ) values (
    null, 'applicant_record_created', 'admissions_case', v_case_id::text,
    v_case_id, jsonb_build_object('source', 'web_portal', 'duplicate', v_duplicate),
    'server-generated'
  );

  return query select v_case_id, v_case_number, v_applicant_id,
    trim(p_payload->>'firstName'), v_duplicate;
end;
$$;

revoke execute on function public.create_prescreen_admission(jsonb) from public, anon, authenticated;
grant execute on function public.create_prescreen_admission(jsonb) to service_role;

commit;
