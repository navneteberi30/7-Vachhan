-- Open gallery uploads to all authenticated users (not just invite-code holders).
-- One invite code goes to one family, but the whole family should be able to share photos.
--
-- Key change: track uploads by auth UID (uploader_auth_uid) instead of guest FK.
-- guest_id is still set when the uploader is a linked guest, but is NULL otherwise.

-- ── 1. Add uploader_auth_uid column ──────────────────────────────────────────
alter table gallery_photos
  add column if not exists uploader_auth_uid uuid;

-- Backfill any existing rows from their linked guest record
update gallery_photos gp
   set uploader_auth_uid = g.supabase_user_id
  from guests g
 where g.id = gp.guest_id
   and gp.uploader_auth_uid is null;

-- ── 2. gallery_photos policies ───────────────────────────────────────────────
drop policy if exists "Linked guests can insert own gallery photos"             on gallery_photos;
drop policy if exists "Authenticated users can insert gallery photos"           on gallery_photos;
drop policy if exists "Authenticated users can view approved gallery photos"    on gallery_photos;
drop policy if exists "Linked guests can view own gallery photos"               on gallery_photos;
drop policy if exists "Authenticated users can view gallery photos"             on gallery_photos;
drop policy if exists "Linked guests can delete own pending gallery photos"     on gallery_photos;
drop policy if exists "Authenticated users can delete own pending gallery photos" on gallery_photos;

-- Any authenticated user can insert — uploader_auth_uid must equal their own UID
create policy "Authenticated users can insert gallery photos"
  on gallery_photos for insert
  to authenticated
  with check (
    moderation_status = 'pending'
    and uploader_auth_uid = auth.uid()
  );

-- See approved photos OR your own uploads
create policy "Authenticated users can view gallery photos"
  on gallery_photos for select
  to authenticated
  using (
    moderation_status = 'approved'
    or uploader_auth_uid = auth.uid()
  );

-- Delete only your own pending uploads
create policy "Authenticated users can delete own pending gallery photos"
  on gallery_photos for delete
  to authenticated
  using (
    moderation_status = 'pending'
    and uploader_auth_uid = auth.uid()
  );

-- ── 3. storage.objects policies ──────────────────────────────────────────────
drop policy if exists "Linked guests can upload own gallery objects"    on storage.objects;
drop policy if exists "Authenticated users can upload to gallery"       on storage.objects;
drop policy if exists "Authenticated users can read gallery objects"    on storage.objects;
drop policy if exists "Linked guests can delete own gallery objects"    on storage.objects;
drop policy if exists "Authenticated users can delete own gallery objects" on storage.objects;

-- Any authenticated user can upload to gallery
create policy "Authenticated users can upload to gallery"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'gallery');

-- Read: approved photos OR photos you uploaded (checked via gallery_photos row)
create policy "Authenticated users can read gallery objects"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'gallery'
    and exists (
      select 1 from gallery_photos gp
       where gp.storage_path = storage.objects.name
         and (
           gp.moderation_status = 'approved'
           or gp.uploader_auth_uid = auth.uid()
         )
    )
  );

-- Delete: validate ownership via gallery_photos (event_name/user_name/uuid path can't be
-- checked by folder position alone, so we cross-reference the DB record)
create policy "Authenticated users can delete own gallery objects"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'gallery'
    and exists (
      select 1 from gallery_photos gp
       where gp.storage_path = storage.objects.name
         and gp.uploader_auth_uid = auth.uid()
         and gp.moderation_status = 'pending'
    )
  );
