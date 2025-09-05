-- Drop existing RLS policies for categories and tags
DROP POLICY IF EXISTS "Categories are publicly viewable." ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can insert categories." ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can update categories." ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories." ON public.categories; -- In case a delete policy exists

DROP POLICY IF EXISTS "Tags are publicly viewable." ON public.tags;
DROP POLICY IF EXISTS "Authenticated users can insert tags." ON public.tags;
DROP POLICY IF EXISTS "Authenticated users can update tags." ON public.tags;
DROP POLICY IF EXISTS "Authenticated users can delete tags." ON public.tags; -- In case a delete policy exists

-- Helper function to check for admin claims from JWT
-- This function extracts the 'claims_admin' custom claim from the JWT.
create or replace function public.is_claims_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'raw_app_meta_data' ->> 'claims_admin')::boolean, false)
$$;

-- Add new RLS policies for categories
-- 1. Admin full access
CREATE POLICY "Admin full access on categories"
ON public.categories
FOR ALL
USING (public.is_claims_admin())
WITH CHECK (public.is_claims_admin());

-- 2. Public read access
CREATE POLICY "Public can read categories"
ON public.categories
FOR SELECT
USING (true);

-- Add new RLS policies for tags
-- 1. Admin full access
CREATE POLICY "Admin full access on tags"
ON public.tags
FOR ALL
USING (public.is_claims_admin())
WITH CHECK (public.is_claims_admin());

-- 2. Public read access
CREATE POLICY "Public can read tags"
ON public.tags
FOR SELECT
USING (true);
