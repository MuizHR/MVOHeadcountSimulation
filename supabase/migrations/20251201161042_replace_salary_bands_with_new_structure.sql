/*
  # Replace salary_bands table with new structure

  This migration replaces the existing salary_bands table with a new structure
  that supports both Permanent and GIG employment types with proper cost calculations.

  ## Changes
  
  1. Drop existing salary_bands table if it exists
  2. Create new salary_bands table with:
     - employment_type (Permanent or GIG)
     - job_grade and level
     - salary ranges (min/max)
     - employer cost components (allowance, statutory, insurance, medical, ghs)
  3. Enable RLS
  4. Add policies for authenticated users to read salary bands

  ## New Columns
  - id (uuid, primary key)
  - employment_type (text) - "Permanent" or "GIG"
  - job_grade (text) - e.g. "Manager", "Senior Executive"
  - level (text) - e.g. "Executive", "Senior Management"
  - salary_min (numeric) - Minimum salary
  - salary_max (numeric) - Maximum salary
  - fixed_allowance (numeric) - Fixed allowance (0 for GIG)
  - statutory_rate (numeric) - Statutory contribution rate (0.20 for Permanent, 0 for GIG)
  - insurance_rate (numeric) - Insurance rate (0.04 for Permanent, 0 for GIG)
  - medical_amount (numeric) - Medical amount (600 for Permanent, 0 for GIG)
  - ghs_rate (numeric) - GHS rate (0.10 for Permanent, 0 for GIG)
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS salary_bands CASCADE;

-- Create new salary_bands table
CREATE TABLE IF NOT EXISTS salary_bands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employment_type text NOT NULL CHECK (employment_type IN ('Permanent', 'GIG')),
  job_grade text NOT NULL,
  level text NOT NULL,
  salary_min numeric NOT NULL,
  salary_max numeric NOT NULL,
  fixed_allowance numeric NOT NULL DEFAULT 0,
  statutory_rate numeric NOT NULL DEFAULT 0,
  insurance_rate numeric NOT NULL DEFAULT 0,
  medical_amount numeric NOT NULL DEFAULT 0,
  ghs_rate numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE salary_bands ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read salary bands
CREATE POLICY "Authenticated users can read salary bands"
  ON salary_bands
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow service role to insert/update salary bands
CREATE POLICY "Service role can manage salary bands"
  ON salary_bands
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_salary_bands_employment_type ON salary_bands(employment_type);
CREATE INDEX IF NOT EXISTS idx_salary_bands_job_grade ON salary_bands(job_grade);
