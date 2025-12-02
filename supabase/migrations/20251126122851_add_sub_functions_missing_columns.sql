/*
  # Add Missing Columns to Sub-Functions Table

  1. Changes
    - Add `gap` column (integer, nullable)
    - Add `status` column (text, not null, default 'not_configured')
    - Add `updated_at` column (timestamptz, default now())

  2. Notes
    - These columns were missing from the initial sub_functions table creation
    - Using DO block to check if columns exist before adding
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sub_functions' AND column_name = 'gap'
  ) THEN
    ALTER TABLE sub_functions ADD COLUMN gap INTEGER;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sub_functions' AND column_name = 'status'
  ) THEN
    ALTER TABLE sub_functions ADD COLUMN status TEXT NOT NULL DEFAULT 'not_configured';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sub_functions' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE sub_functions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sub_functions' 
    AND policyname = 'Allow all operations on sub_functions'
  ) THEN
    CREATE POLICY "Allow all operations on sub_functions"
    ON sub_functions FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;
