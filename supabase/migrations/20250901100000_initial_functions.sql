-- =========== RLSヘルパー関数定義 (ポリシーより先に定義) ===========

/**
* RLS HELPER FUNCTIONS
* - These functions are used by RLS policies to check user claims.
*/
create or replace function get_my_claim(claim TEXT) returns jsonb as $$
  select nullif(current_setting('request.jwt.claims', true), '')::jsonb -> claim
$$ language sql stable;

create or replace function is_claims_admin() returns boolean as $$
  select coalesce(get_my_claim('claims_admin')::boolean, false)
$$ language sql stable;


-- =========== データベース関数定義 ===========

-- Trigger function for new user profiles
CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Sales history function
CREATE OR REPLACE FUNCTION public.get_sales_history(
  start_date TIMESTAMPTZ DEFAULT NULL,
  end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  product_id BIGINT,
  product_name TEXT,
  price NUMERIC,
  purchased_at TIMESTAMptz,
  purchaser_username TEXT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.price,
    pu.created_at,
    purchaser_profile.username
  FROM
    public.purchases pu
  JOIN
    public.products p ON pu.product_id = p.id
  JOIN
    public.profiles purchaser_profile ON pu.user_id = purchaser_profile.id
  WHERE
    p.creator_id = auth.uid()
    AND (start_date IS NULL OR pu.created_at >= start_date)
    AND (end_date IS NULL OR pu.created_at <= end_date)
  ORDER BY
    pu.created_at DESC;
END;
$$;

-- User management functions
create or replace function get_all_users()
returns table (
  id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  is_admin boolean
) as $$
begin
  if not is_claims_admin() then
    raise exception 'Admin privileges required';
  end if;
  return query
  select
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    coalesce((u.raw_user_meta_data->>'claims_admin')::boolean, false) as is_admin
  from auth.users u
  order by u.created_at desc;
end;
$$ language plpgsql security definer;

create or replace function set_admin_status(user_id uuid, p_is_admin boolean)
returns void as $$
begin
  if not is_claims_admin() then
    raise exception 'Admin privileges required';
  end if;
  update auth.users
  set raw_app_meta_data = raw_app_meta_data || jsonb_build_object('claims_admin', p_is_admin)
  where id = user_id;
end;
$$ language plpgsql security definer;

-- search_products functions
-- Drop existing functions to avoid conflicts before creating new ones.
DROP FUNCTION IF EXISTS public.search_products(bigint, bigint[], text, text, text);
DROP FUNCTION IF EXISTS public._search_products_internal(bigint, bigint[], text, numeric, numeric);
-- Drop old versions just in case
DROP FUNCTION IF EXISTS public.search_products(bigint, bigint[], text, numeric, numeric);


-- Public-facing function exposed to PostgREST.
-- Handles TEXT input for price, converting empty strings to NULL, then calls the internal function.
CREATE OR REPLACE FUNCTION public.search_products(
    p_category_id BIGINT DEFAULT NULL,
    p_tag_ids BIGINT[] DEFAULT NULL,
    p_keyword TEXT DEFAULT NULL,
    p_min_price TEXT DEFAULT NULL,
    p_max_price TEXT DEFAULT NULL
)
RETURNS TABLE (
    id BIGINT,
    created_at TIMESTAMPTZ,
    name TEXT,
    description TEXT,
    price NUMERIC,
    image_url TEXT,
    file_url TEXT,
    creator_id UUID,
    license_type TEXT,
    terms_of_use TEXT,
    category_id BIGINT,
    status TEXT,
    admin_notes TEXT,
    category_name TEXT,
    profiles JSON,
    total_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public._search_products_internal(
        p_category_id,
        p_tag_ids,
        p_keyword,
        NULLIF(p_min_price, '')::NUMERIC,
        NULLIF(p_max_price, '')::NUMERIC
    );
END;
$$;


-- Internal function that performs the actual search logic.
-- Accepts NUMERIC for price and is not directly exposed to the API.
CREATE OR REPLACE FUNCTION public._search_products_internal(
    p_category_id BIGINT DEFAULT NULL,
    p_tag_ids BIGINT[] DEFAULT NULL,
    p_keyword TEXT DEFAULT NULL,
    p_min_price NUMERIC DEFAULT NULL,
    p_max_price NUMERIC DEFAULT NULL
)
RETURNS TABLE (
    id BIGINT,
    created_at TIMESTAMPTZ,
    name TEXT,
    description TEXT,
    price NUMERIC,
    image_url TEXT,
    file_url TEXT,
    creator_id UUID,
    license_type TEXT,
    terms_of_use TEXT,
    category_id BIGINT,
    status TEXT,
    admin_notes TEXT,
    category_name TEXT,
    profiles JSON,
    total_count BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
    tag_count INT := array_length(p_tag_ids, 1);
BEGIN
    RETURN QUERY
    WITH filtered_products AS (
        SELECT p.id as product_id
        FROM products p
        LEFT JOIN product_tags pt ON p.id = pt.product_id
        WHERE
            p.status = 'approved'
            AND (p_category_id IS NULL OR p.category_id = p_category_id)
            AND (p_keyword IS NULL OR p.name ILIKE '%' || p_keyword || '%')
            AND (p_min_price IS NULL OR p.price >= p_min_price)
            AND (p_max_price IS NULL OR p.price <= p_max_price)
        GROUP BY p.id
        HAVING
            (tag_count IS NULL OR tag_count = 0) OR
            (COUNT(DISTINCT pt.tag_id) FILTER (WHERE pt.tag_id = ANY(p_tag_ids))) = tag_count
    )
    SELECT
        p.id,
        p.created_at,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.file_url,
        p.creator_id,
        p.license_type,
        p.terms_of_use,
        p.category_id,
        p.status,
        p.admin_notes,
        c.name AS category_name,
        json_build_object('username', COALESCE(pr.username, p.creator_id::TEXT), 'avatar_url', pr.avatar_url) as profiles,
        (SELECT COUNT(*) FROM filtered_products) AS total_count
    FROM
        products p
    LEFT JOIN
        profiles pr ON p.creator_id = pr.id
    LEFT JOIN
        categories c ON p.category_id = c.id
    WHERE
        p.id IN (SELECT product_id FROM filtered_products)
    ORDER BY
        p.created_at DESC;
END;
$$;