-- is_readカラムを削除
ALTER TABLE public.contacts DROP COLUMN IF EXISTS is_read;

-- statusカラムを追加（デフォルト値: '未対応'）
ALTER TABLE public.contacts ADD COLUMN status TEXT NOT NULL DEFAULT '未対応';
