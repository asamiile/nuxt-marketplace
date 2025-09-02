-- 1. Create Storage Bucket
INSERT INTO
  storage.buckets (id, name, public)
VALUES
  ('assets', 'assets', true) ON CONFLICT (id) DO NOTHING;

-- 2. Set up RLS policies for the 'assets' bucket

-- Policy: Allow public read access
DROP POLICY IF EXISTS "Public read access for assets" ON storage.objects;
CREATE POLICY "Public read access for assets" ON storage.objects FOR SELECT USING (bucket_id = 'assets');

-- Policy: Allow authenticated users to upload
DROP POLICY IF EXISTS "Authenticated users can upload assets" ON storage.objects;
CREATE POLICY "Authenticated users can upload assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'assets');

-- Policy: Allow users to update their own files
DROP POLICY IF EXISTS "Users can update their own assets" ON storage.objects;
CREATE POLICY "Users can update their own assets" ON storage.objects FOR UPDATE TO authenticated USING (auth.uid() = owner) WITH CHECK (bucket_id = 'assets');

-- Policy: Allow users to delete their own files
DROP POLICY IF EXISTS "Users can delete their own assets" ON storage.objects;
CREATE POLICY "Users can delete their own assets" ON storage.objects FOR DELETE TO authenticated USING (auth.uid() = owner);