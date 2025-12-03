/*
  # Add Admin Functionality

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key) - Unique identifier
      - `email` (text, unique) - Admin email address
      - `created_at` (timestamptz) - When admin was added

  2. Security
    - Enable RLS on `admin_users` table
    - Only authenticated users can read admin_users (to check if they're admin)
    - Only service role can insert/update/delete admin users

  3. Helper Function
    - `is_admin()` - Returns true if current user's email is in admin_users table

  4. Updated Policies
    - Update simulations policies to allow admins to see all data
    - Regular users can only see their own data
    - Public users can see data without user_id (for backward compatibility)

  5. Important Notes
    - Admins can view all user data across the application
    - Regular users can only see their own data
    - Admin status is determined by email address in admin_users table
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read admin_users to check admin status
CREATE POLICY "Authenticated users can check admin status"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies on simulations table
DROP POLICY IF EXISTS "Allow public read access to simulations" ON simulations;
DROP POLICY IF EXISTS "Allow public insert access to simulations" ON simulations;
DROP POLICY IF EXISTS "Allow public update access to simulations" ON simulations;
DROP POLICY IF EXISTS "Allow public delete access to simulations" ON simulations;

-- New simulations policies with admin access
CREATE POLICY "Admins can view all simulations"
  ON simulations
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can view own simulations"
  ON simulations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Public can view simulations without user_id"
  ON simulations
  FOR SELECT
  USING (user_id IS NULL);

CREATE POLICY "Anyone can insert simulations"
  ON simulations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update all simulations"
  ON simulations
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Users can update own simulations"
  ON simulations
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Public can update simulations without user_id"
  ON simulations
  FOR UPDATE
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Admins can delete all simulations"
  ON simulations
  FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can delete own simulations"
  ON simulations
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Public can delete simulations without user_id"
  ON simulations
  FOR DELETE
  USING (user_id IS NULL);