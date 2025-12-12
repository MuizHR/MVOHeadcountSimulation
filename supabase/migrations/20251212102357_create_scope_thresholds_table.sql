/*
  # Create Scope Thresholds Configuration Table

  1. New Tables
    - `scope_thresholds`
      - `id` (uuid, primary key)
      - `scope_driver_type` (text) - employees_supported, sites_locations, or projects_portfolios
      - `operation_size` (text) - small, medium, or large
      - `min_value` (integer) - minimum threshold value (null for no lower bound)
      - `max_value` (integer) - maximum threshold value (null for no upper bound)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
  2. Security
    - Enable RLS on `scope_thresholds` table
    - Add policy for all authenticated users to read thresholds
    - Add policy for admins and super_admins to modify thresholds
    
  3. Initial Data
    - Populate default thresholds based on business rules
*/

CREATE TABLE IF NOT EXISTS scope_thresholds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_driver_type text NOT NULL CHECK (scope_driver_type IN ('employees_supported', 'sites_locations', 'projects_portfolios')),
  operation_size text NOT NULL CHECK (operation_size IN ('small', 'medium', 'large')),
  min_value integer,
  max_value integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(scope_driver_type, operation_size)
);

ALTER TABLE scope_thresholds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read scope thresholds"
  ON scope_thresholds
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert scope thresholds"
  ON scope_thresholds
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update scope thresholds"
  ON scope_thresholds
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete scope thresholds"
  ON scope_thresholds
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Insert default thresholds for Employees Supported
INSERT INTO scope_thresholds (scope_driver_type, operation_size, min_value, max_value)
VALUES
  ('employees_supported', 'small', 1, 300),
  ('employees_supported', 'medium', 301, 1500),
  ('employees_supported', 'large', 1501, NULL);

-- Insert default thresholds for Work Locations Supported
INSERT INTO scope_thresholds (scope_driver_type, operation_size, min_value, max_value)
VALUES
  ('sites_locations', 'small', 1, 5),
  ('sites_locations', 'medium', 6, 30),
  ('sites_locations', 'large', 31, NULL);

-- Insert default thresholds for Active Workstreams
INSERT INTO scope_thresholds (scope_driver_type, operation_size, min_value, max_value)
VALUES
  ('projects_portfolios', 'small', 1, 3),
  ('projects_portfolios', 'medium', 4, 10),
  ('projects_portfolios', 'large', 11, NULL);