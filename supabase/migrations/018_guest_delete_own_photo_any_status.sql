-- Guests may delete their own uploads whether pending, approved, or rejected.
-- Storage delete policy no longer requires pending — delete storage before DB row so EXISTS still matches.

drop policy if exists "Authenticated users can delete own pending gallery photos" on gallery_photos;
drop policy if exists "Authenticated users can delete own gallery photos" on gallery_photos;

create policy "Authenticated users can delete own gallery photos"
  on gallery_photos for delete
  to authenticated
  using (uploader_auth_uid = auth.uid());

drop policy if exists "Authenticated users can delete own gallery objects" on storage.objects;

create policy "Authenticated users can delete own gallery objects"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'gallery'
    and exists (
      select 1 from gallery_photos gp
       where gp.storage_path = storage.objects.name
         and gp.uploader_auth_uid = auth.uid()
    )
  );
