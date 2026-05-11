-- Fix storage.objects INSERT policy for gallery uploads.
-- Migration 010 created this policy but it may not have been applied to the
-- live DB. This migration is idempotent — safe to run even if 010 was applied.

-- Drop any stale variants first
drop policy if exists "Linked guests can upload own gallery objects"   on storage.objects;
drop policy if exists "Anyone can upload to gallery"                   on storage.objects;
drop policy if exists "Anyone can view gallery photos"                 on storage.objects;
drop policy if exists "Owners can delete their gallery photos"         on storage.objects;
drop policy if exists "Authenticated users can read gallery objects"   on storage.objects;
drop policy if exists "Linked guests can delete own gallery objects"   on storage.objects;

-- Allow a linked guest to upload to their own folder: {guest_id}/{filename}
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

-- Allow authenticated users to read objects (approved photos + own pending)
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

-- Allow a linked guest to delete their own pending uploads
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
