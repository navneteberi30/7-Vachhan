-- ── RSVP Invite Gate ──────────────────────────────────────────────────────────
-- Restrict rsvp_responses to authenticated users whose linked guest record
-- (guests.supabase_user_id = auth.uid()) owns the row. Replaces the broad
-- "Public can manage rsvp_responses" policy from migration 004.
--
-- Net effect: a Google-signed-in visitor with no claimed invite code cannot
-- read or write RSVP rows, even if they bypass the UI. Only users who have
-- successfully called claim_invite_code() — meaning they typed a real invite
-- code — can RSVP.

-- Drop the permissive policy that left RSVP open to anyone.
drop policy if exists "Public can manage rsvp_responses" on rsvp_responses;
drop policy if exists "Anyone can submit RSVP"            on rsvp_responses;
drop policy if exists "Anyone can update their RSVP"      on rsvp_responses;
drop policy if exists "Anyone can view RSVP"              on rsvp_responses;
drop policy if exists "Admin can manage RSVP responses"   on rsvp_responses;
drop policy if exists "Anyone can submit an RSVP"         on rsvp_responses;

-- Read your own RSVPs.
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

-- Insert RSVPs only for the guest record you've claimed.
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

-- Update only your own RSVPs, and you can't move them to another guest.
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

-- Delete only your own RSVPs.
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
