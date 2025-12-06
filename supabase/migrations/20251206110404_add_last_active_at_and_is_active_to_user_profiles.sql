/*
  # Add activity tracking to user profiles

  1. Changes
    - Add `last_active_at` column to track when users were last active
    - Add `is_active` column to track if user account is active/deactivated
    - Set default values for existing users

  2. Notes
    - `last_active_at` defaults to now() for existing users
    - `is_active` defaults to true for all users
*/

-- Add last_active_at column for online/offline status tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'last_active_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN last_active_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add is_active column for user activation/deactivation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Create index for efficient querying of active users
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_active_at ON user_profiles(last_active_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);