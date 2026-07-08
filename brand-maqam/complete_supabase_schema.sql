-- ============================================================================
-- BRAND MAQAM - COMPLETE SUPABASE SCHEMA (SAFE TO RE-RUN)
-- ============================================================================
-- يمسح السياسات القديمة اولا ثم ينشئ كل شيء من الصفر بامان
-- ============================================================================


-- ======================================================
-- STEP 1: DROP ALL OLD POLICIES (no duplicate errors)
-- ======================================================

DROP POLICY IF EXISTS "categories: public read" ON public.categories;
DROP POLICY IF EXISTS "categories: admin insert" ON public.categories;
DROP POLICY IF EXISTS "categories: admin update" ON public.categories;
DROP POLICY IF EXISTS "categories: admin delete" ON public.categories;
DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;

DROP POLICY IF EXISTS "products: public read" ON public.products;
DROP POLICY IF EXISTS "products: admin insert" ON public.products;
DROP POLICY IF EXISTS "products: admin update" ON public.products;
DROP POLICY IF EXISTS "products: admin delete" ON public.products;
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;

DROP POLICY IF EXISTS "orders: public insert" ON public.orders;
DROP POLICY IF EXISTS "orders: select own or admin" ON public.orders;
DROP POLICY IF EXISTS "orders: admin update" ON public.orders;
DROP POLICY IF EXISTS "orders: admin delete" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert to orders" ON public.orders;
DROP POLICY IF EXISTS "Users read own orders or admin reads all" ON public.orders;

DROP POLICY IF EXISTS "store_settings: public read" ON public.store_settings;
DROP POLICY IF EXISTS "store_settings: admin insert" ON public.store_settings;
DROP POLICY IF EXISTS "store_settings: admin update" ON public.store_settings;
DROP POLICY IF EXISTS "store_settings: admin delete" ON public.store_settings;
DROP POLICY IF EXISTS "Anyone can read store_settings" ON public.store_settings;

DROP POLICY IF EXISTS "loyalty_points: public read" ON public.loyalty_points;
DROP POLICY IF EXISTS "loyalty_points: admin insert" ON public.loyalty_points;
DROP POLICY IF EXISTS "loyalty_points: admin update" ON public.loyalty_points;
DROP POLICY IF EXISTS "loyalty_points: admin delete" ON public.loyalty_points;

DROP POLICY IF EXISTS "profiles: public read" ON public.profiles;
DROP POLICY IF EXISTS "profiles: user insert own" ON public.profiles;
DROP POLICY IF EXISTS "profiles: user update own" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

DROP POLICY IF EXISTS "site_visits: public read" ON public.site_visits;
DROP POLICY IF EXISTS "site_visits: public insert" ON public.site_visits;
DROP POLICY IF EXISTS "site_visits: public update" ON public.site_visits;

DROP POLICY IF EXISTS "favorites: user read own" ON public.favorites;
DROP POLICY IF EXISTS "favorites: user insert own" ON public.favorites;
DROP POLICY IF EXISTS "favorites: user delete own" ON public.favorites;

DROP POLICY IF EXISTS "offers: public read" ON public.offers;
DROP POLICY IF EXISTS "offers: admin insert" ON public.offers;
DROP POLICY IF EXISTS "offers: admin update" ON public.offers;
DROP POLICY IF EXISTS "offers: admin delete" ON public.offers;

DROP POLICY IF EXISTS "storage: public read" ON storage.objects;
DROP POLICY IF EXISTS "storage: admin upload" ON storage.objects;
DROP POLICY IF EXISTS "storage: admin update" ON storage.objects;
DROP POLICY IF EXISTS "storage: admin delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to maqam-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin only: upload to maqam-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin only: update maqam-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin only: delete from maqam-assets" ON storage.objects;


-- ======================================================
-- STEP 2: EXTENSIONS
-- ======================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ======================================================
-- STEP 3: CREATE TABLES
-- ======================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id           uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name         text NOT NULL,
  slug         text,
  display_type text,
  image_url    text,
  icon_name    text DEFAULT 'CircleDashed',
  created_at   timestamptz DEFAULT timezone('utc', now()) NOT NULL
);
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS display_type text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon_name text DEFAULT 'CircleDashed';

