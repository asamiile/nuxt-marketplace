-- 古いポリシーを削除
DROP POLICY IF EXISTS "Products are publicly viewable." ON public.products;
DROP POLICY IF EXISTS "Products are viewable by everyone if approved, or by creator." ON public.products;

-- 新しいポリシーを作成
-- 公開されている商品、または自分の商品を閲覧可能にする
CREATE POLICY "Products are viewable by everyone if approved, or by creator." ON public.products
FOR SELECT USING (
  (status = 'approved') OR (auth.uid() = creator_id)
);
