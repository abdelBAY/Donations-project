/*
  # Add category column to announcements table

  1. Changes
    - Add category column to announcements table
    - Add check constraint for valid categories
    - Add index for faster category searches

  2. Security
    - No changes to RLS policies needed
*/

DO $$ BEGIN
  -- Add category column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'announcements' AND column_name = 'category'
  ) THEN
    ALTER TABLE announcements 
    ADD COLUMN category text CHECK (
      category IN (
        'Furniture',
        'Electronics',
        'Clothing',
        'Books',
        'Kitchen',
        'Sports',
        'Toys',
        'Tools',
        'Other'
      )
    );

    -- Add index for category column
    CREATE INDEX IF NOT EXISTS announcements_category_idx ON announcements(category);
  END IF;
END $$;