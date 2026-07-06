-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. CATEGORIES TABLE
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  icon_name text default 'CircleDashed', -- To map to Lucide icons
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PRODUCTS TABLE
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  price numeric not null, -- Stored as numeric, UI handles 'EGP'
  old_price numeric,
  discount_percent integer,
  sizes text[] not null default '{}', -- e.g., '{"S","M","L","XL"}'
  colors jsonb not null default '[]'::jsonb, -- e.g., '[{"name": "Ivory", "hex": "#fdfaf5"}, {"name": "Pine", "hex": "#073b3a"}]'
  image_url text, -- We'll use text URLs for now per user request
  is_new_collection boolean default false,
  is_offer boolean default false,
  category_id uuid references public.categories(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ORDERS TABLE (Using WhatsApp manual flow, but logging here first)
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_email text not null,
  total numeric not null,
  status text not null default 'Pending WhatsApp Confirmation',
  invoice_details text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. LOYALTY POINTS TABLE
create table if not exists public.loyalty_points (
  id uuid default uuid_generate_v4() primary key,
  user_email text not null unique,
  total_orders integer default 0,
  vip_eligible boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.loyalty_points enable row level security;

-- Categories: Anyone can read, only authenticated (admin via UI) can insert/update
create policy "Allow public read access to categories" on public.categories for select using (true);
create policy "Allow all access to authenticated users for categories" on public.categories for all using (auth.role() = 'authenticated');

-- Products: Anyone can read, only authenticated can insert/update
create policy "Allow public read access to products" on public.products for select using (true);
create policy "Allow all access to authenticated users for products" on public.products for all using (auth.role() = 'authenticated');

-- Orders: Anyone can insert (since checkout is public for now before WhatsApp), but only read their own (or admin read all).
-- Note: Since we don't have strict user auth built yet, we'll allow public inserts, and public reads based on email if needed.
create policy "Allow public insert to orders" on public.orders for insert with check (true);
create policy "Allow public read to orders" on public.orders for select using (true);
create policy "Allow all access to authenticated users for orders" on public.orders for all using (auth.role() = 'authenticated');

-- Loyalty Points: Public can read (to show progress tracker), Admin manages.
create policy "Allow public read access to loyalty_points" on public.loyalty_points for select using (true);
create policy "Allow all access to authenticated users for loyalty_points" on public.loyalty_points for all using (auth.role() = 'authenticated');
