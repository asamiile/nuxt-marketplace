-- 1. Add new columns to the profiles table for creator-specific information.
ALTER TABLE public.profiles
ADD COLUMN bio TEXT,
ADD COLUMN website_url TEXT,
ADD COLUMN x_url TEXT,
ADD COLUMN youtube_url TEXT;

-- 2. Add new RLS policy to allow public viewing of profiles.
-- This policy allows anyone to view all records in the profiles table.
-- This is necessary for the public creator profile pages.
-- It works in conjunction with the existing "Users can view their own profile." policy.
-- For SELECT, RLS policies are combined with OR, so if either is true, access is granted.
CREATE POLICY "Anyone can view all profiles."
ON profiles FOR SELECT
USING (true);


-- Add comments for the new columns
COMMENT ON COLUMN profiles.bio IS 'A short biography or description of the creator.';
COMMENT ON COLUMN profiles.website_url IS 'Link to the creator''s personal or professional website.';
COMMENT ON COLUMN profiles.x_url IS 'Link to the creator''s X (formerly Twitter) profile.';
COMMENT ON COLUMN profiles.youtube_url IS 'Link to the creator''s YouTube channel.';
