/*
  # Add Simulation Lineage Tracking

  1. New Columns
    - `parent_simulation_id` (uuid, nullable) - ID of the simulation this was duplicated from
    - `duplication_note` (text, nullable) - Free-text note explaining why/how it was duplicated
    - `scenario_label` (text, nullable) - Optional label like "Phase 2", "Alternative B"
    - `updated_at` (timestamptz) - Last update timestamp

  2. Changes
    - Add foreign key reference from parent_simulation_id to simulation_history.id
    - Add updated_at with default value

  3. Notes
    - Parent simulation ID is nullable (original simulations have no parent)
    - Foreign key allows tracking lineage even if parent is later deleted (ON DELETE SET NULL)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'simulation_history' AND column_name = 'parent_simulation_id'
  ) THEN
    ALTER TABLE simulation_history
    ADD COLUMN parent_simulation_id uuid NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'simulation_history' AND column_name = 'duplication_note'
  ) THEN
    ALTER TABLE simulation_history
    ADD COLUMN duplication_note text NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'simulation_history' AND column_name = 'scenario_label'
  ) THEN
    ALTER TABLE simulation_history
    ADD COLUMN scenario_label text NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'simulation_history' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE simulation_history
    ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

ALTER TABLE simulation_history DROP CONSTRAINT IF EXISTS fk_parent_simulation;

ALTER TABLE simulation_history
ADD CONSTRAINT fk_parent_simulation
FOREIGN KEY (parent_simulation_id)
REFERENCES simulation_history(id)
ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_simulation_history_parent
ON simulation_history(parent_simulation_id);

CREATE INDEX IF NOT EXISTS idx_simulation_history_updated
ON simulation_history(updated_at);
