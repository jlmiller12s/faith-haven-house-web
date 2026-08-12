-- Workflow reasons are stored in activity-event summaries. Permit staff to
-- remove only the summary text on their own status events; leadership may do
-- the same for any status event. The event itself remains immutable.

drop policy if exists activity_events_active_staff on public.activity_events;
drop policy if exists activity_events_update_note_author_or_leadership on public.activity_events;

revoke update on public.activity_events from authenticated;
grant update (summary) on public.activity_events to authenticated;

create policy activity_events_update_note_author_or_leadership
  on public.activity_events
  for update
  to authenticated
  using (
    event_type = 'status_changed'
    and position(' Reason / notes: ' in summary) > 0
    and (
      actor_id in (
        select sp.id
        from public.staff_profiles sp
        where sp.auth_user_id = auth.uid()
          and sp.is_active = true
      )
      or exists (
        select 1
        from public.staff_profiles sp
        where sp.auth_user_id = auth.uid()
          and sp.is_active = true
          and sp.role in ('super_admin', 'executive_director')
      )
    )
  )
  with check (
    event_type = 'status_changed'
    and (
      actor_id in (
        select sp.id
        from public.staff_profiles sp
        where sp.auth_user_id = auth.uid()
          and sp.is_active = true
      )
      or exists (
        select 1
        from public.staff_profiles sp
        where sp.auth_user_id = auth.uid()
          and sp.is_active = true
          and sp.role in ('super_admin', 'executive_director')
      )
    )
  );
