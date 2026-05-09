-- ── Google SSO: link Supabase Auth users to guest records ─────────────────────

-- 1. Add the supabase_user_id column
ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS supabase_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_guests_supabase_user_id
  ON guests(supabase_user_id)
  WHERE supabase_user_id IS NOT NULL;

-- 2. RLS: authenticated users can read their own guest record
DROP POLICY IF EXISTS "guests_read_own" ON guests;
CREATE POLICY "guests_read_own" ON guests
  FOR SELECT
  TO authenticated
  USING (supabase_user_id = auth.uid());

-- 3. Secure RPC function to claim an invite code
--    Runs as SECURITY DEFINER so it can bypass RLS to find the row by invite_code,
--    but uses auth.uid() internally — the frontend cannot spoof the user ID.
CREATE OR REPLACE FUNCTION claim_invite_code(p_invite_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_guest  guests%ROWTYPE;
  v_uid    uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  SELECT * INTO v_guest
    FROM guests
   WHERE UPPER(invite_code) = UPPER(p_invite_code);

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Invalid invite code. Double-check and try again.');
  END IF;

  -- Already linked to a DIFFERENT Google account → block
  IF v_guest.supabase_user_id IS NOT NULL AND v_guest.supabase_user_id != v_uid THEN
    RETURN json_build_object('error', 'This invite code is already linked to another account. Contact Nav & Sanju.');
  END IF;

  -- Link this Google account and mark as claimed
  UPDATE guests
     SET supabase_user_id = v_uid,
         claimed_at       = COALESCE(claimed_at, NOW())
   WHERE id = v_guest.id
  RETURNING * INTO v_guest;

  RETURN row_to_json(v_guest);
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION claim_invite_code(text) TO authenticated;
