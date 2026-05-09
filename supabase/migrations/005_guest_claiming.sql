-- Add device claiming to guests table
-- claimed_at: when the code was first activated
-- session_token: UUID stored in browser localStorage to re-identify returning guests

ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS claimed_at  timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS session_token uuid        DEFAULT NULL;

-- Index for fast session_token lookups (used on every page load)
CREATE INDEX IF NOT EXISTS idx_guests_session_token ON guests(session_token);
