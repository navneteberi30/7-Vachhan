-- Allow admins to delete any gallery_photos row (orphan cleanup, moderation).
-- Without this, only the uploader can delete their own pending rows.

drop policy if exists "Admins can delete gallery photos" on gallery_photos;

create policy "Admins can delete gallery photos"
  on gallery_photos for delete
  to authenticated
  using (
    exists (
      select 1
        from public.guests g
       where g.supabase_user_id = auth.uid()
         and coalesce(g.is_admin, false) = true
    )
  );
