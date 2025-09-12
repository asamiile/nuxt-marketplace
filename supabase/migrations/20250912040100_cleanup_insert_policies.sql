-- Clean up unnecessary INSERT policies now that creation is handled by the create_product RPC.

DROP POLICY IF EXISTS "Users can create their own products" ON public.products;
-- The following policies might exist from previous attempts, so we drop them to be safe.
DROP POLICY IF EXISTS "Authenticated users can create products." ON public.products;
DROP POLICY IF EXISTS "Admin can create products directly" ON public.products;
DROP POLICY IF EXISTS "Users can insert tags for their own products" ON public.product_tags;
