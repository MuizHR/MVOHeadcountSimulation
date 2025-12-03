/*
  # Add Simulation History Table

  1. New Tables
    - `simulation_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `simulation_id` (uuid)
      - `simulation_name` (text)
      - `business_area` (text)
      - `planning_type` (text)
      - `size_of_operation` (text)
      - `workload_score` (numeric)
      - `total_fte` (numeric)
      - `total_monthly_cost` (numeric)
      - `input_payload` (jsonb)
      - `result_payload` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `simulation_history` table
    - Add policy for users to read their own simulations
    - Add policy for users to insert their own simulations
    - Add policy for users to delete their own simulations
    - Add policy for admins to access all simulations
*/

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
  created_at timestamptz DEFAULT now()
);

ALTER TABLE simulation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own simulations"
  ON simulation_history
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can insert own simulations"
  ON simulation_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own simulations"
  ON simulation_history
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_simulation_history_user_id ON simulation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_simulation_history_created_at ON simulation_history(created_at DESC);