CREATE TABLE IF NOT EXISTS public.products (
  id                uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name              text NOT NULL,
  description       text NOT NULL,
  price             numeric NOT NULL,
  wholesale_price   numeric,
  old_price         numeric,
  discount_percent  integer,
  sizes             text[] NOT NULL DEFAULT '{}',
  colors            jsonb NOT NULL DEFAULT '[]',
  image_url         text,
  is_new_collection boolean DEFAULT false,
  is_offer          boolean DEFAULT false,
  is_neon_offer     boolean DEFAULT false,
  category_id       uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  variants          jsonb DEFAULT '[]',
  stock_count       integer DEFAULT 0,
  slug              text,
  created_at        timestamptz DEFAULT timezone('utc', now()) NOT NULL
);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS wholesale_price numeric;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS old_price numeric;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_percent integer;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sizes text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS colors jsonb NOT NULL DEFAULT '[]';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_new_collection boolean DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_offer boolean DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_neon_offer boolean DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variants jsonb DEFAULT '[]';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_count integer DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug text;

CREATE TABLE IF NOT EXISTS public.orders (
  id            uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text,
  phone         text,
  alt_phone     text,
  address       text,
  total         numeric NOT NULL,
  status        text NOT NULL DEFAULT 'قيد المراجعة',
  items         jsonb DEFAULT '[]',
  created_at    timestamptz DEFAULT timezone('utc', now()) NOT NULL
);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS alt_phone text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total numeric;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'قيد المراجعة';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items jsonb DEFAULT '[]';

