-- Create the create_product function for transactional product submission
CREATE OR REPLACE FUNCTION create_product(
    p_name TEXT,
    p_description TEXT,
    p_price NUMERIC,
    p_category_id BIGINT,
    p_image_url TEXT,
    p_file_url TEXT,
    p_license_type TEXT,
    p_terms_of_use TEXT,
    p_tag_names TEXT[],
    p_is_admin BOOLEAN
)
RETURNS BIGINT -- Returns the ID of the created product
LANGUAGE plpgsql
SECURITY DEFINER -- IMPORTANT: This allows the function to bypass RLS
AS $$
DECLARE
    new_product_id BIGINT;
    tag_name TEXT;
    tag_id_to_insert BIGINT;
BEGIN
    -- 1. Insert the product into the products table
    INSERT INTO public.products (name, description, price, category_id, image_url, file_url, license_type, terms_of_use, creator_id, status)
    VALUES (p_name, p_description, p_price, p_category_id, p_image_url, p_file_url, p_license_type, p_terms_of_use, auth.uid(), CASE WHEN p_is_admin THEN 'approved' ELSE 'pending' END)
    RETURNING id INTO new_product_id;

    -- 2. Upsert tags and link them in product_tags
    IF array_length(p_tag_names, 1) > 0 THEN
        FOREACH tag_name IN ARRAY p_tag_names
        LOOP
            -- Upsert the tag into the tags table.
            -- Note: User-created tags are not public by default.
            INSERT INTO public.tags (name, is_public)
            VALUES (tag_name, false)
            ON CONFLICT (name) DO NOTHING;

            -- Get the ID of the inserted or existing tag
            SELECT id INTO tag_id_to_insert FROM public.tags WHERE name = tag_name;

            -- Link the product and tag
            INSERT INTO public.product_tags (product_id, tag_id)
            VALUES (new_product_id, tag_id_to_insert);
        END LOOP;
    END IF;

    -- 3. Return the ID of the created product
    RETURN new_product_id;
END;
$$;
