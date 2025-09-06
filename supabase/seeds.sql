-- =========== ユーザープロフィールの設定 ===========
-- 【重要】事前にAuthで作成した1人目のユーザーUUIDに書き換えてください
UPDATE public.profiles
SET
  username = 'creator_a',
  bio = '風景や日常をテーマに作品を制作しています。',
  website_url = 'https://example.com'
WHERE id = '2287c81e-b416-4657-be22-c720310364dc';

-- 【重要】事前にAuthで作成した2人目のユーザーUUIDに書き換えてください
UPDATE public.profiles
SET
  username = 'empty_user',
  bio = '作品を見るのが好きです。',
  website_url = null
WHERE id = 'a1e83c03-dbe2-4276-8df8-ab833087d0a2';


-- =========== テーブルデータのリセット ===========
-- TRUNCATEを使ってテーブルのデータをすべて削除し、IDの連番もリセットします。
TRUNCATE 
  public.categories, 
  public.tags, 
  public.products, 
  public.purchases, 
  public.favorites, 
  public.product_tags 
RESTART IDENTITY CASCADE;


-- =========== マスターデータの作成 ===========
-- `categories` テーブルへのサンプルデータ
INSERT INTO public.categories (name) VALUES
('油絵'), ('写真'), ('デジタルアート'), ('彫刻');

-- `tags` テーブルへのサンプルデータ
INSERT INTO public.tags (name) VALUES
('風景'), ('ポートレート'), ('抽象画'), ('動物'), ('ミニマリズム'), ('自然'), ('都市');


-- =========== ユーザー1 (`creator_a`) のデータ作成 ===========
-- `products` テーブル: 商品はすべて `creator_a` が所有します
INSERT INTO public.products (name, description, price, image_url, file_url, creator_id, category_id, license_type, terms_of_use) VALUES
('夜明けの海', '静かな夜明けの海の情景を描いた油絵です。', 25000, 'https://placehold.jp/300x300.png', 'https://example.com/file.jpg', '2287c81e-b416-4657-be22-c720310364dc', 1, '個人利用ライセンス', '商用利用、再配布は禁止です。'),
('アイスランドのオーロラ', 'アイスランドで撮影した神秘的なオーロラの写真です。', 8000, 'https://placehold.jp/300x300.png', 'https://example.com/file.jpg', '2287c81e-b416-4657-be22-c720310364dc', 2, '商用利用ライセンス', 'ウェブサイトや広告など、商用目的で利用可能です。'),
('サイバーシティ', 'ネオンきらめく未来都市をテーマにしたデジタルアート作品。', 12000, 'https://placehold.jp/300x300.png', 'https://example.com/file.png', '2287c81e-b416-4657-be22-c720310364dc', 3, '商用利用ライセンス', '改変可。クレジット表記をお願いします。'),
('森の守り神', '森に佇む鹿を捉えた、生命力あふれる一枚。', 7500, 'https://placehold.jp/300x300.png', 'https://example.com/file.jpg', '2287c81e-b416-4657-be22-c720310364dc', 2, '個人利用ライセンス', '壁紙や個人のSNS投稿にご利用いただけます。'),
('心の渦', '感情の渦を表現した抽象的な油絵。', 35000, 'https://placehold.jp/300x300.png', 'https://example.com/file.jpg', '2287c81e-b416-4657-be22-c720310364dc', 1, '個人利用ライセンス', '個人の鑑賞目的でのみ利用可能です。'),
('雨の東京', '雨に濡れる東京の交差点を撮影したスナップ写真。', 6000, 'https://placehold.jp/300x300.png', 'https://example.com/file.jpg', '2287c81e-b416-4657-be22-c720310364dc', 2, '商用利用ライセンス', '雑誌やウェブメディアでご利用いただけます。'),
('夢見る猫', 'パステルカラーで描かれた、眠る猫のデジタルイラスト。', 5000, 'https://placehold.jp/300x300.png', 'https://example.com/file.png', '2287c81e-b416-4657-be22-c720310364dc', 3, '個人利用ライセンス', 'SNSアイコンなどにご利用ください。'),
('静寂', 'ミニマリズムを追求した、モノクロの風景写真。', 9000, 'https://placehold.jp/300x300.png', 'https://example.com/file.jpg', '2287c81e-b416-4657-be22-c720310364dc', 2, '商用利用ライセンス', 'どのような媒体でもご利用いただけます。'),
('秋色のポートレート', '秋の公園で撮影した女性のポートレート写真。', 10000, 'https://placehold.jp/300x300.png', 'https://example.com/file.jpg', '2287c81e-b416-4657-be22-c720310364dc', 2, '個人利用ライセンス', '個人ブログやSNSでの利用に限ります。'),
('無限の階層', 'フラクタルアートで生成された幾何学模様のデジタルアート。', 15000, 'https://placehold.jp/300x300.png', 'https://example.com/file.png', '2287c81e-b416-4657-be22-c720310364dc', 3, '商用利用ライセンス', '背景やテクスチャとしてご利用いただけます。'),
('ひまわり畑', '夏の太陽を浴びるひまわり畑の油絵。', 28000, 'https://placehold.jp/300x300.png', 'https://example.com/file.jpg', '2287c81e-b416-4657-be22-c720310364dc', 1, '個人利用ライセンス', '個人の鑑賞目的でのみ利用可能です。'),
('青銅の思考者', '思索にふける人物を模した小さなブロンズ風彫刻の3Dモデル。', 18000, 'https://placehold.jp/300x300.png', 'https://example.com/file.obj', '2287c81e-b416-4657-be22-c720310364dc', 4, '商用利用ライセンス', '3Dプリントやゲームアセットとして利用可能です。');

-- `product_tags` テーブル: 上記の商品にタグを紐付けます
INSERT INTO public.product_tags (product_id, tag_id) VALUES
(1, 1), (1, 6), (2, 1), (2, 6), (3, 7), (4, 4), (4, 6), (5, 3), (6, 7), (7, 4), (8, 1), (8, 5), (9, 2), (10, 3), (11, 1), (11, 6), (12, 2);

-- `purchases` テーブル: `empty_user` が `creator_a` の商品を購入した履歴を作成します
INSERT INTO public.purchases (user_id, product_id) VALUES
('a1e83c03-dbe2-4276-8df8-ab833087d0a2', 1), -- 「夜明けの海」を購入
('a1e83c03-dbe2-4276-8df8-ab833087d0a2', 3), -- 「サイバーシティ」を購入
('a1e83c03-dbe2-4276-8df8-ab833087d0a2', 4); -- 「森の守り神」を購入

-- `favorites` テーブル: `creator_a` がいくつかの商品をお気に入り登録した履歴を作成します
INSERT INTO public.favorites (user_id, product_id) VALUES
('2287c81e-b416-4657-be22-c720310364dc', 2), -- アイスランドのオーロラ
('2287c81e-b416-4657-be22-c720310364dc', 6), -- 雨の東京
('2287c81e-b416-4657-be22-c720310364dc', 9); -- 秋色のポートレート