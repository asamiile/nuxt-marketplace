-- A temporary function to debug RLS issues.
-- This function returns the value of the 'claims_admin' claim from the JWT's raw_app_meta_data as text.
-- This allows us to see exactly what Postgres sees.
CREATE OR REPLACE FUNCTION public.get_my_claim_as_text()
RETURNS TEXT
LANGUAGE sql
SECURITY definer
SET search_path = public
AS $$
  SELECT auth.jwt() -> 'raw_app_meta_data' ->> 'claims_admin'
$$;
