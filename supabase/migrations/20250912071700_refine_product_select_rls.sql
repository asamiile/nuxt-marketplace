-- Drop the previous consolidated policy to ensure a clean slate.
DROP POLICY IF EXISTS "Users can view approved products and their own products" ON public.products;

-- Re-create the policy for non-authenticated users (public role).
-- They should only be able to see approved products.
CREATE POLICY "Public can view approved products"
ON public.products
FOR SELECT
TO public
USING (status = 'approved');

-- Create a more specific policy for authenticated users.
-- They can see all approved products OR all of their own products.
CREATE POLICY "Authenticated users can view approved and their own products"
ON public.products
FOR SELECT
TO authenticated
USING (
  (status = 'approved') OR (auth.uid() = creator_id)
);
