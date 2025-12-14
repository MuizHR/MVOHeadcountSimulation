/*
  # Create Custom Companies Table

  1. New Tables
    - `custom_companies`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `company_name` (text, unique per user)
      - `business_pillar` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `custom_companies` table
    - Users can only view and manage their own custom companies
    - Admins can view all custom companies

  3. Indexes
    - Index on user_id for fast filtering
    - Unique index on (user_id, company_name) to prevent duplicates per user

  4. Purpose
    - Store custom company names entered by users
    - Persist business pillar assignments for custom companies
    - Enable company name suggestions in future sessions
*/

CREATE TABLE IF NOT EXISTS custom_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_name text NOT NULL,
  business_pillar text NOT NULL DEFAULT 'Custom',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_company_per_user UNIQUE (user_id, company_name)
);

CREATE INDEX IF NOT EXISTS idx_custom_companies_user_id ON custom_companies(user_id);

ALTER TABLE custom_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own custom companies"
  ON custom_companies
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom companies"
  ON custom_companies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom companies"
  ON custom_companies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom companies"
  ON custom_companies
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_custom_companies_updated_at'
  ) THEN
    CREATE TRIGGER update_custom_companies_updated_at
      BEFORE UPDATE ON custom_companies
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
