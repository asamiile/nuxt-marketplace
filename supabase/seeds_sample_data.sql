-- =========== 1. テーブルデータのリセット ===========
-- =========== 2. ユーザープロフィールの設定 ===========
UPDATE public.profiles
SET
  username = 'creator_a',
  bio = '風景や日常をテーマに作品を制作しています。',
  website_url = 'https://example.com'
WHERE id = '【creatorのUUIDを貼り付け】';

UPDATE public.profiles
SET
  username = 'normal_user',
  bio = '作品を見るのが好きです。'
WHERE id = '【userのUUIDを貼り付け】';


-- =========== 4. サンプル商品データの作成 ===========
-- `products` テーブル: 商品はすべて `creator_a` が所有します
-- 【重要】 creator_id を creator のUUIDに書き換えてください
INSERT INTO public.products (name, description, price, image_url, file_url, creator_id, category_id, license_type, terms_of_use, status, admin_notes) VALUES
('夜明けの海', '静かな夜明けの海の情景を描いた油絵です。', 25000, 'https://placehold.jp/300x300.png', 'https://example.com/file.jpg', '【creatorのUUIDを貼り付け】', 1, '個人利用ライセンス', '商用利用、再配布は禁止です。', 'approved', NULL),
('アイスランドのオーロラ', 'アイスランドで撮影した神秘的なオーロラの写真です。', 8000, 'https://placehold.jp/300x300.png', 'https://example.com/file.jpg', '【creatorのUUIDを貼り付け】', 5, '商用利用ライセンス', 'ウェブサイトや広告など、商用目的で利用可能です。', 'approved', NULL),
('サイバーシティ', 'ネオンきらめく未来都市をテーマにしたデジタルアート作品。', 12000, 'https://placehold.jp/300x300.png', 'https://example.com/file.png', '【creatorのUUIDを貼り付け】', 1, '商用利用ライセンス', '改変可。クレジット表記をお願いします。', 'approved', NULL),
('森の守り神', '森に佇む鹿を捉えた、生命力あふれる一枚。', 7500, 'https://placehold.jp/300x300.png', 'https://example.com/file.jpg', '【creatorのUUIDを貼り付け】', 5, '個人利用ライセンス', '壁紙や個人のSNS投稿にご利用いただけます。', 'approved', NULL),
('心の渦', '感情の渦を表現した抽象的な油絵。', 35000, 'https://placehold.jp/300x300.png', 'https://example.com/file.jpg', '【creatorのUUIDを貼り付け】', 1, '個人利用ライセンス', '個人の鑑賞目的でのみ利用可能です。', 'approved', NULL),
('雨の東京', '雨に濡れる東京の交差点を撮影したスナップ写真。', 6000, 'https://placehold.jp/300x300.png', 'https://example.com/file.jpg', '【creatorのUUIDを貼り付け】', 5, '商用利用ライセンス', '雑誌やウェブメディアでご利用いただけます。', 'approved', NULL),
('夢見る猫', 'パステルカラーで描かれた、眠る猫のデジタルイラスト。', 5000, 'https://placehold.jp/300x300.png', 'https://example.com/file.png', '【creatorのUUIDを貼り付け】', 1, '個人利用ライセンス', 'SNSアイコンなどにご利用ください。', 'approved', NULL),
('静寂', 'ミニマリズムを追求した、モノクロの風景写真。', 9000, 'https://placehold.jp/300x300.png', 'https://example.com/file.jpg', '【creatorのUUIDを貼り付け】', 5, '商用利用ライセンス', 'どのような媒体でもご利用いただけます。', 'approved', NULL),
('秋色のポートレート', '秋の公園で撮影した女性のポートレート写真。', 10000, 'https://placehold.jp/300x300.png', 'https://example.com/file.jpg', '【creatorのUUIDを貼り付け】', 5, '個人利用ライセンス', '個人ブログやSNSでの利用に限ります。', 'approved', NULL),
('無限の階層', 'フラクタルアートで生成された幾何学模様のデジタルアート。', 15000, 'https://placehold.jp/300x300.png', 'https://example.com/file.png', '【creatorのUUIDを貼り付け】', 1, '商用利用ライセンス', '背景やテクスチャとしてご利用いただけます。', 'approved', NULL),
('ひまわり畑', '夏の太陽を浴びるひまわり畑の油絵。', 28000, 'https://placehold.jp/300x300.png', 'https://example.com/file.jpg', '【creatorのUUIDを貼り付け】', 1, '個人利用ライセンス', '個人の鑑賞目的でのみ利用可能です。', 'approved', NULL),
('青銅の思考者', '思索にふける人物を模した小さなブロンズ風彫刻の3Dモデル。', 18000, 'https://placehold.jp/300x300.png', 'https://example.com/file.obj', '【creatorのUUIDを貼り付け】', 2, '商用利用ライセンス', '3Dプリントやゲームアセットとして利用可能です。', 'approved', NULL),
('ローポリの剣', 'ゲーム用に最適化されたローポリゴンの剣の3Dモデル。', 3000, 'https://placehold.jp/300x300.png', 'https://example.com/file.fbx', '【creatorのUUIDを貼り付け】', 2, '商用利用ライセンス', 'ゲームアセットとして自由に利用可能。', 'pending', NULL),
('ビジネスUIキット', 'モダンなウェブサイトやアプリ向けのUIコンポーネント集。', 20000, 'https://placehold.jp/300x300.png', 'https://example.com/file.fig', '【creatorのUUIDを貼り付け】', 3, '商用利用ライセンス', 'クライアントワークにも利用可能です。', 'pending', NULL),
('手書き風アイコンセット', '温かみのある手書き風のアイコン100個セット。', 2500, 'https://placehold.jp/300x300.png', 'https://example.com/file.svg', '【creatorのUUIDを貼り付け】', 4, '商用利用ライセンス', '個人・商用問わず利用できます。', 'pending', NULL),
('シネマティック動画LUT', '動画に映画のような色味を与えるカラーグレーディングプリセット。', 4500, 'https://placehold.jp/300x300.png', 'https://example.com/file.cube', '【creatorのUUIDを貼り付け】', 6, '商用利用ライセンス', 'YouTubeや映像制作にご利用ください。', 'pending', NULL),
('環境音：森の朝', '鳥のさえずりや小川のせせらぎを収録した高品質な環境音。', 1500, 'https://placehold.jp/300x300.png', 'https://example.com/file.wav', '【creatorのUUIDを貼り付け】', 7, '商用利用ライセンス', 'どのようなプロジェクトにも利用可能です。', 'pending', NULL),
('宇宙船のコックピット', 'SFの世界観を表現する宇宙船のコックピットの3Dモデル。', 22000, 'https://placehold.jp/300x300.png', 'https://example.com/file.blend', '【creatorのUUIDを貼り付け】', 2, '商用利用ライセンス', '映像作品やゲーム開発に最適です。', 'pending', NULL),
('水彩画の花々', '透明感あふれる水彩画で描かれた花々のイラストセット。', 6000, 'https://placehold.jp/300x300.png', 'https://example.com/file.png', '【creatorのUUIDを貼り付け】', 1, '個人利用ライセンス', 'グリーティングカードや招待状に。', 'pending', NULL),
('京都の路地裏', '風情ある京都の路地裏を撮影したノスタルジックな写真。', 7000, 'https://placehold.jp/300x300.png', 'https://example.com/file.jpg', '【creatorのUUIDを貼り付け】', 5, '商用利用ライセンス', 'ブログやウェブサイトのアイキャッチに。', 'pending', NULL),
('ミニマルなSNSテンプレート', 'シンプルなデザインのSNS投稿用テンプレート集（Canva対応）。', 3500, 'https://placehold.jp/300x300.png', 'https://example.com/file.zip', '【creatorのUUIDを貼り付け】', 3, '商用利用ライセンス', 'SNSマーケティングにご活用ください。', 'pending', NULL),
('コーポレートロゴアイコン', 'ビジネス向けのモダンでシンプルなロゴアイコンコレクション。', 4000, 'https://placehold.jp/300x300.png', 'https://example.com/file.ai', '【creatorのUUIDを貼り付け】', 4, '商用利用ライセンス', 'ロゴデザインのベースとして利用可能です。', 'pending', NULL),
('ドローン空撮：海岸線', 'ドローンで撮影した美しい海岸線の4K動画素材。', 12000, 'https://placehold.jp/300x300.png', 'https://example.com/file.mp4', '【creatorのUUIDを貼り付け】', 6, '商用利用ライセンス', 'プロモーションビデオやウェブサイトの背景に。', 'pending', NULL),
('Lo-Fi Hip Hopトラック', 'リラックスした雰囲気のLo-Fi Hip Hop BGM。', 3000, 'https://placehold.jp/300x300.png', 'https://example.com/file.mp3', '【creatorのUUIDを貼り付け】', 7, '商用利用ライセンス', '作業用BGMや動画のBGMとして。', 'pending', NULL),
('要修正のUIキット', 'UIが古いため修正が必要です。', 5000, 'https://placehold.jp/300x300.png', 'https://example.com/file.fig', '【creatorのUUIDを貼り付け】', 3, '商用利用ライセンス', '要修正のサンプルデータです。', 'rejected', 'UIのトンマナが古いため、最新のデザインガイドラインに合わせて修正してください。具体的には、余白を広げ、シャドウを削除し、角丸を大きくする必要があります。'),
('規約違反のイラスト', '規約違反のため非公開になりました。', 9999, 'https://placehold.jp/300x300.png', 'https://example.com/file.png', '【creatorのUUIDを貼り付け】', 1, '個人利用ライセンス', '禁止されているコンテンツです。', 'banned', '利用規約第5条（禁止事項）に記載の「暴力的・残虐な表現」に該当するため、非公開としました。');

