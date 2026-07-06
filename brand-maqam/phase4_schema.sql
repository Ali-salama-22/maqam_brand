-- PHASE 4 MAQAM CMS SCHEMA UPDATE
-- Execute this entire file in your Supabase SQL Editor

-- 1. PROFILES TABLE (Linked to auth.users for Social Logins)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  phone text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- 2. STORE SETTINGS TABLE (For Banner Control)
create table if not exists public.store_settings (
  id integer primary key default 1,
  banner_text text not null default 'لكل مقام مقال.. ولكل مقال مقام',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Ensuring only one row exists:
  constraint store_settings_single_row check (id = 1)
);
alter table public.store_settings enable row level security;
create policy "Anyone can read store_settings" on store_settings for select using (true);
create policy "All can modify settings for now" on store_settings for all using (true);

-- Insert the default record immediately
insert into public.store_settings (id, banner_text) values (1, 'لكل مقام مقال.. ولكل مقال مقام') on conflict (id) do nothing;

-- 3. EXPANDING EXISTING TABLES (Orders & Categories)
-- Add missing columns to 'orders' table
alter table public.orders 
  add column if not exists customer_name text,
  add column if not exists phone text,
  add column if not exists address text,
  add column if not exists items jsonb not null default '[]'::jsonb;

-- Default Arabic statused for newly created orders moving forward will be applied on the React Client.
-- Drop old default to prevent mixed EN/AR statuses natively
alter table public.orders alter column status drop default;

-- Add image_url to 'categories' table
alter table public.categories 
  add column if not exists image_url text;

-- 4. STORAGE BUCKET CREATION (Using Supabase helper functions)
-- Run this to create the 'maqam-assets' public bucket if it doesn't exist
insert into storage.buckets (id, name, public) 
values ('maqam-assets', 'maqam-assets', true)
on conflict (id) do nothing;

-- Create Storage Policies (Allow public read, allow insert)
create policy "Public Access to maqam-assets" on storage.objects for select using (bucket_id = 'maqam-assets');
create policy "Allow inserts to maqam-assets" on storage.objects for insert with check (bucket_id = 'maqam-assets');
create policy "Allow updates to maqam-assets" on storage.objects for update using (bucket_id = 'maqam-assets');
create policy "Allow deletes to maqam-assets" on storage.objects for delete using (bucket_id = 'maqam-assets');

-- 5. TRIGGER FOR NEW USERS (Auto-sync auth.users to public.profiles)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'عميل مقام')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Bind trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

