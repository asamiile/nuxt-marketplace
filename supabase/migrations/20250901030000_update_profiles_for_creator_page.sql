-- 1. Add new columns to the profiles table for creator-specific information.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS x_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- 2. Add new RLS policy to allow public viewing of profiles.
DROP POLICY IF EXISTS "Anyone can view all profiles." ON profiles;
CREATE POLICY "Anyone can view all profiles."
ON profiles FOR SELECT
USING (true);


-- Add comments for the new columns
COMMENT ON COLUMN profiles.bio IS 'A short biography or description of the creator.';
COMMENT ON COLUMN profiles.website_url IS 'Link to the creator''s personal or professional website.';
COMMENT ON COLUMN profiles.x_url IS 'Link to the creator''s X (formerly Twitter) profile.';
COMMENT ON COLUMN profiles.youtube_url IS 'Link to the creator''s YouTube channel.';