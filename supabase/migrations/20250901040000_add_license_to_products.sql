-- Add license_type and terms_of_use to products table
ALTER TABLE public.products
  ADD COLUMN license_type TEXT,
  ADD COLUMN terms_of_use TEXT;

-- Add comments for the new columns
COMMENT ON COLUMN public.products.license_type IS 'The type of license for the product (e.g., "Standard License", "Extended License").';
COMMENT ON COLUMN public.products.terms_of_use IS 'The detailed terms of use for the product.';
