-- supabase/seeds.sql

-- Clear existing data to avoid conflicts
TRUNCATE TABLE public.categories RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.tags RESTART IDENTITY CASCADE;
-- TRUNCATE other tables if needed for a clean seed

-- Seed initial categories
INSERT INTO public.categories (name)
VALUES
  ('イラスト'),
  ('3Dモデル'),
  ('UIキット'),
  ('アイコン'),
  ('写真'),
  ('動画素材'),
  ('音楽・効果音');

-- Seed initial tags (optional example)
INSERT INTO public.tags (name)
VALUES
  ('可愛い'),
  ('クール'),
  ('サイバーパンク'),
  ('ファンタジー');

-- You can add seed data for test users or products below if necessary.
-- Make sure to use existing user IDs from your test environment.
