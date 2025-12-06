/*
  # Create Simulation History Table with Proper RLS

  1. New Tables
    - `simulation_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `simulation_id` (uuid, unique identifier for simulation)
      - `simulation_name` (text, required)
      - `business_area` (text)
      - `planning_type` (text)
      - `size_of_operation` (text)
      - `workload_score` (numeric, default 0)
      - `total_fte` (numeric, default 0)
      - `total_monthly_cost` (numeric, default 0)
      - `input_payload` (jsonb, stores simulation inputs)
      - `result_payload` (jsonb, stores simulation results)
      - `parent_simulation_id` (uuid, for tracking duplicates)
      - `scenario_label` (text, for duplicate scenarios)
      - `duplication_note` (text, notes about duplication)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `simulation_history` table
    - Users can SELECT their own simulations
    - Admins can SELECT all simulations (using safe helper function)
    - Users can INSERT their own simulations
    - Users can UPDATE their own simulations
    - Users can DELETE their own simulations
    - Admins can DELETE any simulation (using safe helper function)

  3. Indexes
    - Index on user_id for fast user queries
    - Index on created_at for sorting
    - Index on parent_simulation_id for lineage tracking
*/

-- Create the simulation_history table
CREATE TABLE IF NOT EXISTS simulation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_id uuid NOT NULL,
  simulation_name text NOT NULL,
  business_area text,
  planning_type text,
  size_of_operation text,
  workload_score numeric DEFAULT 0,
  total_fte numeric DEFAULT 0,
  total_monthly_cost numeric DEFAULT 0,
  input_payload jsonb,
  result_payload jsonb,
  parent_simulation_id uuid REFERENCES simulation_history(id) ON DELETE SET NULL,
  scenario_label text,
  duplication_note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE simulation_history ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own simulations
CREATE POLICY "Users can view own simulations"
  ON simulation_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Admins can view all simulations (using safe helper function)
CREATE POLICY "Admins can view all simulations"
  ON simulation_history
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy 3: Users can insert their own simulations
CREATE POLICY "Users can insert own simulations"
  ON simulation_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can update their own simulations
CREATE POLICY "Users can update own simulations"
  ON simulation_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 5: Users can delete their own simulations
CREATE POLICY "Users can delete own simulations"
  ON simulation_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 6: Admins can delete any simulation
CREATE POLICY "Admins can delete any simulation"
  ON simulation_history
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_simulation_history_user_id ON simulation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_simulation_history_created_at ON simulation_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_simulation_history_parent_id ON simulation_history(parent_simulation_id);