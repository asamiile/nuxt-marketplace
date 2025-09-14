-- Drop the two existing SELECT policies on the products table.
-- There seems to be an issue with how they are combined.
DROP POLICY IF EXISTS "Products are publicly viewable." ON public.products;
DROP POLICY IF EXISTS "Creators can view their own products" ON public.products;

-- Drop the consolidated policy as well, in case this script is run again.
DROP POLICY IF EXISTS "Users can view approved products and their own products" ON public.products;

-- Create a new, single policy that combines the logic of the previous two.
-- This ensures that users can see all 'approved' products, and creators can
-- additionally see all of their own products regardless of status.
CREATE POLICY "Users can view approved products and their own products"
ON public.products
FOR SELECT
USING (
  (status = 'approved') OR (auth.uid() = creator_id)
);
