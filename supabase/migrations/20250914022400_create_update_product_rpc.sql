-- Create the update_product function for transactional product updates
CREATE OR REPLACE FUNCTION update_product(
    p_product_id BIGINT,
    p_name TEXT,
    p_description TEXT,
    p_price NUMERIC,
    p_category_id BIGINT,
    p_image_url TEXT,
    p_file_url TEXT,
    p_license_type TEXT,
    p_terms_of_use TEXT,
    p_tag_ids BIGINT[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    tag_id_to_insert BIGINT;
    current_creator_id UUID;
BEGIN
    -- First, verify that the user calling the function is the product's creator
    SELECT creator_id INTO current_creator_id FROM public.products WHERE id = p_product_id;

    IF current_creator_id IS NULL THEN
        RAISE EXCEPTION 'Product with ID % not found.', p_product_id;
    END IF;

    IF current_creator_id != auth.uid() THEN
        RAISE EXCEPTION 'User does not have permission to update this product.';
    END IF;

    -- 1. Update the product details.
    --    Reset status to 'pending' for re-approval.
    UPDATE public.products
    SET
        name = p_name,
        description = p_description,
        price = p_price,
        category_id = p_category_id,
        image_url = p_image_url,
        file_url = p_file_url,
        license_type = p_license_type,
        terms_of_use = p_terms_of_use,
        status = 'pending',
        updated_at = now()
    WHERE id = p_product_id;

    -- 2. Delete existing tag relationships for the product
    DELETE FROM public.product_tags WHERE product_id = p_product_id;

    -- 3. Insert new tag relationships
    IF array_length(p_tag_ids, 1) > 0 THEN
        FOREACH tag_id_to_insert IN ARRAY p_tag_ids
        LOOP
            INSERT INTO public.product_tags (product_id, tag_id)
            VALUES (p_product_id, tag_id_to_insert);
        END LOOP;
    END IF;

END;
$$;
