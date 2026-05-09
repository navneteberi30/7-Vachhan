-- Secure function to fetch the current user's own guest record.
-- Uses auth.uid() server-side so RLS is not needed for this read.
CREATE OR REPLACE FUNCTION get_my_guest_record()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_guest guests%ROWTYPE;
  v_uid   uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_guest
    FROM guests
   WHERE supabase_user_id = v_uid
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN row_to_json(v_guest);
END;
$$;

GRANT EXECUTE ON FUNCTION get_my_guest_record() TO authenticated;
