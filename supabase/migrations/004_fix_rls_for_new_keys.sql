-- Fix all RLS policies to use `public` instead of `anon, authenticated`
-- Required for new Supabase projects using sb_publishable_ key format

-- ─── guests ──────────────────────────────────────────────────────────────────
drop policy if exists "Anyone can lookup guests by invite code" on guests;
drop policy if exists "Admin can manage guests"                 on guests;

create policy "Public can read guests"
  on guests for select to public using (true);

create policy "Public can update guests"
  on guests for update to public using (true) with check (true);

-- ─── events ──────────────────────────────────────────────────────────────────
drop policy if exists "Anyone can read events"  on events;
drop policy if exists "Admin can manage events" on events;

create policy "Public can read events"
  on events for select to public using (true);

-- ─── rsvp_responses ──────────────────────────────────────────────────────────
drop policy if exists "Anyone can submit RSVP"         on rsvp_responses;
drop policy if exists "Anyone can update their RSVP"   on rsvp_responses;
drop policy if exists "Anyone can view RSVP"           on rsvp_responses;
drop policy if exists "Admin can manage RSVP responses" on rsvp_responses;
drop policy if exists "Anyone can submit an RSVP"      on rsvp_responses;

create policy "Public can manage rsvp_responses"
  on rsvp_responses for all to public using (true) with check (true);

-- ─── gallery_photos ──────────────────────────────────────────────────────────
drop policy if exists "Anyone can view approved photos"    on gallery_photos;
drop policy if exists "Anyone can upload photos"           on gallery_photos;
drop policy if exists "Guests can upload photos"           on gallery_photos;
drop policy if exists "Guests can view own pending photos" on gallery_photos;
drop policy if exists "Admins can manage gallery"          on gallery_photos;
drop policy if exists "Public can insert gallery photos"   on gallery_photos;
drop policy if exists "Public can view approved photos"    on gallery_photos;

create policy "Public can insert gallery photos"
  on gallery_photos for insert to public with check (true);

create policy "Public can view approved gallery photos"
  on gallery_photos for select to public
  using (moderation_status = 'approved');

-- ─── rooms & room_assignments ─────────────────────────────────────────────────
drop policy if exists "Anyone can view rooms"             on rooms;
drop policy if exists "Admin can manage rooms"            on rooms;
drop policy if exists "Anyone can view room assignments"  on room_assignments;
drop policy if exists "Admin can manage room assignments" on room_assignments;

create policy "Public can read rooms"
  on rooms for select to public using (true);

create policy "Public can read room assignments"
  on room_assignments for select to public using (true);
