-- Wedding App — Initial Schema
-- Run via: supabase db push  OR  supabase migration up

-- ─── Extensions ────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Guests ────────────────────────────────────────────────────────────────
create table if not exists guests (
  id                   uuid primary key default uuid_generate_v4(),
  name                 text not null,
  email                text unique not null,
  phone                text,
  rsvp_status          text check (rsvp_status in ('pending', 'confirmed', 'declined')) default 'pending',
  dietary_restrictions text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- ─── Rooms ─────────────────────────────────────────────────────────────────
create table if not exists rooms (
  id          uuid primary key default uuid_generate_v4(),
  room_number text not null unique,
  capacity    integer not null default 2,
  notes       text,
  created_at  timestamptz default now()
);

-- ─── Room Assignments ───────────────────────────────────────────────────────
create table if not exists room_assignments (
  id         uuid primary key default uuid_generate_v4(),
  guest_id   uuid not null references guests(id) on delete cascade,
  room_id    uuid not null references rooms(id) on delete cascade,
  assigned_at timestamptz default now(),
  unique (guest_id)  -- one room per guest
);

-- ─── RSVP Responses ────────────────────────────────────────────────────────
create table if not exists rsvp_responses (
  id               uuid primary key default uuid_generate_v4(),
  guest_id         uuid not null references guests(id) on delete cascade,
  attending        boolean not null default true,
  meal_choice      text check (meal_choice in ('chicken', 'fish', 'vegetarian')),
  dietary_notes    text,
  submitted_at     timestamptz default now(),
  unique (guest_id)  -- one response per guest
);

-- ─── Updated-at trigger ────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger guests_updated_at
  before update on guests
  for each row execute function set_updated_at();

-- ─── Row Level Security ─────────────────────────────────────────────────────
-- Enable RLS (service role key in Python scripts bypasses these policies)
alter table guests         enable row level security;
alter table rooms          enable row level security;
alter table room_assignments enable row level security;
alter table rsvp_responses enable row level security;

-- Allow authenticated users (admin) full access
create policy "Authenticated users can manage guests"
  on guests for all to authenticated using (true) with check (true);

create policy "Authenticated users can manage rooms"
  on rooms for all to authenticated using (true) with check (true);

create policy "Authenticated users can manage room assignments"
  on room_assignments for all to authenticated using (true) with check (true);

-- Allow anyone to insert their own RSVP (public RSVP form)
create policy "Anyone can submit an RSVP"
  on rsvp_responses for insert to anon with check (true);

create policy "Authenticated users can manage RSVP responses"
  on rsvp_responses for all to authenticated using (true) with check (true);
