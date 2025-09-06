-- This migration was created manually because the `supabase` CLI was not available in the environment.
-- It defines the RLS helper functions as requested.

/**
* RLS HELPER FUNCTIONS
* - These functions are used by RLS policies to check user claims.
*/

-- JWTから指定されたカスタムクレームを読み取る
create or replace function get_my_claim(claim TEXT) returns jsonb as $$
  select nullif(current_setting('request.jwt.claims', true), '')::jsonb -> claim
$$ language sql stable;

-- 現在のユーザーが管理者クレームを持っているか確認する
create or replace function is_claims_admin() returns boolean as $$
  select coalesce(get_my_claim('claims_admin')::boolean, false)
$$ language sql stable;
