ALTER TABLE public.categories
ADD COLUMN is_public BOOLEAN DEFAULT true;

ALTER TABLE public.tags
ADD COLUMN is_public BOOLEAN DEFAULT true;
