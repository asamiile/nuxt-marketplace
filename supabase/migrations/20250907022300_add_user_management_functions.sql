-- 1. 全ユーザーの情報を安全に取得するための関数
--    `security definer`により、この関数は高い権限で実行されます。
create or replace function get_all_users()
returns table (
  id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  is_admin boolean
) as $$
begin
  -- 関数を呼び出せるのを管理者のみに制限します
  if not is_claims_admin() then
    raise exception 'Admin privileges required';
  end if;

  return query
  select
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    coalesce((u.raw_app_meta_data->>'claims_admin')::boolean, false) as is_admin
  from auth.users u
  order by u.created_at desc;
end;
$$ language plpgsql security definer;


-- 2. ユーザーの管理者権限を更新するための関数
create or replace function set_admin_status(user_id uuid, p_is_admin boolean)
returns void as $$
begin
  -- 関数を呼び出せるのを管理者のみに制限します
  if not is_claims_admin() then
    raise exception 'Admin privileges required';
  end if;

  update auth.users
  set raw_app_meta_data = raw_app_meta_data || jsonb_build_object('claims_admin', p_is_admin)
  where id = user_id;
end;
$$ language plpgsql security definer;
