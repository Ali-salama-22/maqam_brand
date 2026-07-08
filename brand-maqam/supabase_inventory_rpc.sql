-- Function to place an order and deduct stock atomically
CREATE OR REPLACE FUNCTION place_order_with_stock_deduction(
  p_user_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_address text,
  p_alt_phone text,
  p_total_amount numeric,
  p_items jsonb
) RETURNS uuid AS $$
DECLARE
  new_order_id uuid;
  item jsonb;
  p_id uuid;
  p_size text;
  p_color text;
  p_qty int;
  current_stock int;
BEGIN
  -- 1. Insert the order
  INSERT INTO orders (
    user_id,
    customer_name,
    phone,
    address,
    alt_phone,
    total,
    total_amount,
    status,
    items
  ) VALUES (
    p_user_id,
    p_customer_name,
    p_customer_phone,
    p_customer_address,
    p_alt_phone,
    p_total_amount,
    p_total_amount,
    'قيد المراجعة',
    p_items
  ) RETURNING id INTO new_order_id;

  -- 2. Loop through cart items and deduct stock
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    p_id := (item->>'id')::uuid;
    p_size := item->>'size';
    p_color := item->>'color';
    p_qty := (item->>'qty')::int;

    -- Check if stock is sufficient (optional but recommended)
    SELECT COALESCE((v->'sizes_stock'->>p_size)::int, 0) INTO current_stock
    FROM products p, jsonb_array_elements(p.variants) AS v
    WHERE p.id = p_id AND v->>'hex' IS NOT DISTINCT FROM p_color;

    IF current_stock < p_qty THEN
      RAISE EXCEPTION 'Insufficient stock for product ID %, Size %, Color %', p_id, p_size, p_color;
    END IF;

    -- Update the variants jsonb array in the products table
    UPDATE products
    SET variants = (
        SELECT jsonb_agg(
            CASE WHEN v->>'hex' IS NOT DISTINCT FROM p_color THEN
                jsonb_set(
                    v,
                    array['sizes_stock', p_size],
                    to_jsonb(COALESCE((v->'sizes_stock'->>p_size)::int, 0) - p_qty)
                )
            ELSE
                v
            END
        )
        FROM jsonb_array_elements(variants) AS v
    ),
    stock_count = stock_count - p_qty
    WHERE id = p_id;
  END LOOP;

  RETURN new_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to restock abandoned orders (older than 24h)
CREATE OR REPLACE FUNCTION restock_abandoned_orders() RETURNS int AS $$
DECLARE
  abandoned_order RECORD;
  item jsonb;
  p_id uuid;
  p_size text;
  p_color text;
  p_qty int;
  restocked_count int := 0;
BEGIN
  FOR abandoned_order IN 
    SELECT id, items FROM orders 
    WHERE status = 'قيد المراجعة' AND created_at < NOW() - INTERVAL '24 hours'
  LOOP
    -- Mark order as cancelled
    UPDATE orders SET status = 'ملغي' WHERE id = abandoned_order.id;

    -- Restock items
    FOR item IN SELECT * FROM jsonb_array_elements(abandoned_order.items)
    LOOP
      p_id := (item->>'id')::uuid;
      p_size := item->>'size';
      p_color := item->>'color';
      p_qty := (item->>'qty')::int;

      UPDATE products
      SET variants = (
          SELECT jsonb_agg(
              CASE WHEN v->>'hex' IS NOT DISTINCT FROM p_color THEN
                  jsonb_set(
                      v,
                      array['sizes_stock', p_size],
                      to_jsonb(COALESCE((v->'sizes_stock'->>p_size)::int, 0) + p_qty)
                  )
              ELSE
                  v
              END
          )
          FROM jsonb_array_elements(variants) AS v
      ),
      stock_count = stock_count + p_qty
      WHERE id = p_id;
    END LOOP;

    restocked_count := restocked_count + 1;
  END LOOP;

  RETURN restocked_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
