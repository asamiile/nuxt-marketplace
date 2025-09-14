-- Re-create the policy for non-authenticated users (public role).
-- They should only be able to see approved products.
DROP POLICY IF EXISTS "Public can view approved products" ON public.products;
CREATE POLICY "Public can view approved products"
ON public.products
FOR SELECT
TO public
USING (status = 'approved');

-- Re-create the policy for authenticated users.
-- They can see approved products AND their own products regardless of status.
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
CREATE POLICY "Authenticated users can view products"
ON public.products
FOR SELECT
TO authenticated
USING (
  (status = 'approved') OR (auth.uid() = creator_id)
);
