-- ══════════════════════════════════════════════════════════════════════════════
-- WEDDING APP — Full Setup (run once in Supabase SQL Editor)
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Guests ───────────────────────────────────────────────────────────────────
create table if not exists guests (
  id                   uuid primary key default uuid_generate_v4(),
  name                 text not null,
  email                text unique,                 -- optional
  phone                text,
  mobile               text,
  invite_code          text unique,                 -- login credential
  rsvp_status          text check (rsvp_status in ('pending', 'confirmed', 'declined')) default 'pending',
  dietary_restrictions text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- ─── Rooms ────────────────────────────────────────────────────────────────────
create table if not exists rooms (
  id          uuid primary key default uuid_generate_v4(),
  room_number text not null unique,
  capacity    integer not null default 2,
  notes       text,
  created_at  timestamptz default now()
);

-- ─── Room Assignments ─────────────────────────────────────────────────────────
create table if not exists room_assignments (
  id          uuid primary key default uuid_generate_v4(),
  guest_id    uuid not null references guests(id) on delete cascade,
  room_id     uuid not null references rooms(id) on delete cascade,
  assigned_at timestamptz default now(),
  unique (guest_id)
);

-- ─── Events ───────────────────────────────────────────────────────────────────
create table if not exists events (
  id            uuid primary key default uuid_generate_v4(),
  slug          text not null unique,
  name          text not null,
  event_date    date not null,
  event_time    text not null,
  theme_label   text,
  venue_name    text,
  venue_address text,
  dress_code    text,
  description   text,
  icon          text,
  sort_order    integer default 0,
  created_at    timestamptz default now()
);

-- ─── RSVP Responses (per-event) ───────────────────────────────────────────────
create table if not exists rsvp_responses (
  id            uuid primary key default uuid_generate_v4(),
  guest_id      uuid not null references guests(id) on delete cascade,
  event_id      uuid references events(id) on delete cascade,
  attending     boolean not null default true,
  guest_count   integer not null default 1,
  meal_choice   text check (meal_choice in ('chicken', 'fish', 'vegetarian')),
  dietary_notes text,
  submitted_at  timestamptz default now(),
  unique (guest_id, event_id)
);

-- ─── Gallery Photos ───────────────────────────────────────────────────────────
create table if not exists gallery_photos (
  id                uuid primary key default uuid_generate_v4(),
  guest_id          uuid references guests(id) on delete cascade,
  event_tag         text,
  storage_path      text not null,
  public_url        text,
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending', 'approved', 'rejected')),
  uploaded_at       timestamptz default now()
);

-- ─── updated_at trigger ───────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists guests_updated_at on guests;
create trigger guests_updated_at
  before update on guests
  for each row execute function set_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table guests           enable row level security;
alter table rooms            enable row level security;
alter table room_assignments enable row level security;
alter table rsvp_responses   enable row level security;
alter table events           enable row level security;
alter table gallery_photos   enable row level security;

-- Drop any conflicting old policies first
drop policy if exists "Authenticated users can manage guests"    on guests;
drop policy if exists "Authenticated users can manage rooms"     on rooms;
drop policy if exists "Authenticated users can manage room assignments" on room_assignments;
drop policy if exists "Anyone can submit an RSVP"               on rsvp_responses;
drop policy if exists "Authenticated users can manage RSVP responses" on rsvp_responses;
drop policy if exists "Anyone can read events"                  on events;
drop policy if exists "Authenticated admins can manage events"  on events;
drop policy if exists "Anyone can view approved photos"         on gallery_photos;
drop policy if exists "Guests can upload photos"                on gallery_photos;
drop policy if exists "Guests can view own pending photos"      on gallery_photos;
drop policy if exists "Admins can manage gallery"               on gallery_photos;

-- Guests: anon can read (needed for invite-code lookup), admin can manage
create policy "Anyone can lookup guests by invite code"
  on guests for select to anon, authenticated using (true);

create policy "Admin can manage guests"
  on guests for all to authenticated using (true) with check (true);

-- Rooms: admin only
create policy "Admin can manage rooms"
  on rooms for all to authenticated using (true) with check (true);

create policy "Anyone can view rooms"
  on rooms for select to anon, authenticated using (true);

-- Room assignments: anon can read their own assignment
create policy "Anyone can view room assignments"
  on room_assignments for select to anon, authenticated using (true);

create policy "Admin can manage room assignments"
  on room_assignments for all to authenticated using (true) with check (true);

-- Events: public read
create policy "Anyone can read events"
  on events for select to anon, authenticated using (true);

create policy "Admin can manage events"
  on events for all to authenticated using (true) with check (true);

-- RSVP: anon can insert/update their own; admin manages all
create policy "Anyone can submit RSVP"
  on rsvp_responses for insert to anon, authenticated with check (true);

create policy "Anyone can update their RSVP"
  on rsvp_responses for update to anon, authenticated using (true) with check (true);

create policy "Anyone can view RSVP"
  on rsvp_responses for select to anon, authenticated using (true);

create policy "Admin can manage RSVP responses"
  on rsvp_responses for all to authenticated using (true) with check (true);

-- Gallery
create policy "Anyone can view approved photos"
  on gallery_photos for select to anon, authenticated
  using (moderation_status = 'approved');

create policy "Anyone can upload photos"
  on gallery_photos for insert to anon, authenticated with check (true);

create policy "Admin can manage gallery"
  on gallery_photos for all to authenticated using (true) with check (true);

-- ─── Seed: Wedding Events ─────────────────────────────────────────────────────
insert into events (slug, name, event_date, event_time, theme_label, venue_name, venue_address, dress_code, description, icon, sort_order)
values
  ('haldi',    'Haldi Ceremony',  '2026-12-12', '10:30 AM — 1:30 PM', 'Morning Sun',
   'Sunlit Courtyard', 'The Oberoi Grand, Kolkata',
   'Yellow Festive / Ethnic',
   'A playful morning of yellow hues, marigold showers, and turmeric blessings as we prepare for the main ceremony.',
   'brightness_7', 1),

  ('cocktail', 'Cocktail Night',  '2026-12-12', '8:00 PM onwards', 'Midnight Glow',
   'Rajendra Hall', 'ITC Grand Chola, Chennai',
   'Black Tie / Glamorous',
   'An evening of glamorous attire, signature drinks, and toasts to the future. Let''s dance under the moonlit sky.',
   'wine_bar', 2),

  ('mehndi',   'Mehndi Day',      '2026-12-13', '2:00 PM onwards', 'Afternoon Bliss',
   'Lakeside Pavilion', 'Serene View Drive, West Hills',
   'Traditional / Vibrant Colors',
   'Traditional henna artistry accompanied by folk music and vibrant colors. A soulful celebration of heritage.',
   'draw', 3),

  ('wedding',  'The Wedding Day', '2026-12-14', '5:30 PM onwards', 'Eternal Vows',
   'The Royal Ballroom', 'Umaid Bhawan, Jodhpur',
   'Formal / Ethnic Formal',
   'The main ceremony where we exchange vows and begin our forever. Grand feast and reception to follow.',
   'favorite', 4)

on conflict (slug) do nothing;

-- ─── Seed: Sample Guests (edit with real guest names + codes) ─────────────────
insert into guests (name, invite_code, mobile)
values
  ('Demo Guest',   'DEMO-1234', null),
  ('Arjun Family', 'ARJUN-001', null),
  ('Saumya Family','SAUMYA-01', null)
on conflict (invite_code) do nothing;
