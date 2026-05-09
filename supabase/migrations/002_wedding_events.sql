-- Migration 002: Wedding Events, Gallery, and Schema Updates
-- Run via: supabase db push

-- ─── Add invite_code & mobile to guests ────────────────────────────────────
alter table guests
  add column if not exists invite_code text unique,
  add column if not exists mobile      text;

-- ─── Events ────────────────────────────────────────────────────────────────
create table if not exists events (
  id            uuid primary key default uuid_generate_v4(),
  slug          text not null unique,   -- e.g. 'haldi', 'cocktail'
  name          text not null,
  event_date    date not null,
  event_time    text not null,          -- display string e.g. "10:30 AM — 1:30 PM"
  theme_label   text,                   -- e.g. "Morning Sun"
  venue_name    text,
  venue_address text,
  dress_code    text,
  description   text,
  icon          text,                   -- Material Symbol name
  sort_order    integer default 0,
  created_at    timestamptz default now()
);

-- ─── Fix rsvp_responses: make it per-event ─────────────────────────────────
-- Drop the old single-RSVP-per-guest constraint and add event_id
alter table rsvp_responses
  drop constraint if exists rsvp_responses_guest_id_key;

alter table rsvp_responses
  add column if not exists event_id    uuid references events(id) on delete cascade,
  add column if not exists guest_count integer not null default 1;

-- Ensure one RSVP per guest per event
create unique index if not exists rsvp_responses_guest_event
  on rsvp_responses (guest_id, event_id);

-- ─── Gallery Photos ────────────────────────────────────────────────────────
create table if not exists gallery_photos (
  id                uuid primary key default uuid_generate_v4(),
  guest_id          uuid references guests(id) on delete cascade,
  event_tag         text,               -- 'haldi' | 'cocktail' | 'mehndi' | 'wedding'
  storage_path      text not null,      -- Supabase Storage object path
  public_url        text,               -- cached public URL
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending', 'approved', 'rejected')),
  uploaded_at       timestamptz default now()
);

-- ─── RLS for new tables ────────────────────────────────────────────────────
alter table events         enable row level security;
alter table gallery_photos enable row level security;

-- Events are public (all authenticated + anon can read)
create policy "Anyone can read events"
  on events for select to anon, authenticated using (true);

create policy "Authenticated admins can manage events"
  on events for all to authenticated using (true) with check (true);

-- Gallery: anyone can view approved photos; guests can upload their own
create policy "Anyone can view approved photos"
  on gallery_photos for select to anon, authenticated
  using (moderation_status = 'approved');

create policy "Guests can upload photos"
  on gallery_photos for insert to anon, authenticated
  with check (true);

create policy "Guests can view own pending photos"
  on gallery_photos for select to authenticated
  using (true);

create policy "Admins can manage gallery"
  on gallery_photos for all to authenticated using (true) with check (true);

-- ─── Seed event data ───────────────────────────────────────────────────────
insert into events (slug, name, event_date, event_time, theme_label, venue_name, venue_address, dress_code, description, icon, sort_order)
values
  ('haldi',    'Haldi Ceremony',  '2026-12-12', '10:30 AM — 1:30 PM', 'Morning Sun',
   'Sunlit Courtyard', 'The Oberoi Grand, Kolkata',
   'Yellow Festive / Ethnic',
   'A playful morning of yellow hues, marigold showers, and turmeric blessings as we prepare for the main ceremony.',
   'brightness_7', 1),

  ('cocktail', 'Cocktail Night',  '2026-12-12', '8:00 PM onwards',    'Midnight Glow',
   'Rajendra Hall', 'ITC Grand Chola, Chennai',
   'Black Tie / Glamorous',
   'An evening of glamorous attire, signature drinks, and toasts to the future. Let''s dance under the moonlit sky.',
   'wine_bar', 2),

  ('mehndi',   'Mehndi Day',      '2026-12-13', '2:00 PM onwards',    'Afternoon Bliss',
   'Lakeside Pavilion', 'Serene View Drive, West Hills',
   'Traditional / Vibrant Colors',
   'Traditional henna artistry accompanied by folk music and vibrant colors. A soulful celebration of heritage.',
   'draw', 3),

  ('wedding',  'The Wedding Day', '2026-12-14', '5:30 PM onwards',    'Eternal Vows',
   'The Royal Ballroom', 'Umaid Bhawan, Jodhpur',
   'Formal / Ethnic Formal',
   'The main ceremony where we exchange vows and begin our forever. Grand feast and reception to follow.',
   'favorite', 4)

on conflict (slug) do nothing;
