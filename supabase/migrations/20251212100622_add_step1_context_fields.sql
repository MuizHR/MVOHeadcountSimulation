/*
  # Add Step 1 Context Fields to Simulations

  1. New Columns Added to `simulations`
    - `entity` (text, nullable) - Company or entity name (e.g., "Group / Multi-entity")
    - `region` (text, nullable) - Location or region
    - `planning_type` (text, nullable) - Type of planning (New Project, New Function, Existing Restructure, BAU/Monthly Operations)
    - `scope_driver_type` (text, nullable) - Type of scope driver (Employees Supported, # Sites/Locations, # Projects/Portfolios)
    - `scope_driver_value` (numeric, nullable) - Numeric value for the scope driver
    - `auto_size_enabled` (boolean, default true) - Whether auto-suggest for operation size is enabled
    - `operation_size` (text, nullable) - Size of operation (Small, Medium, Large)
    - `context_objectives` (text, nullable) - Business problem, constraints, success criteria

  2. New Columns Added to `simulation_history`
    - Same fields as above for consistency across all simulation records

  3. Important Notes
    - All fields are nullable to maintain backward compatibility
    - Existing simulations will have these fields as NULL
    - Default values provided where appropriate (auto_size_enabled = true)
    - These fields enable better filtering and search in Simulation Library
*/

-- Add new columns to simulations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'simulations' AND column_name = 'entity'
  ) THEN
    ALTER TABLE simulations ADD COLUMN entity text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'simulations' AND column_name = 'region'
  ) THEN
    ALTER TABLE simulations ADD COLUMN region text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'simulations' AND column_name = 'planning_type'
  ) THEN
    ALTER TABLE simulations ADD COLUMN planning_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'simulations' AND column_name = 'scope_driver_type'
  ) THEN
    ALTER TABLE simulations ADD COLUMN scope_driver_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'simulations' AND column_name = 'scope_driver_value'
  ) THEN
    ALTER TABLE simulations ADD COLUMN scope_driver_value numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'simulations' AND column_name = 'auto_size_enabled'
  ) THEN
    ALTER TABLE simulations ADD COLUMN auto_size_enabled boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'simulations' AND column_name = 'operation_size'
  ) THEN
    ALTER TABLE simulations ADD COLUMN operation_size text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'simulations' AND column_name = 'context_objectives'
  ) THEN
    ALTER TABLE simulations ADD COLUMN context_objectives text;
  END IF;
END $$;

-- Add new columns to simulation_history table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'simulation_history' AND column_name = 'entity'
  ) THEN
    ALTER TABLE simulation_history ADD COLUMN entity text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'simulation_history' AND column_name = 'region'
  ) THEN
    ALTER TABLE simulation_history ADD COLUMN region text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'simulation_history' AND column_name = 'scope_driver_type'
  ) THEN
    ALTER TABLE simulation_history ADD COLUMN scope_driver_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'simulation_history' AND column_name = 'scope_driver_value'
  ) THEN
    ALTER TABLE simulation_history ADD COLUMN scope_driver_value numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'simulation_history' AND column_name = 'auto_size_enabled'
  ) THEN
    ALTER TABLE simulation_history ADD COLUMN auto_size_enabled boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'simulation_history' AND column_name = 'context_objectives'
  ) THEN
    ALTER TABLE simulation_history ADD COLUMN context_objectives text;
  END IF;
END $$;

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_simulations_entity ON simulations(entity);
CREATE INDEX IF NOT EXISTS idx_simulations_region ON simulations(region);
CREATE INDEX IF NOT EXISTS idx_simulations_planning_type ON simulations(planning_type);
CREATE INDEX IF NOT EXISTS idx_simulations_operation_size ON simulations(operation_size);

CREATE INDEX IF NOT EXISTS idx_simulation_history_entity ON simulation_history(entity);
CREATE INDEX IF NOT EXISTS idx_simulation_history_region ON simulation_history(region);
CREATE INDEX IF NOT EXISTS idx_simulation_history_planning_type ON simulation_history(planning_type);
CREATE INDEX IF NOT EXISTS idx_simulation_history_operation_size ON simulation_history(size_of_operation);
