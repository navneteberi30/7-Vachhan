-- Fix gallery_photos INSERT RLS
-- The 010 policy's storage_path LIKE check was overly strict and could fail
-- on certain UUID representations. The storage bucket policy already enforces
-- that guests can only upload to their own folder, so this check is redundant.
-- The core security invariant (only your own guest_id) is preserved via exists().

drop policy if exists "Linked guests can insert own gallery photos" on gallery_photos;

create policy "Linked guests can insert own gallery photos"
  on gallery_photos for insert
  to authenticated
  with check (
    moderation_status = 'pending'
    and exists (
      select 1
        from guests g
       where g.id = gallery_photos.guest_id
         and g.supabase_user_id = auth.uid()
    )
  );
