/*
  # Add Schema and Engine Versioning to Simulations

  1. Changes
    - Add `schema_version` (text) to track simulation data schema version
    - Add `engine_version` (text) to track calculation engine version used
    - Add default values for existing records (v0 for legacy, 1.0.0 for engine)
    
  2. Purpose
    - Enable backward-compatible migrations when schema changes
    - Track which calculation engine version produced results
    - Support non-breaking field additions and modifications
    
  3. Migration Strategy
    - New simulations will default to current version (v1, 1.0.0)
    - Existing simulations will be treated as legacy (v0) and migrated on load
    - Migration is idempotent and non-destructive
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'simulations' AND column_name = 'schema_version'
  ) THEN
    ALTER TABLE simulations ADD COLUMN schema_version text DEFAULT 'v1';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'simulations' AND column_name = 'engine_version'
  ) THEN
    ALTER TABLE simulations ADD COLUMN engine_version text DEFAULT '1.0.0';
  END IF;
END $$;

UPDATE simulations 
SET schema_version = 'v0' 
WHERE schema_version IS NULL OR schema_version = 'v1';

COMMENT ON COLUMN simulations.schema_version IS 'Schema version for data structure compatibility (e.g., v1, v2)';
COMMENT ON COLUMN simulations.engine_version IS 'Calculation engine version that produced results (e.g., 1.0.0, 1.1.0)';