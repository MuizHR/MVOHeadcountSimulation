/*
  # Fix User Profiles RLS Infinite Recursion

  1. Problem
    - Current policies check if user is admin by querying user_profiles table
    - This creates infinite recursion: policy → query user_profiles → policy → query user_profiles → ...
  
  2. Solution
    - Remove all existing policies
    - Create simple, non-recursive policies:
      - Users can view any authenticated user's profile (needed for admin features)
      - Users can only insert/update/delete their own profile
    - Admin access is handled at application level, not RLS level
  
  3. Security
    - All users can view profiles (read-only, safe for internal tool)
    - Users cannot modify other users' profiles
    - Only users can modify their own profile
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "View profile policy" ON user_profiles;
DROP POLICY IF EXISTS "Insert own profile policy" ON user_profiles;
DROP POLICY IF EXISTS "Update profile policy" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;

-- Create new simple policies without recursion
CREATE POLICY "authenticated_users_can_view_all_profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users_can_insert_own_profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_can_update_own_profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_can_delete_own_profile"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);
