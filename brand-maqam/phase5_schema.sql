-- PHASE 5 MAQAM CMS SCHEMA UPDATE
-- Execute this entire file in your Supabase SQL Editor

-- 1. SITE VISITS TABLE (Tracks daily unique sessions)
create table if not exists public.site_visits (
  visit_date date primary key default current_date,
  visitors_count integer default 1
);

alter table public.site_visits enable row level security;
create policy "Anyone can read site_visits" on public.site_visits for select using (true);
create policy "Anyone can insert site_visits" on public.site_visits for insert with check (true);
create policy "Anyone can update site_visits" on public.site_visits for update using (true);

-- Utility function to safely increment visits
create or replace function public.increment_daily_visit()
returns void as $$
begin
  insert into public.site_visits (visit_date, visitors_count)
  values (current_date, 1)
  on conflict (visit_date)
  do update set visitors_count = site_visits.visitors_count + 1;
end;
$$ language plpgsql security definer;

-- 2. FAVORITES TABLE (Wishlist)
create table if not exists public.favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Ensure a user can only favorite a product once
  constraint unique_user_product unique (user_id, product_id)
);

alter table public.favorites enable row level security;
create policy "Users can read own favorites" on public.favorites for select using (auth.uid() = user_id);
create policy "Users can insert own favorites" on public.favorites for insert with check (auth.uid() = user_id);
create policy "Users can delete own favorites" on public.favorites for delete using (auth.uid() = user_id);
