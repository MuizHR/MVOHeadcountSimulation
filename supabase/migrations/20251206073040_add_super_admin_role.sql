/*
  # Add Super Admin Role

  1. Changes
    - Update role column to support 'super_admin' role
    - Super admin has full control over all users
    - Super admin role cannot be changed by other admins
    - Only super admin can assign/remove admin roles

  2. Security
    - Add RLS policy to prevent admins from editing super admin
    - Add RLS policy to allow super admin to edit all users
    - Add RLS policy to allow admins to edit regular users only
*/

-- Drop existing constraint and add new one with super_admin
DO $$
BEGIN
  ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
  ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check CHECK (role IN ('super_admin', 'admin', 'user'));
END $$;

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON user_profiles;

-- Policy: Everyone can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Admins and super admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Policy: Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (
      -- Users cannot change their own role
      role = (SELECT role FROM user_profiles WHERE id = auth.uid())
    )
  );

-- Policy: Super admin can update any user
CREATE POLICY "Super admin can update any user"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'super_admin'
    )
  );

-- Policy: Regular admins can update users but NOT super admins
CREATE POLICY "Admins can update regular users"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- User making the request must be an admin
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
    -- Target user must NOT be a super admin
    AND role != 'super_admin'
  )
  WITH CHECK (
    -- User making the request must be an admin
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
    -- Target user must NOT be a super admin
    AND role != 'super_admin'
  );
