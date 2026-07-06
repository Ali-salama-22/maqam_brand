-- ================================================================
-- MAQAM – FINAL CLEAN RLS SCRIPT
-- ✅ آمن للتشغيل أكثر من مرة — يمسح كل الأسماء القديمة والجديدة
-- شغّله في: https://supabase.com/dashboard/project/hubqkhkbppmzgkkbopmn/sql/new
-- ================================================================

-- ----------------------------------------------------------------
-- STEP 1: DROP EVERY POSSIBLE POLICY NAME (old + new)
-- ----------------------------------------------------------------

-- CATEGORIES
drop policy if exists "Allow public read access to categories" on public.categories;
drop policy if exists "Allow all access to authenticated users for categories" on public.categories;
drop policy if exists "Admin only: insert categories" on public.categories;
drop policy if exists "Admin only: update categories" on public.categories;
drop policy if exists "Admin only: delete categories" on public.categories;
drop policy if exists "categories: public read" on public.categories;
drop policy if exists "categories: admin insert" on public.categories;
drop policy if exists "categories: admin update" on public.categories;
drop policy if exists "categories: admin delete" on public.categories;

-- PRODUCTS
drop policy if exists "Allow public read access to products" on public.products;
drop policy if exists "Allow all access to authenticated users for products" on public.products;
drop policy if exists "Admin only: insert products" on public.products;
drop policy if exists "Admin only: update products" on public.products;
drop policy if exists "Admin only: delete products" on public.products;
drop policy if exists "products: public read" on public.products;
drop policy if exists "products: admin insert" on public.products;
drop policy if exists "products: admin update" on public.products;
drop policy if exists "products: admin delete" on public.products;

-- ORDERS
drop policy if exists "Allow public insert to orders" on public.orders;
drop policy if exists "Allow public read to orders" on public.orders;
drop policy if exists "Allow all access to authenticated users for orders" on public.orders;
drop policy if exists "Users read own orders or admin reads all" on public.orders;
drop policy if exists "Admin only: update orders" on public.orders;
drop policy if exists "Admin only: delete orders" on public.orders;
drop policy if exists "orders: public insert" on public.orders;
drop policy if exists "orders: select own or admin" on public.orders;
drop policy if exists "orders: admin update" on public.orders;
drop policy if exists "orders: admin delete" on public.orders;

-- STORE SETTINGS
drop policy if exists "Anyone can read store_settings" on public.store_settings;
drop policy if exists "All can modify settings for now" on public.store_settings;
drop policy if exists "Admin only: update store_settings" on public.store_settings;
drop policy if exists "Admin only: insert store_settings" on public.store_settings;
drop policy if exists "Admin only: delete store_settings" on public.store_settings;
drop policy if exists "store_settings: public read" on public.store_settings;
drop policy if exists "store_settings: admin insert" on public.store_settings;
drop policy if exists "store_settings: admin update" on public.store_settings;
drop policy if exists "store_settings: admin delete" on public.store_settings;

-- LOYALTY POINTS
drop policy if exists "Allow public read access to loyalty_points" on public.loyalty_points;
drop policy if exists "Allow all access to authenticated users for loyalty_points" on public.loyalty_points;
drop policy if exists "Admin only: insert loyalty_points" on public.loyalty_points;
drop policy if exists "Admin only: update loyalty_points" on public.loyalty_points;
drop policy if exists "Admin only: delete loyalty_points" on public.loyalty_points;
drop policy if exists "loyalty_points: public read" on public.loyalty_points;
drop policy if exists "loyalty_points: admin insert" on public.loyalty_points;
drop policy if exists "loyalty_points: admin update" on public.loyalty_points;
drop policy if exists "loyalty_points: admin delete" on public.loyalty_points;

-- PROFILES
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Users can update own profile." on public.profiles;
drop policy if exists "profiles: public read" on public.profiles;
drop policy if exists "profiles: user insert own" on public.profiles;
drop policy if exists "profiles: user update own" on public.profiles;

-- STORAGE
drop policy if exists "Public Access to maqam-assets" on storage.objects;
drop policy if exists "Allow inserts to maqam-assets" on storage.objects;
drop policy if exists "Allow updates to maqam-assets" on storage.objects;
drop policy if exists "Allow deletes to maqam-assets" on storage.objects;
drop policy if exists "Admin only: upload to maqam-assets" on storage.objects;
drop policy if exists "Admin only: update maqam-assets" on storage.objects;
drop policy if exists "Admin only: delete from maqam-assets" on storage.objects;
drop policy if exists "storage: public read" on storage.objects;
drop policy if exists "storage: admin upload" on storage.objects;
drop policy if exists "storage: admin update" on storage.objects;
drop policy if exists "storage: admin delete" on storage.objects;

