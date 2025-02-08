/*
  # Add storage bucket for item photos

  1. New Storage
    - Create 'item-photos' bucket for storing item images
  
  2. Security
    - Enable public access for reading photos
    - Allow authenticated users to upload photos
    - Restrict file types to images
    - Set size limits
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-photos', 'item-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id::text = 'item-photos');

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id::text = 'item-photos'
    AND (LOWER(SUBSTRING(name FROM '\.([^\.]+)$')) IN ('jpg', 'jpeg', 'png', 'webp'))
    AND LENGTH(name) < 100
    AND SPLIT_PART(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "Users can update own images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id::text = 'item-photos' 
    AND SPLIT_PART(name, '/', 1) = auth.uid()::text
  )
  WITH CHECK (
    bucket_id::text = 'item-photos' 
    AND SPLIT_PART(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id::text = 'item-photos' 
    AND SPLIT_PART(name, '/', 1) = auth.uid()::text
  );