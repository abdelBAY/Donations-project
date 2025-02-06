/*
  # Announcement Interactions Schema

  1. New Tables
    - `announcement_media`: Images and videos for announcements
    - `announcement_locations`: Geographic data for items
    - `announcement_reports`: Moderation system
    - `announcement_versions`: Version history tracking
    - `announcement_shares`: Social sharing metrics

  2. Security
    - RLS enabled on all tables
    - Granular access policies
    - Moderation workflow support
*/

-- Announcement media table
CREATE TABLE IF NOT EXISTS announcement_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid REFERENCES announcements(id) ON DELETE CASCADE,
  url text NOT NULL,
  type text NOT NULL CHECK (type IN ('IMAGE', 'VIDEO')),
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE announcement_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media is viewable by everyone"
  ON announcement_media FOR SELECT
  USING (true);

CREATE POLICY "Users can manage media for own announcements"
  ON announcement_media FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM announcements 
      WHERE id = announcement_media.announcement_id
    )
  );

-- Announcement locations table
CREATE TABLE IF NOT EXISTS announcement_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid REFERENCES announcements(id) ON DELETE CASCADE,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  address text,
  city text,
  country text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(announcement_id)
);

ALTER TABLE announcement_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locations are viewable by everyone"
  ON announcement_locations FOR SELECT
  USING (true);

CREATE POLICY "Users can manage locations for own announcements"
  ON announcement_locations FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM announcements 
      WHERE id = announcement_locations.announcement_id
    )
  );

-- Announcement reports table
CREATE TABLE IF NOT EXISTS announcement_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid REFERENCES announcements(id) ON DELETE CASCADE,
  reporter_id uuid REFERENCES auth.users(id),
  reason text NOT NULL,
  details text,
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED')),
  moderator_id uuid REFERENCES auth.users(id),
  moderator_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE announcement_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports"
  ON announcement_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports"
  ON announcement_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Managers can view all reports"
  ON announcement_reports FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'MANAGER'
  ));

CREATE POLICY "Managers can update reports"
  ON announcement_reports FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'MANAGER'
  ));

-- Announcement versions table
CREATE TABLE IF NOT EXISTS announcement_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid REFERENCES announcements(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  condition text,
  category text,
  object_name text,
  changes jsonb NOT NULL,
  editor_id uuid REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE announcement_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of their announcements"
  ON announcement_versions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM announcements 
      WHERE id = announcement_versions.announcement_id
    )
  );

CREATE POLICY "Users can create versions for their announcements"
  ON announcement_versions FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM announcements 
      WHERE id = announcement_versions.announcement_id
    )
  );

CREATE POLICY "Managers can view all versions"
  ON announcement_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'MANAGER'
  ));

CREATE POLICY "Managers can approve versions"
  ON announcement_versions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'MANAGER'
  ));

-- Announcement shares table
CREATE TABLE IF NOT EXISTS announcement_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid REFERENCES announcements(id) ON DELETE CASCADE,
  platform text NOT NULL,
  share_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(announcement_id, platform)
);

ALTER TABLE announcement_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Share stats are viewable by everyone"
  ON announcement_shares FOR SELECT
  USING (true);

CREATE POLICY "System can update share counts"
  ON announcement_shares FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'MANAGER'
    )
  );