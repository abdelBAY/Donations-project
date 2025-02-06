/*
  # Fix Profiles RLS Policy Recursion

  1. Changes
    - Remove recursive manager check in RLS policies
    - Add direct role check using auth.jwt() claims
    - Maintain same security model without recursion

  2. Security
    - Maintain RLS protection
    - Fix infinite recursion issue
    - Keep existing access control logic
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read profiles" ON profiles;

-- Create new policies without recursion
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
    -- Or if they are a manager (using JWT claim instead of recursive check)
    OR auth.jwt()->>'role' = 'MANAGER'
  );