-- ----------------------------------------------------------------
-- STEP 2: ENABLE RLS ON ALL TABLES
-- ----------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.store_settings enable row level security;
alter table public.loyalty_points enable row level security;
alter table public.profiles enable row level security;

-- ----------------------------------------------------------------
-- STEP 3: CREATE CLEAN FINAL POLICIES
-- ----------------------------------------------------------------

-- ── CATEGORIES ──────────────────────────────────────────────────
create policy "categories: public read"
  on public.categories for select using (true);

create policy "categories: admin insert"
  on public.categories for insert
  with check (auth.jwt() ->> 'email' = 'alo1234salama@gmail.com');

create policy "categories: admin update"
  on public.categories for update
  using (auth.jwt() ->> 'email' = 'alo1234salama@gmail.com');

create policy "categories: admin delete"
  on public.categories for delete
  using (auth.jwt() ->> 'email' = 'alo1234salama@gmail.com');

-- ── PRODUCTS ────────────────────────────────────────────────────
create policy "products: public read"
  on public.products for select using (true);

create policy "products: admin insert"
  on public.products for insert
  with check (auth.jwt() ->> 'email' = 'alo1234salama@gmail.com');

create policy "products: admin update"
  on public.products for update
  using (auth.jwt() ->> 'email' = 'alo1234salama@gmail.com');

create policy "products: admin delete"
  on public.products for delete
  using (auth.jwt() ->> 'email' = 'alo1234salama@gmail.com');

-- ── ORDERS ──────────────────────────────────────────────────────
create policy "orders: public insert"
  on public.orders for insert
  with check (true);

create policy "orders: select own or admin"
  on public.orders for select
  using (
    auth.jwt() ->> 'email' = 'alo1234salama@gmail.com'
    or auth.uid() = user_id
    or user_id is null
  );

create policy "orders: admin update"
  on public.orders for update
  using (auth.jwt() ->> 'email' = 'alo1234salama@gmail.com');

create policy "orders: admin delete"
  on public.orders for delete
  using (auth.jwt() ->> 'email' = 'alo1234salama@gmail.com');

-- ── STORE SETTINGS ──────────────────────────────────────────────
create policy "store_settings: public read"
  on public.store_settings for select using (true);

create policy "store_settings: admin insert"
  on public.store_settings for insert
  with check (auth.jwt() ->> 'email' = 'alo1234salama@gmail.com');

create policy "store_settings: admin update"
  on public.store_settings for update
  using (auth.jwt() ->> 'email' = 'alo1234salama@gmail.com');

create policy "store_settings: admin delete"
  on public.store_settings for delete
  using (auth.jwt() ->> 'email' = 'alo1234salama@gmail.com');

-- ── LOYALTY POINTS ──────────────────────────────────────────────
create policy "loyalty_points: public read"
  on public.loyalty_points for select using (true);

create policy "loyalty_points: admin insert"
  on public.loyalty_points for insert
  with check (auth.jwt() ->> 'email' = 'alo1234salama@gmail.com');

create policy "loyalty_points: admin update"
  on public.loyalty_points for update
  using (auth.jwt() ->> 'email' = 'alo1234salama@gmail.com');

create policy "loyalty_points: admin delete"
  on public.loyalty_points for delete
  using (auth.jwt() ->> 'email' = 'alo1234salama@gmail.com');

-- ── PROFILES ────────────────────────────────────────────────────
create policy "profiles: public read"
  on public.profiles for select using (true);

create policy "profiles: user insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles: user update own"
  on public.profiles for update
  using (auth.uid() = id);

-- ── STORAGE: maqam-assets ───────────────────────────────────────
create policy "storage: public read"
  on storage.objects for select
  using (bucket_id = 'maqam-assets');

create policy "storage: admin upload"
  on storage.objects for insert
  with check (
    bucket_id = 'maqam-assets'
    and auth.jwt() ->> 'email' = 'alo1234salama@gmail.com'
  );

create policy "storage: admin update"
  on storage.objects for update
  using (
    bucket_id = 'maqam-assets'
    and auth.jwt() ->> 'email' = 'alo1234salama@gmail.com'
  );

create policy "storage: admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'maqam-assets'
    and auth.jwt() ->> 'email' = 'alo1234salama@gmail.com'
  );

-- ================================================================
-- ✅ تم! alo1234salama@gmail.com لديه الآن صلاحيات أدمن كاملة.
-- ================================================================