CREATE TABLE IF NOT EXISTS public.loyalty_points (
  id           uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email   text NOT NULL UNIQUE,
  total_orders integer DEFAULT 0,
  vip_eligible boolean DEFAULT false,
  created_at   timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email      text,
  full_name  text,
  phone      text,
  address    text,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT timezone('utc', now());

CREATE TABLE IF NOT EXISTS public.store_settings (
  id                      integer PRIMARY KEY DEFAULT 1,
  banner_text             text NOT NULL DEFAULT 'لكل مقام مقال.. ولكل مقال مقام',
  loyalty_order_threshold integer DEFAULT 5,
  loyalty_discount_value  integer DEFAULT 15,
  updated_at              timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  CONSTRAINT store_settings_single_row CHECK (id = 1)
);
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS loyalty_order_threshold integer DEFAULT 5;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS loyalty_discount_value integer DEFAULT 15;

INSERT INTO public.store_settings (id, banner_text, loyalty_order_threshold, loyalty_discount_value)
VALUES (1, 'لكل مقام مقال.. ولكل مقال مقام', 5, 15)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.site_visits (
  visit_date     date PRIMARY KEY DEFAULT current_date,
  visitors_count integer DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.favorites (
  id         uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.offers (
  id            uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title         text NOT NULL,
  description   text,
  discount_code text,
  image_url     text,
  created_at    timestamptz DEFAULT timezone('utc', now()) NOT NULL
);


-- ======================================================
-- STEP 4: FUNCTIONS & TRIGGERS
-- ======================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'عميل مقام')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


CREATE OR REPLACE FUNCTION public.increment_daily_visit()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
  INSERT INTO public.site_visits (visit_date, visitors_count)
  VALUES (current_date, 1)
  ON CONFLICT (visit_date)
  DO UPDATE SET visitors_count = site_visits.visitors_count + 1;
END;
$func$;


CREATE OR REPLACE FUNCTION public.place_order_with_stock_deduction(
  p_user_id          uuid,
  p_customer_name    text,
  p_customer_phone   text,
  p_customer_address text,
  p_alt_phone        text,
  p_total_amount     numeric,
  p_items            jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  new_order_id  uuid;
  item          jsonb;
  p_id          uuid;
  p_size        text;
  p_color       text;
  p_qty         int;
  current_stock int;
BEGIN
  INSERT INTO public.orders (
    user_id, customer_name, phone, address, alt_phone, total, total_amount, status, items
  ) VALUES (
    p_user_id, p_customer_name, p_customer_phone, p_customer_address,
    p_alt_phone, p_total_amount, p_total_amount, 'قيد المراجعة', p_items
  ) RETURNING id INTO new_order_id;

  FOR item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    p_id    := (item->>'id')::uuid;
    p_size  := item->>'size';
    p_color := item->>'color';
    p_qty   := (item->>'qty')::int;

    SELECT COALESCE((v->'sizes_stock'->>p_size)::int, 0) INTO current_stock
    FROM public.products pr, jsonb_array_elements(pr.variants) AS v
    WHERE pr.id = p_id AND v->>'hex' IS NOT DISTINCT FROM p_color;

    IF current_stock IS NOT NULL AND current_stock < p_qty THEN
      RAISE EXCEPTION 'Insufficient stock for product %, size %, color %', p_id, p_size, p_color;
    END IF;

    UPDATE public.products
    SET
      variants = (
        SELECT jsonb_agg(
          CASE WHEN v->>'hex' IS NOT DISTINCT FROM p_color
            THEN jsonb_set(v, ARRAY['sizes_stock', p_size],
                   to_jsonb(COALESCE((v->'sizes_stock'->>p_size)::int, 0) - p_qty))
            ELSE v
          END
        )
        FROM jsonb_array_elements(variants) AS v
      ),
      stock_count = GREATEST(0, stock_count - p_qty)
    WHERE id = p_id;
  END LOOP;

  RETURN new_order_id;
END;
$func$;


CREATE OR REPLACE FUNCTION public.restock_abandoned_orders()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  abandoned_order  RECORD;
  item             jsonb;
  p_id             uuid;
  p_size           text;
  p_color          text;
  p_qty            int;
  restocked_count  int := 0;
BEGIN
  FOR abandoned_order IN
    SELECT id, items FROM public.orders
    WHERE status = 'قيد المراجعة'
      AND created_at < NOW() - INTERVAL '24 hours'
  LOOP
    UPDATE public.orders SET status = 'ملغي' WHERE id = abandoned_order.id;

    FOR item IN SELECT * FROM jsonb_array_elements(abandoned_order.items) LOOP
      p_id    := (item->>'id')::uuid;
      p_size  := item->>'size';
      p_color := item->>'color';
      p_qty   := (item->>'qty')::int;

      UPDATE public.products
      SET
        variants = (
          SELECT jsonb_agg(
            CASE WHEN v->>'hex' IS NOT DISTINCT FROM p_color
              THEN jsonb_set(v, ARRAY['sizes_stock', p_size],
                     to_jsonb(COALESCE((v->'sizes_stock'->>p_size)::int, 0) + p_qty))
              ELSE v
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
$func$;


-- ======================================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- ======================================================
ALTER TABLE public.categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visits    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers         ENABLE ROW LEVEL SECURITY;


-- ======================================================
-- STEP 6: CREATE RLS POLICIES
-- ======================================================

-- Categories
CREATE POLICY "categories: public read"  ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories: admin insert" ON public.categories FOR INSERT WITH CHECK ((SELECT email FROM public.profiles WHERE id = auth.uid()) = 'alo1234salama@gmail.com');
CREATE POLICY "categories: admin update" ON public.categories FOR UPDATE  USING ((SELECT email FROM public.profiles WHERE id = auth.uid()) = 'alo1234salama@gmail.com');
CREATE POLICY "categories: admin delete" ON public.categories FOR DELETE  USING ((SELECT email FROM public.profiles WHERE id = auth.uid()) = 'alo1234salama@gmail.com');

-- Products
CREATE POLICY "products: public read"  ON public.products FOR SELECT USING (true);
CREATE POLICY "products: admin insert" ON public.products FOR INSERT WITH CHECK ((SELECT email FROM public.profiles WHERE id = auth.uid()) = 'alo1234salama@gmail.com');
CREATE POLICY "products: admin update" ON public.products FOR UPDATE  USING ((SELECT email FROM public.profiles WHERE id = auth.uid()) = 'alo1234salama@gmail.com');
CREATE POLICY "products: admin delete" ON public.products FOR DELETE  USING ((SELECT email FROM public.profiles WHERE id = auth.uid()) = 'alo1234salama@gmail.com');

-- Orders
CREATE POLICY "orders: public insert"       ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders: select own or admin" ON public.orders FOR SELECT  USING (
  (SELECT email FROM public.profiles WHERE id = auth.uid()) = 'alo1234salama@gmail.com'
  OR auth.uid() = user_id
  OR user_id IS NULL
);
CREATE POLICY "orders: admin update" ON public.orders FOR UPDATE USING ((SELECT email FROM public.profiles WHERE id = auth.uid()) = 'alo1234salama@gmail.com');
CREATE POLICY "orders: admin delete" ON public.orders FOR DELETE USING ((SELECT email FROM public.profiles WHERE id = auth.uid()) = 'alo1234salama@gmail.com');

-- Store Settings
CREATE POLICY "store_settings: public read"  ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "store_settings: admin insert" ON public.store_settings FOR INSERT WITH CHECK ((SELECT email FROM public.profiles WHERE id = auth.uid()) = 'alo1234salama@gmail.com');
CREATE POLICY "store_settings: admin update" ON public.store_settings FOR UPDATE  USING ((SELECT email FROM public.profiles WHERE id = auth.uid()) = 'alo1234salama@gmail.com');
CREATE POLICY "store_settings: admin delete" ON public.store_settings FOR DELETE  USING ((SELECT email FROM public.profiles WHERE id = auth.uid()) = 'alo1234salama@gmail.com');

-- Loyalty Points
CREATE POLICY "loyalty_points: public read"  ON public.loyalty_points FOR SELECT USING (true);
CREATE POLICY "loyalty_points: admin insert" ON public.loyalty_points FOR INSERT WITH CHECK ((SELECT email FROM public.profiles WHERE id = auth.uid()) = 'alo1234salama@gmail.com');
CREATE POLICY "loyalty_points: admin update" ON public.loyalty_points FOR UPDATE  USING ((SELECT email FROM public.profiles WHERE id = auth.uid()) = 'alo1234salama@gmail.com');
CREATE POLICY "loyalty_points: admin delete" ON public.loyalty_points FOR DELETE  USING ((SELECT email FROM public.profiles WHERE id = auth.uid()) = 'alo1234salama@gmail.com');

-- Profiles
CREATE POLICY "profiles: public read"     ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles: user insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles: user update own" ON public.profiles FOR UPDATE  USING (auth.uid() = id);

-- Site Visits
CREATE POLICY "site_visits: public read"   ON public.site_visits FOR SELECT USING (true);
CREATE POLICY "site_visits: public insert" ON public.site_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "site_visits: public update" ON public.site_visits FOR UPDATE  USING (true);

-- Favorites
CREATE POLICY "favorites: user read own"   ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorites: user insert own" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites: user delete own" ON public.favorites FOR DELETE  USING (auth.uid() = user_id);

-- Offers
CREATE POLICY "offers: public read"  ON public.offers FOR SELECT USING (true);
CREATE POLICY "offers: admin insert" ON public.offers FOR INSERT WITH CHECK ((SELECT email FROM public.profiles WHERE id = auth.uid()) = 'alo1234salama@gmail.com');
CREATE POLICY "offers: admin update" ON public.offers FOR UPDATE  USING ((SELECT email FROM public.profiles WHERE id = auth.uid()) = 'alo1234salama@gmail.com');
CREATE POLICY "offers: admin delete" ON public.offers FOR DELETE  USING ((SELECT email FROM public.profiles WHERE id = auth.uid()) = 'alo1234salama@gmail.com');


-- ======================================================
-- STEP 7: STORAGE BUCKET (fixes image upload errors)
-- ======================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('maqam-assets', 'maqam-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "storage: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'maqam-assets');

CREATE POLICY "storage: admin upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'maqam-assets'
    AND (SELECT email FROM public.profiles WHERE id = auth.uid()) = 'alo1234salama@gmail.com'
  );

CREATE POLICY "storage: admin update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'maqam-assets'
    AND (SELECT email FROM public.profiles WHERE id = auth.uid()) = 'alo1234salama@gmail.com'
  );

CREATE POLICY "storage: admin delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'maqam-assets'
    AND (SELECT email FROM public.profiles WHERE id = auth.uid()) = 'alo1234salama@gmail.com'
  );


-- ============================================================================
-- DONE! Tables, functions, RLS, and storage are all set up.
-- ============================================================================
