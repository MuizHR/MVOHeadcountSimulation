/*
  # Allow Admins to View All User Profiles

  ## Problem
  - Currently, user_profiles table RLS only allows users to see their own profile
  - Admin users need to see all user profiles in the User Management interface
  - The UserManagement component queries all user_profiles but gets blocked by RLS

  ## Solution
  - Add a new RLS policy that allows admin users to view all user profiles
  - Consolidate with existing policy for better performance
  - Use optimized auth function call pattern with (select auth.uid())

  ## Security
  - Only authenticated users with admin role can view all profiles
  - Regular users can still only see their own profile
  - No changes to insert/update/delete policies (users can only modify their own profile)
*/

-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "View own profile policy" ON user_profiles;

-- Create a new consolidated SELECT policy that allows:
-- 1. Users to view their own profile
-- 2. Admins to view all profiles
CREATE POLICY "View profile policy"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = id
    OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = (select auth.uid())
      AND up.role = 'admin'
    )
  );

-- Also ensure admins can update any user profile (for role management)
DROP POLICY IF EXISTS "Update own profile policy" ON user_profiles;

CREATE POLICY "Update profile policy"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) = id
    OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = (select auth.uid())
      AND up.role = 'admin'
    )
  )
  WITH CHECK (
    (select auth.uid()) = id
    OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = (select auth.uid())
      AND up.role = 'admin'
    )
  );
