/*
  # User Profiles and Management Schema

  1. New Tables
    - `announcements`: Donation listings
    - `profiles`: User information and settings
    - `reviews`: User ratings system
    - `wishlists`: Saved items for beneficiaries
    - `activity_logs`: System activity tracking

  2. Security
    - RLS enabled on all tables
    - Granular access policies
    - Role-based permissions
*/

DO $$ BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Announcements are viewable by everyone" ON announcements;
  DROP POLICY IF EXISTS "Users can create announcements" ON announcements;
  DROP POLICY IF EXISTS "Users can update own announcements" ON announcements;
  DROP POLICY IF EXISTS "Profile visibility control" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
  DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
  DROP POLICY IF EXISTS "Users can view own wishlist" ON wishlists;
  DROP POLICY IF EXISTS "Users can manage own wishlist" ON wishlists;
  DROP POLICY IF EXISTS "Users can update own wishlist" ON wishlists;
  DROP POLICY IF EXISTS "Users can delete own wishlist" ON wishlists;
  DROP POLICY IF EXISTS "Users can view own activity" ON activity_logs;
  DROP POLICY IF EXISTS "Managers can view all activity" ON activity_logs;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  description text,
  condition text,
  purchase_date date,
  category text,
  object_name text,
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CLAIMED', 'COMPLETED')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Policies for announcements
CREATE POLICY "Announcements are viewable by everyone"
  ON announcements FOR SELECT
  USING (true);

CREATE POLICY "Users can create announcements"
  ON announcements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own announcements"
  ON announcements FOR UPDATE
  USING (auth.uid() = user_id);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE,
  full_name text,
  avatar_url text,
  biography text,
  role text NOT NULL CHECK (role IN ('DONOR', 'BENEFICIARY', 'MANAGER')),
  city text,
  visibility boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Profile visibility control"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id OR visibility = true
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid REFERENCES auth.users(id),
  reviewed_id uuid REFERENCES auth.users(id),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies for reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- Wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  announcement_id uuid REFERENCES announcements(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Policies for wishlists
CREATE POLICY "Users can view own wishlist"
  ON wishlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own wishlist"
  ON wishlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wishlist"
  ON wishlists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist"
  ON wishlists FOR DELETE
  USING (auth.uid() = user_id);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies for activity logs
CREATE POLICY "Users can view own activity"
  ON activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Managers can view all activity"
  ON activity_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'MANAGER'
  ));