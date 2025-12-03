/*
  # Fix User Profiles RLS Infinite Recursion

  1. Changes
    - Drop the problematic "Admins can view all profiles" policy that causes infinite recursion
    - Update "Users can view own profile" policy to be the only SELECT policy
    - Admin access will be handled at application level

  2. Notes
    - The infinite recursion occurred because the admin policy was checking user_profiles.role
      while executing a SELECT on user_profiles itself
*/

DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;

CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
