-- Replace the broad catch-all notes policy so deletion is limited to the note
-- author or admissions leadership. Existing scoped read and insert policies
-- continue to govern visibility and note creation.

drop policy if exists notes_active_staff on public.notes;
drop policy if exists notes_delete_author_or_leadership on public.notes;

create policy notes_delete_author_or_leadership
  on public.notes
  for delete
  to authenticated
  using (
    author_id in (
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
  );
