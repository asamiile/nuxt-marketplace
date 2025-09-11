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

DROP FUNCTION IF EXISTS search_products(bigint, bigint[], text, double precision, double precision);
DROP FUNCTION IF EXISTS search_products(bigint, bigint[], text, numeric, numeric);
DROP FUNCTION IF EXISTS count_search_products(bigint, bigint[], text, double precision, double precision);

create or replace function search_products(
  p_category_id bigint,
  p_tag_ids bigint[],
  p_keyword text,
  p_min_price numeric,
  p_max_price numeric
)
returns table (
  id bigint,
  name text,
  description text,
  price numeric,
  image_url text,
  category_id bigint,
  creator_id uuid,
  created_at timestamp with time zone,
  status text,
  category_name text,
  username text,
  total_count bigint
) as $$
begin
  return query
  with filtered_products as (
    select
      p.id,
      p.name,
      p.description,
      p.price,
      p.image_url,
      p.category_id,
      p.creator_id,
      p.created_at,
      p.status,
      c.name as category_name,
      pr.username
    from
      products p
      left join categories c on p.category_id = c.id
      join profiles pr on p.creator_id = pr.id
    where
      p.status = 'approved'
      and (p_category_id is null or p.category_id = p_category_id)
      and (p_keyword is null or p.name ilike '%' || p_keyword || '%')
      and (p_min_price is null or p.price >= p_min_price)
      and (p_max_price is null or p.price <= p_max_price)
      and (
        p_tag_ids is null or array_length(p_tag_ids, 1) = 0 or p.id in (
          select
            pt.product_id
          from
            product_tags pt
          where
            pt.tag_id = any(p_tag_ids)
          group by
            pt.product_id
          having
            count(distinct pt.tag_id) = array_length(p_tag_ids, 1)
        )
      )
  )
  select
    *,
    (select count(*) from filtered_products) as total_count
  from
    filtered_products
  order by
    created_at desc;
end;
$$ language plpgsql;