-- Admin role (Nav / organizers): allow moderation, guest management, rooms, RSVP visibility.
-- Run after 013 (gallery uploads).

begin;

alter table guests add column if not exists is_admin boolean default false;

update guests
   set is_admin = true
 where supabase_user_id = '1d53dc3d-20bc-4482-9ad9-cfda9508e870';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.guests
     where supabase_user_id = auth.uid()
       and coalesce(is_admin, false) = true
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- Gallery: admins see every row (moderation queue + audit)
drop policy if exists "Admins can view all gallery photos" on gallery_photos;
create policy "Admins can view all gallery photos"
  on gallery_photos for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update gallery photos" on gallery_photos;
create policy "Admins can update gallery photos"
  on gallery_photos for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Guests: full CRUD for admins (invite codes, edits)
drop policy if exists "Admins can manage guests" on guests;
create policy "Admins can manage guests"
  on guests for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Rooms & assignments
drop policy if exists "Admins can manage rooms" on rooms;
create policy "Admins can manage rooms"
  on rooms for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can manage room assignments" on room_assignments;
create policy "Admins can manage room assignments"
  on room_assignments for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- RSVP: read-only for admins (guests manage their own rows via existing policies)
drop policy if exists "Admins can read all rsvp_responses" on rsvp_responses;
create policy "Admins can read all rsvp_responses"
  on rsvp_responses for select
  to authenticated
  using (public.is_admin());

-- Storage: admins can preview any file in the gallery bucket for moderation UI
drop policy if exists "Admins can read all gallery objects" on storage.objects;
create policy "Admins can read all gallery objects"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'gallery' and public.is_admin());

commit;
