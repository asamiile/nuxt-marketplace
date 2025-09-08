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
CREATE OR REPLACE FUNCTION public.get_sales_history()
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