-- 1. Get Monthly Sales
CREATE OR REPLACE FUNCTION get_monthly_sales()
RETURNS NUMERIC
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(p.price), 0)
  FROM public.purchases pu
  JOIN public.products p ON pu.product_id = p.id
  WHERE pu.created_at >= date_trunc('month', NOW())
    AND pu.created_at < date_trunc('month', NOW()) + interval '1 month';
$$;

-- 2. Count New Users This Month
CREATE OR REPLACE FUNCTION count_new_users()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)
  FROM auth.users
  WHERE created_at >= date_trunc('month', NOW())
    AND created_at < date_trunc('month', NOW()) + interval '1 month';
$$;

-- 3. Count Pending Products
CREATE OR REPLACE FUNCTION count_pending_products()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)
  FROM public.products
  WHERE status = 'pending';
$$;

-- 4. Count Unresolved Contacts
CREATE OR REPLACE FUNCTION count_unresolved_contacts()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)
  FROM public.contacts
  WHERE status = '未対応';
$$;
