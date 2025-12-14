/*
  # Create User Custom Locations Table

  1. New Tables
    - `user_custom_locations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `country_name` (text, the custom country name)
      - `region` (text, the assigned region)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_custom_locations` table
    - Users can only view and manage their own custom locations
    - Admins can view all custom locations

  3. Indexes
    - Index on user_id for fast filtering
    - Unique index on (user_id, country_name) to prevent duplicates per user

  4. Purpose
    - Store custom country/location names entered by users
    - Persist region assignments for custom locations
    - Enable location suggestions in future sessions
*/

CREATE TABLE IF NOT EXISTS user_custom_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  country_name text NOT NULL,
  region text NOT NULL DEFAULT 'Custom',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_location_per_user UNIQUE (user_id, country_name)
);

CREATE INDEX IF NOT EXISTS idx_user_custom_locations_user_id ON user_custom_locations(user_id);

ALTER TABLE user_custom_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own custom locations"
  ON user_custom_locations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom locations"
  ON user_custom_locations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom locations"
  ON user_custom_locations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom locations"
  ON user_custom_locations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_custom_locations_updated_at'
  ) THEN
    CREATE TRIGGER update_user_custom_locations_updated_at
      BEFORE UPDATE ON user_custom_locations
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
