/*
  # Fix infinite recursion in user_profiles RLS policies

  1. Problem
    - Current policies query user_profiles table to check roles
    - This causes infinite recursion when accessing the table
    - Users cannot refresh or update their profiles

  2. Solution
    - Drop all existing problematic policies
    - Create a SECURITY DEFINER function to safely check user roles
    - Create new policies that use this function to avoid recursion
    - Ensure users can always view and update their own profiles
    - Allow admins to manage other users without recursion

  3. New Policies
    - Users can always SELECT their own profile
    - Users can INSERT their own profile on signup
    - Users can UPDATE their own profile (except role field)
    - Admins can SELECT all profiles (via safe function)
    - Super admins can UPDATE any user (via safe function)
    - Regular admins can UPDATE non-super-admin users (via safe function)

  4. Security
    - Role checks use SECURITY DEFINER function to bypass RLS
    - Users cannot change their own role
    - All policies require authentication
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update regular users" ON user_profiles;
DROP POLICY IF EXISTS "Super admin can update any user" ON user_profiles;

-- Create a security definer function to safely check user roles without recursion
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM user_profiles
  WHERE id = user_id;
  
  RETURN COALESCE(user_role, 'user');
END;
$$;

-- Create a helper function to check if current user is admin or super admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN get_user_role(auth.uid()) IN ('admin', 'super_admin');
END;
$$;

-- Create a helper function to check if current user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN get_user_role(auth.uid()) = 'super_admin';
END;
$$;

-- Policy 1: Users can view their own profile (no recursion)
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 2: Admins can view all profiles (using safe function)
CREATE POLICY "Admins can view all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy 3: Users can insert their own profile on signup
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id 
    AND role = 'user'
  );

-- Policy 4: Users can update their own profile (cannot change role)
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = get_user_role(auth.uid())
  );

-- Policy 5: Super admins can update any profile
CREATE POLICY "Super admins can update any profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Policy 6: Regular admins can update non-super-admin profiles
CREATE POLICY "Admins can update regular users"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    is_admin() 
    AND get_user_role(id) != 'super_admin'
  )
  WITH CHECK (
    is_admin() 
    AND role != 'super_admin'
  );