-- 1. Create Storage Bucket
-- Creates a new public bucket named 'assets' for storing product images and files.
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING; -- Do nothing if the bucket already exists

-- Add a comment to the bucket for clarity
COMMENT ON TABLE storage.buckets IS 'Stores product images, digital asset files, and other public media.';


-- 2. Set up RLS policies for the 'assets' bucket
-- Note: These policies are applied to the `storage.objects` table, which manages all files in Storage.
-- We must filter by `bucket_id` to ensure policies only apply to our 'assets' bucket.

-- Policy: Allow public read access to all objects in the 'assets' bucket.
-- This is necessary so that image URLs can be displayed in the browser.
CREATE POLICY "Public read access for assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'assets' );

-- Policy: Allow authenticated users to upload files into the 'assets' bucket.
-- This ensures that only logged-in users can add new products.
CREATE POLICY "Authenticated users can upload assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'assets' );

-- Policy: Allow users to update their own files in the 'assets' bucket.
-- The `auth.uid() = owner` clause restricts this to the file's original uploader.
CREATE POLICY "Users can update their own assets"
ON storage.objects FOR UPDATE
TO authenticated
USING ( auth.uid() = owner )
WITH CHECK ( bucket_id = 'assets' );

-- Policy: Allow users to delete their own files in the 'assets' bucket.
-- The `auth.uid() = owner` clause restricts this to the file's original uploader.
CREATE POLICY "Users can delete their own assets"
ON storage.objects FOR DELETE
TO authenticated
USING ( auth.uid() = owner );
