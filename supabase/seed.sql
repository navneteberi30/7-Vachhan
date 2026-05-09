-- Seed data for local development
-- Run via: supabase db reset  (applies migrations then seed)

-- ─── Rooms ─────────────────────────────────────────────────────────────────
insert into rooms (room_number, capacity) values
  ('101', 2),
  ('102', 2),
  ('103', 3),
  ('104', 2),
  ('105', 4)
on conflict (room_number) do nothing;

-- ─── Guests ────────────────────────────────────────────────────────────────
insert into guests (name, email, phone, rsvp_status, dietary_restrictions) values
  ('Alice Johnson',  'alice@example.com',  '+1-555-0101', 'confirmed',  null),
  ('Bob Smith',      'bob@example.com',    '+1-555-0102', 'confirmed',  'Gluten-free'),
  ('Carol Williams', 'carol@example.com',  '+1-555-0103', 'pending',    null),
  ('David Brown',    'david@example.com',  '+1-555-0104', 'declined',   null),
  ('Eva Martinez',   'eva@example.com',    '+1-555-0105', 'confirmed',  'Vegan'),
  ('Frank Lee',      'frank@example.com',  '+1-555-0106', 'pending',    null)
on conflict (email) do nothing;

-- ─── RSVP Responses ────────────────────────────────────────────────────────
insert into rsvp_responses (guest_id, attending, meal_choice, dietary_notes)
select id, true, 'chicken', null  from guests where email = 'alice@example.com'
on conflict (guest_id) do nothing;

insert into rsvp_responses (guest_id, attending, meal_choice, dietary_notes)
select id, true, 'fish', 'No gluten please'  from guests where email = 'bob@example.com'
on conflict (guest_id) do nothing;

insert into rsvp_responses (guest_id, attending, meal_choice, dietary_notes)
select id, false, null, null  from guests where email = 'david@example.com'
on conflict (guest_id) do nothing;