-- `product_tags` テーブル: 上記の商品にタグを紐付けます
INSERT INTO public.product_tags (product_id, tag_id) VALUES
(1, 1), (1, 6), (2, 1), (2, 6), (3, 7), (3, 10), (4, 4), (4, 6), (4, 11), (5, 3), (6, 7), (7, 4), (7, 8), (8, 1), (8, 5), (8, 6), (9, 2), (9, 6), (10, 3), (10, 9), (11, 1), (11, 6), (12, 2), (12, 11), (13, 9), (13, 11), (14, 5), (15, 8), (16, 1), (16, 6), (17, 7), (18, 9), (18, 10), (19, 6), (19, 8), (20, 1), (20, 7), (21, 5), (22, 9), (23, 1), (23, 6), (24, 9);

-- `purchases` テーブル: `normal_user` が商品を購入した履歴を作成します
-- 【重要】 user_id を user のUUIDに書き換えてください
INSERT INTO public.purchases (user_id, product_id, created_at) VALUES
-- 1年以上前のデータ (5件)
('【userのUUIDを貼り付け】', 1, '2024-08-10 10:00:00+09'),
('【userのUUIDを貼り付け】', 2, '2024-07-25 11:30:00+09'),
('【userのUUIDを貼り付け】', 3, '2024-05-01 14:00:00+09'),
('【userのUUIDを貼り付け】', 4, '2023-12-11 09:00:00+09'),
('【userのUUIDを貼り付け】', 5, '2023-11-30 18:45:00+09'),
-- 今年のデータ (5件)
('【userのUUIDを貼り付け】', 6, '2025-01-15 20:00:00+09'),
('【userのUUIDを貼り付け】', 7, '2025-03-22 13:10:00+09'),
('【userのUUIDを貼り付け】', 8, '2025-05-18 15:00:00+09'),
('【userのUUIDを貼り付け】', 9, '2025-07-04 11:00:00+09'),
('【userのUUIDを貼り付け】', 10, '2025-08-01 16:20:00+09'),
-- 今月のデータ (5件)
('【userのUUIDを貼り付け】', 11, '2025-09-01 08:00:00+09'),
('【userのUUIDを貼り付け】', 12, '2025-09-03 12:30:00+09'),
('【userのUUIDを貼り付け】', 13, '2025-09-05 17:00:00+09'),
('【userのUUIDを貼り付け】', 14, '2025-09-08 21:00:00+09'),
('【userのUUIDを貼り付け】', 15, '2025-09-10 09:15:00+09');


-- `favorites` テーブル: `normal_user` がいくつかの商品をお気に入り登録した履歴を作成します
-- 【重要】 user_id を user のUUIDに書き換えてください
INSERT INTO public.favorites (user_id, product_id) VALUES
('【creatorのUUIDを貼り付け】', 2),
('【creatorのUUIDを貼り付け】', 6),
('【creatorのUUIDを貼り付け】', 9),
('【userのUUIDを貼り付け】', 2),
('【userのUUIDを貼り付け】', 6),
('【userのUUIDを貼り付け】', 9);

-- =========== contactsテーブルへのサンプルデータ ===========
INSERT INTO public.contacts (name, email, subject, message, status) VALUES
('山田太郎', 'taro.yamada@email.com', '作品の購入について', '「夜明けの海」の購入を検討しています。配送について質問があります。', '未対応'),
('鈴木花子', 'hanako.suzuki@email.com', 'ライセンスに関する質問', '「サイバーシティ」を企業のウェブサイトで使用する場合、追加料金は発生しますか？', '未対応'),
('田中一郎', 'ichiro.tanaka@email.com', '不具合報告', 'サイトにログインできません。', '対応済み');