-- Fix 400 errors on createSignedUrl for gallery images.
-- Safe to run even if 014 already applied.

alter table guests add column if not exists is_admin boolean default false;

update guests
   set is_admin = true
 where supabase_user_id = '1d53dc3d-20bc-4482-9ad9-cfda9508e870';

-- 1) Legacy rows: paths like "{auth_uid}/{file}.jpg" may have uploader_auth_uid NULL
--    after partial migrations — storage RLS requires approved OR uploader_auth_uid = auth.uid().
-- 2) Admin storage read: use an inlined EXISTS on guests (own row) so signed URLs work
--    even if public.is_admin() behaves oddly in the Storage API context.

-- ── Backfill uploader from first path segment when it is a UUID (old upload layout) ──
update gallery_photos gp
   set uploader_auth_uid = (split_part(gp.storage_path, '/', 1))::uuid
 where gp.uploader_auth_uid is null
   and split_part(gp.storage_path, '/', 1)
       ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- ── Admin read on storage: prefer inlined check (session sees own guests row via RLS) ──
drop policy if exists "Admins can read all gallery objects" on storage.objects;

create policy "Admins can read all gallery objects"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'gallery'
    and exists (
      select 1
        from public.guests g
       where g.supabase_user_id = auth.uid()
         and coalesce(g.is_admin, false) = true
    )
  );
