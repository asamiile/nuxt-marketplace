CREATE OR REPLACE FUNCTION public.get_sales_history()
RETURNS TABLE (
  product_id BIGINT,
  product_name TEXT,
  price NUMERIC,
  purchased_at TIMESTAMPTZ,
  purchaser_username TEXT
)
LANGUAGE plpgsql STABLE SECURITY INVOKER AS $$
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
