/*
  # Create Simulations Storage Schema

  1. New Tables
    - `simulations`
      - `id` (uuid, primary key) - Unique identifier for each simulation
      - `user_id` (uuid, nullable) - Future-proofing for user authentication
      - `simulation_name` (text) - User-provided name for the simulation
      - `inputs` (jsonb) - All simulation input parameters
      - `scenarios` (jsonb) - Calculated results for all 6 scenarios
      - `selected_scenario_type` (text) - The scenario type selected by user
      - `created_at` (timestamptz) - When the simulation was created
      - `updated_at` (timestamptz) - Last modification timestamp

  2. Security
    - Enable RLS on `simulations` table
    - For now, allow public read/write (since no auth is implemented yet)
    - When auth is added later, policies should restrict to user's own simulations

  3. Indexes
    - Index on created_at for efficient sorting
    - Index on simulation_name for search functionality

  4. Important Notes
    - Using JSONB for flexible storage of complex nested data
    - Timestamps automatically managed with triggers
    - Future-ready for user authentication integration
*/

CREATE TABLE IF NOT EXISTS simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  simulation_name text NOT NULL,
  inputs jsonb NOT NULL,
  scenarios jsonb NOT NULL,
  selected_scenario_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_simulations_created_at ON simulations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_simulations_name ON simulations(simulation_name);

ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to simulations"
  ON simulations
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to simulations"
  ON simulations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to simulations"
  ON simulations
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to simulations"
  ON simulations
  FOR DELETE
  USING (true);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_simulations_updated_at'
  ) THEN
    CREATE TRIGGER update_simulations_updated_at
      BEFORE UPDATE ON simulations
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
