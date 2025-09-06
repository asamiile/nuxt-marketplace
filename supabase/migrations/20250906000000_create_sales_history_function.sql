CREATE OR REPLACE FUNCTION get_sales_history()
RETURNS TABLE (
  product_id BIGINT,
  product_name TEXT,
  price NUMERIC,
  purchased_at TIMESTAMPTZ,
  purchaser_username TEXT
)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS product_id,
    p.name AS product_name,
    p.price,
    pu.created_at AS purchased_at,
    purchaser_profile.username AS purchaser_username
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
$$ LANGUAGE plpgsql;
