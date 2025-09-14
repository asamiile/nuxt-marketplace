-- =========== 1. テーブルデータのリセット ===========
-- TRUNCATEを使ってテーブルのデータをすべて削除し、IDの連番もリセットします。
TRUNCATE
  public.categories,
  public.tags,
  public.products,
  public.purchases,
  public.favorites,
  public.product_tags,
  public.contacts
RESTART IDENTITY CASCADE;

-- =========== 3. マスターデータの作成 ===========
-- `categories` テーブルへのサンプルデータ
INSERT INTO public.categories (name) VALUES
('イラスト'), ('3Dモデル'), ('UIキット'), ('アイコン'), ('写真'), ('動画素材'), ('音楽・効果音');

-- `tags` テーブルへのサンプルデータ
INSERT INTO public.tags (name) VALUES
('風景'), ('ポートレート'), ('抽象画'), ('動物'), ('ミニマリズム'), ('自然'), ('都市'), ('可愛い'), ('クール'), ('サイバーパンク'), ('ファンタジー');
