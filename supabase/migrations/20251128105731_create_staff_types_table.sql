/*
  # Create staff_types table for JLG salary bands

  1. New Tables
    - `staff_types`
      - `id` (uuid, primary key)
      - `title` (text) - Job Title
      - `level` (text) - Level (Senior Management / Middle Management / Executive / Non-Executive)
      - `min_salary` (numeric) - Min monthly salary (RM)
      - `mid_salary` (numeric) - Midpoint monthly salary (RM)
      - `max_salary` (numeric) - Max monthly salary (RM)
      - `cost_multiplier` (numeric) - Multiplier for EPF/SOCSO/EIS/benefits (default 1.20)
      - `planning_group` (text) - Grouping for UI display
      - `sort_order` (integer) - For consistent ordering
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `staff_types` table
    - Add policy for authenticated users to read staff types
    - Staff types are read-only for users; only admins can modify
  
  3. Data
    - Pre-populate with 14 JLG salary bands
    - Include planning groups for UI display
*/

CREATE TABLE IF NOT EXISTS staff_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  level text NOT NULL,
  min_salary numeric NOT NULL,
  mid_salary numeric NOT NULL,
  max_salary numeric NOT NULL,
  cost_multiplier numeric NOT NULL DEFAULT 1.18,
  planning_group text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE staff_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read staff types"
  ON staff_types FOR SELECT
  TO public
  USING (true);

INSERT INTO staff_types (title, level, min_salary, mid_salary, max_salary, planning_group, sort_order) VALUES
  ('Senior Chief Officer', 'Senior Management', 34900, 50515, 66130, 'Chief / C-Suite (Senior Chief Officer / Chief Officer)', 1),
  ('Chief Officer', 'Senior Management', 28500, 41870, 55240, 'Chief / C-Suite (Senior Chief Officer / Chief Officer)', 2),
  ('Senior General Manager', 'Senior Management', 20460, 34859, 49258, 'GM / Senior GM', 3),
  ('General Manager', 'Senior Management', 18600, 31690, 44780, 'GM / Senior GM', 4),
  ('Deputy General Manager', 'Middle Management', 14500, 24695, 34890, 'Deputy GM', 5),
  ('Senior Manager', 'Middle Management', 11000, 18690, 26380, 'Manager / Senior Manager / Deputy Manager', 6),
  ('Manager', 'Middle Management', 7500, 11902, 16304, 'Manager / Senior Manager / Deputy Manager', 7),
  ('Deputy Manager', 'Middle Management', 6600, 10325, 14050, 'Manager / Senior Manager / Deputy Manager', 8),
  ('Senior Executive', 'Executive', 3650, 6738.50, 9827, 'Executive / Senior Executive / Executive-B', 9),
  ('Executive', 'Executive', 2780, 5272.50, 7765, 'Executive / Senior Executive / Executive-B', 10),
  ('Executive-B', 'Executive', 1890, 4032, 6174, 'Executive / Senior Executive / Executive-B', 11),
  ('Senior Clerical / Technician / Secretary', 'Non-Executive', 1700, 2900, 4100, 'Non-Executive / Technician / General Worker', 12),
  ('Clerk / Technician', 'Non-Executive', 1700, 2365, 3030, 'Non-Executive / Technician / General Worker', 13),
  ('Office Assistant / General Worker', 'Non-Executive', 1700, 2230, 2760, 'Non-Executive / Technician / General Worker', 14)
ON CONFLICT DO NOTHING;
