-- Security hardening pass
-- Tightens broad public policies added during early prototyping.

begin;

-- Keep RLS on for every table that stores guest or RSVP data.
alter table guests enable row level security;
alter table rooms enable row level security;
alter table room_assignments enable row level security;
alter table rsvp_responses enable row level security;
alter table gallery_photos enable row level security;

-- ---------------------------------------------------------------------------
-- Guests
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated users can manage guests" on guests;
drop policy if exists "Anyone can lookup guests by invite code" on guests;
drop policy if exists "Admin can manage guests" on guests;
drop policy if exists "Public can read guests" on guests;
drop policy if exists "Public can update guests" on guests;
drop policy if exists "guests_read_own" on guests;
drop policy if exists "Linked guests can read own guest record" on guests;

create policy "Linked guests can read own guest record"
  on guests for select
  to authenticated
  using (supabase_user_id = auth.uid());

-- No direct client update policy for guests. SECURITY DEFINER RPCs and the
-- service-role sync scripts remain responsible for invite claiming/admin work.

-- ---------------------------------------------------------------------------
-- RSVP responses
-- ---------------------------------------------------------------------------
drop policy if exists "Public can manage rsvp_responses" on rsvp_responses;
drop policy if exists "Anyone can submit RSVP" on rsvp_responses;
drop policy if exists "Anyone can update their RSVP" on rsvp_responses;
drop policy if exists "Anyone can view RSVP" on rsvp_responses;
drop policy if exists "Admin can manage RSVP responses" on rsvp_responses;
drop policy if exists "Anyone can submit an RSVP" on rsvp_responses;
drop policy if exists "Authenticated users can manage RSVP responses" on rsvp_responses;
drop policy if exists "Linked guests can read own rsvp_responses" on rsvp_responses;
drop policy if exists "Linked guests can insert own rsvp_responses" on rsvp_responses;
drop policy if exists "Linked guests can update own rsvp_responses" on rsvp_responses;
drop policy if exists "Linked guests can delete own rsvp_responses" on rsvp_responses;

create policy "Linked guests can read own rsvp_responses"
  on rsvp_responses for select
  to authenticated
  using (
    exists (
      select 1
        from guests g
       where g.id = rsvp_responses.guest_id
         and g.supabase_user_id = auth.uid()
    )
  );

create policy "Linked guests can insert own rsvp_responses"
  on rsvp_responses for insert
  to authenticated
  with check (
    exists (
      select 1
        from guests g
       where g.id = rsvp_responses.guest_id
         and g.supabase_user_id = auth.uid()
    )
  );

create policy "Linked guests can update own rsvp_responses"
  on rsvp_responses for update
  to authenticated
  using (
    exists (
      select 1
        from guests g
       where g.id = rsvp_responses.guest_id
         and g.supabase_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
        from guests g
       where g.id = rsvp_responses.guest_id
         and g.supabase_user_id = auth.uid()
    )
  );

create policy "Linked guests can delete own rsvp_responses"
  on rsvp_responses for delete
  to authenticated
  using (
    exists (
      select 1
        from guests g
       where g.id = rsvp_responses.guest_id
         and g.supabase_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Rooms and assignments
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated users can manage rooms" on rooms;
drop policy if exists "Admin can manage rooms" on rooms;
drop policy if exists "Anyone can view rooms" on rooms;
drop policy if exists "Public can read rooms" on rooms;
drop policy if exists "Authenticated users can read rooms" on rooms;
drop policy if exists "Authenticated users can manage room assignments" on room_assignments;
drop policy if exists "Anyone can view room assignments" on room_assignments;
drop policy if exists "Admin can manage room assignments" on room_assignments;
drop policy if exists "Public can read room assignments" on room_assignments;
drop policy if exists "Linked guests can read own room assignment" on room_assignments;

create policy "Authenticated users can read rooms"
  on rooms for select
  to authenticated
  using (true);

create policy "Linked guests can read own room assignment"
  on room_assignments for select
  to authenticated
  using (
    exists (
      select 1
        from guests g
       where g.id = room_assignments.guest_id
         and g.supabase_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Gallery metadata
-- ---------------------------------------------------------------------------
drop policy if exists "Anyone can view approved photos" on gallery_photos;
drop policy if exists "Guests can upload photos" on gallery_photos;
drop policy if exists "Guests can view own pending photos" on gallery_photos;
drop policy if exists "Admins can manage gallery" on gallery_photos;
drop policy if exists "Public can insert gallery photos" on gallery_photos;
drop policy if exists "Public can view approved gallery photos" on gallery_photos;
drop policy if exists "Anyone can upload photos" on gallery_photos;
drop policy if exists "Authenticated users can view approved gallery photos" on gallery_photos;
drop policy if exists "Linked guests can view own gallery photos" on gallery_photos;
drop policy if exists "Linked guests can insert own gallery photos" on gallery_photos;
drop policy if exists "Linked guests can delete own pending gallery photos" on gallery_photos;

create policy "Authenticated users can view approved gallery photos"
  on gallery_photos for select
  to authenticated
  using (moderation_status = 'approved');

create policy "Linked guests can view own gallery photos"
  on gallery_photos for select
  to authenticated
  using (
    exists (
      select 1
        from guests g
       where g.id = gallery_photos.guest_id
         and g.supabase_user_id = auth.uid()
    )
  );

create policy "Linked guests can insert own gallery photos"
  on gallery_photos for insert
  to authenticated
  with check (
    moderation_status = 'pending'
    and storage_path like guest_id::text || '/%'
    and exists (
      select 1
        from guests g
       where g.id = gallery_photos.guest_id
         and g.supabase_user_id = auth.uid()
    )
  );

create policy "Linked guests can delete own pending gallery photos"
  on gallery_photos for delete
  to authenticated
  using (
    moderation_status = 'pending'
    and exists (
      select 1
        from guests g
       where g.id = gallery_photos.guest_id
         and g.supabase_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Storage bucket and objects
-- ---------------------------------------------------------------------------
update storage.buckets
   set public = false,
       file_size_limit = 10485760,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
 where id = 'gallery';

drop policy if exists "Anyone can upload to gallery" on storage.objects;
drop policy if exists "Anyone can view gallery photos" on storage.objects;
drop policy if exists "Owners can delete their gallery photos" on storage.objects;
drop policy if exists "Linked guests can upload own gallery objects" on storage.objects;
drop policy if exists "Authenticated users can read gallery objects" on storage.objects;
drop policy if exists "Linked guests can delete own gallery objects" on storage.objects;

create policy "Linked guests can upload own gallery objects"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'gallery'
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp', 'gif')
    and exists (
      select 1
        from guests g
       where g.id::text = (storage.foldername(name))[1]
         and g.supabase_user_id = auth.uid()
    )
  );

create policy "Authenticated users can read gallery objects"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'gallery'
    and exists (
      select 1
        from gallery_photos gp
        left join guests g on g.id = gp.guest_id
       where gp.storage_path = storage.objects.name
         and (
           gp.moderation_status = 'approved'
           or g.supabase_user_id = auth.uid()
         )
    )
  );

create policy "Linked guests can delete own gallery objects"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'gallery'
    and exists (
      select 1
        from guests g
       where g.id::text = (storage.foldername(name))[1]
         and g.supabase_user_id = auth.uid()
    )
  );

commit;
