-- 先に同じ名前のポリシーが存在すれば削除する
DROP POLICY IF EXISTS "Users can view approved products and their own products" ON public.products;

-- このマイグレーションで不要になる古いポリシーも確実に削除する
DROP POLICY IF EXISTS "Products are publicly viewable." ON public.products;
DROP POLICY IF EXISTS "Creators can view their own products" ON public.products;

-- 新しい統合されたポリシーを作成
CREATE POLICY "Users can view approved products and their own products"
ON public.products
FOR SELECT
USING (
  (status = 'approved') OR (auth.uid() = creator_id)
);
