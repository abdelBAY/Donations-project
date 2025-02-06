/*
  # Fix Profiles RLS Policies

  1. Changes
    - Add policies for profile creation and updates
    - Allow users to create their own profile
    - Allow users to update their own profile
    - Allow users to read profiles based on visibility

  2. Security
    - Enable RLS on profiles table
    - Add policies for INSERT, UPDATE, and SELECT operations
    - Ensure users can only manage their own profiles
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Profile visibility control" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new policies
CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can read profiles"
  ON profiles FOR SELECT
  USING (
    -- Users can read their own profile
    auth.uid() = id
    -- Or profiles that are set to visible
    OR visibility = true
    -- Or if they are a manager
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'MANAGER'
    )
  );