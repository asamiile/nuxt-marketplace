-- 既存のポリシーを一度削除して、クリーンな状態から再作成します
DROP POLICY IF EXISTS "Admin full access on tags" ON public.tags;
DROP POLICY IF EXISTS "Public can read tags" ON public.tags;
DROP POLICY IF EXISTS "Authenticated users can insert tags" ON public.tags;
DROP POLICY IF EXISTS "Admins can update tags" ON public.tags;
DROP POLICY IF EXISTS "Admins can delete tags" ON public.tags;


-- 1. Public Read Access: 全てのユーザーがタグを閲覧できます
CREATE POLICY "Public can read tags"
ON public.tags
FOR SELECT
USING (true);

-- 2. Authenticated Insert Access: ログインしている全てのユーザー（管理者を含む）がタグを新規作成できます
CREATE POLICY "Authenticated users can insert tags"
ON public.tags
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 3. Admin Update Access: 管理者のみが既存のタグを更新できます
CREATE POLICY "Admins can update tags"
ON public.tags
FOR UPDATE
USING (public.is_claims_admin())
WITH CHECK (public.is_claims_admin());

-- 4. Admin Delete Access: 管理者のみが既存のタグを削除できます
CREATE POLICY "Admins can delete tags"
ON public.tags
FOR DELETE
USING (public.is_claims_admin());