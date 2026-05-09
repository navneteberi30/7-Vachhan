-- Storage policies for the gallery bucket
-- Run in Supabase SQL Editor

-- Anyone can upload photos
create policy "Anyone can upload to gallery"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'gallery');

-- Anyone can read/view photos
create policy "Anyone can view gallery photos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'gallery');

-- Guests can delete their own uploads
create policy "Owners can delete their gallery photos"
  on storage.objects for delete
  to anon, authenticated
  using (bucket_id = 'gallery');
