-- Remove seed "Demo Guest" — not needed for production.
-- Related rows (RSVP, gallery, room assignments) cascade on delete.

delete from guests
 where invite_code = 'DEMO-1234';
