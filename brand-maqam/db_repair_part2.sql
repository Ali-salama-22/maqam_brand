-- ================================================================
-- 🛠️ BRAND MAQAM - DATABASE REPAIR SCRIPT (PART 2)
-- ✅ Fixes missing columns in categories and profiles tables.
-- Run in your Supabase SQL Editor: https://supabase.com
-- ================================================================

-- 1. FIX CATEGORIES TABLE
-- Add display_type column (circular/showcase option) to categories
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS display_type text;


-- 2. FIX PROFILES TABLE
-- Add updated_at column to profiles table to fix profile saving
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;

-- ================================================================
-- ✅ DONE! Run this script, then refresh the website to load categories and update profiles.
-- ================================================================
