-- Add guest detail columns used by the Google Sheet sync script
ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS phone           text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS email           text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS table_number    int  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS meal_preference text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS notes           text DEFAULT NULL;
