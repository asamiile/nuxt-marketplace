-- This migration updates the get_all_users function to support searching.
-- It also adds the username to the returned columns and fixes a bug
-- where it was looking at raw_user_meta_data instead of raw_app_meta_data for the admin claim.

create or replace function get_all_users(p_search_term text default null)
returns table (
  id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  is_admin boolean,
  username text
) as $$
begin
  -- First, check if the user is an admin.
  -- This function is defined in the initial migration.
  if not is_claims_admin() then
    raise exception 'Admin privileges required';
  end if;

  -- Return the query result.
  return query
  select
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    coalesce((u.raw_app_meta_data->>'claims_admin')::boolean, false) as is_admin,
    p.username
  from auth.users u
  left join public.profiles p on u.id = p.id
  where
    -- If no search term is provided, return all users.
    p_search_term is null or
    -- Otherwise, filter by email or username.
    u.email ilike '%' || p_search_term || '%' or
    p.username ilike '%' || p_search_term || '%'
  order by u.created_at desc;
end;
$$ language plpgsql security definer;
