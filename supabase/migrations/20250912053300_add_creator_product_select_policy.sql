-- Creators can view their own products.
-- This policy allows creators to view all of their own products, regardless of status.
-- This is evaluated as an OR condition with the existing public policy.
CREATE POLICY "Creators can view their own products"
ON public.products FOR SELECT
USING (auth.uid() = creator_id);
