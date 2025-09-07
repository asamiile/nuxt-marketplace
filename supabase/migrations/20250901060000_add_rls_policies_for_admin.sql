-- Add new RLS policies for categories
DROP POLICY IF EXISTS "Admin full access on categories" ON public.categories;
CREATE POLICY "Admin full access on categories"
ON public.categories
FOR ALL
USING (public.is_claims_admin())
WITH CHECK (public.is_claims_admin());

DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
CREATE POLICY "Public can read categories"
ON public.categories
FOR SELECT
USING (true);

-- Add new RLS policies for tags
DROP POLICY IF EXISTS "Admin full access on tags" ON public.tags;
CREATE POLICY "Admin full access on tags"
ON public.tags
FOR ALL
USING (public.is_claims_admin())
WITH CHECK (public.is_claims_admin());

DROP POLICY IF EXISTS "Public can read tags" ON public.tags;
CREATE POLICY "Public can read tags"
ON public.tags
FOR SELECT
USING (true);