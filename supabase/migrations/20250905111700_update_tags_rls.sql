-- Drop the existing, more restrictive policies for the 'tags' table.
DROP POLICY IF EXISTS "Admin full access on tags" ON public.tags;
DROP POLICY IF EXISTS "Public can read tags" ON public.tags;

-- Create a new set of policies for the 'tags' table.
-- This allows any authenticated user to create new tags,
-- while restricting updates and deletes to admins.

-- 1. Public Read Access: All users can view tags.
CREATE POLICY "Public can read tags"
ON public.tags
FOR SELECT
USING (true);

-- 2. Authenticated Insert Access: Any logged-in user can create a new tag.
CREATE POLICY "Authenticated users can insert tags"
ON public.tags
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 3. Admin Update/Delete Access: Only admins can rename or delete existing tags.
-- 3. Admin Update Access: Only admins can rename existing tags.
CREATE POLICY "Admins can update tags"
ON public.tags
FOR UPDATE
USING (public.is_claims_admin())
WITH CHECK (public.is_claims_admin());

-- 4. Admin Delete Access: Only admins can delete existing tags.
CREATE POLICY "Admins can delete tags"
ON public.tags
FOR DELETE
USING (public.is_claims_admin());
