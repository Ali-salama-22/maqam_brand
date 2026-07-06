-- ================================================================
-- MAQAM DATABASE REPAIR SCRIPT
-- ✅ Fixes "Database error saving new user"
-- ✅ Rebuilds 'profiles' table and 'new user' trigger
-- Run in: https://supabase.com/dashboard/project/hubqkhkbppmzgkkbopmn/sql/new
-- ================================================================

-- 1. FIX PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  phone text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure RLS is on
alter table public.profiles enable row level security;

-- 2. REBUILD NEW USER TRIGGER
-- This is what Supabase uses to sync Google/Email signups to the profile table
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

-- Re-bind the trigger carefully
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. ENSURE ADMIN ACCESS (RLS)
-- Drop existing and re-create to ensure no conflicts
drop policy if exists "profiles: public read" on public.profiles;
drop policy if exists "profiles: user insert own" on public.profiles;
drop policy if exists "profiles: user update own" on public.profiles;

create policy "profiles: public read" on public.profiles for select using (true);
create policy "profiles: user insert own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles: user update own" on public.profiles for update using (auth.uid() = id);

-- ================================================================
-- ✅ DONE! Now try Google Login again.
-- ================================================================
