/*
  # Allow Admins to Update User Roles

  1. Problem
    - Current RLS policy only allows users to update their own profile
    - Admins need to update other users' roles but are blocked by RLS
    - Cannot query user_profiles in policy (causes infinite recursion)
  
  2. Solution
    - Create a SECURITY DEFINER function to check if user is admin
    - This function bypasses RLS and prevents infinite recursion
    - Update the UPDATE policy to allow admins to modify any profile
  
  3. Security
    - Function is carefully designed to only check role, nothing else
    - Still maintains security by checking auth.uid()
    - Admins can update any profile, regular users only their own
*/

-- Create a function to check if current user is admin
-- SECURITY DEFINER allows it to bypass RLS and read user_profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;

-- Drop the existing update policy
DROP POLICY IF EXISTS "users_can_update_own_profile" ON user_profiles;

-- Create new update policy that allows admins to update any profile
CREATE POLICY "users_can_update_profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR is_admin()
  )
  WITH CHECK (
    auth.uid() = id OR is_admin()
  );
