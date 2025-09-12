-- Clean up unnecessary INSERT policies now that creation is handled by the create_product RPC.

DROP POLICY IF EXISTS "Users can create their own products" ON public.products;
DROP POLICY IF EXISTS "Users can insert tags for their own products" ON public.product_tags;
