begin;

create table if not exists public.electronic_intake_forms (
  id uuid primary key default gen_random_uuid(),
  admissions_case_id uuid not null references public.admissions_cases(id) on delete cascade,
  document_type_id text not null references public.document_types(id),
  form_version text not null,
  status text not null default 'draft' check (status in ('draft', 'completed')),
  responses jsonb not null default '{}'::jsonb,
  created_by uuid references public.staff_profiles(id) on delete set null,
  updated_by uuid references public.staff_profiles(id) on delete set null,
  completed_by uuid references public.staff_profiles(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (admissions_case_id, document_type_id)
);

create index if not exists electronic_intake_forms_case_id_idx
  on public.electronic_intake_forms(admissions_case_id);

create unique index if not exists screenings_case_type_unique_idx
  on public.screenings(admissions_case_id, screening_type);

alter table public.electronic_intake_forms enable row level security;

drop policy if exists electronic_intake_forms_active_staff on public.electronic_intake_forms;
create policy electronic_intake_forms_active_staff on public.electronic_intake_forms
  for select to authenticated
  using (
    case
      when document_type_id = 'doc-5' then (select public.get_auth_role()) in ('super_admin', 'executive_director', 'admissions_coordinator', 'admissions_interviewer')
      when document_type_id = 'doc-6' then (select public.get_auth_role()) in ('super_admin', 'behavioral_health_clinician')
      when document_type_id = 'doc-7' then (select public.get_auth_role()) in ('super_admin', 'executive_director', 'admissions_coordinator', 'admissions_committee_member')
      when document_type_id = 'doc-8' then (select public.get_auth_role()) in ('super_admin', 'executive_director', 'admissions_coordinator', 'case_manager')
      else (select public.get_auth_role()) in ('super_admin', 'executive_director', 'admissions_coordinator', 'admissions_interviewer')
    end
  );

-- Electronic forms are read and written through the authenticated server route,
-- which derives staff identity and validates completion. Direct browser access is
-- intentionally withheld so legal-form attribution cannot be client supplied.
revoke all on public.electronic_intake_forms from anon, authenticated;

commit;
