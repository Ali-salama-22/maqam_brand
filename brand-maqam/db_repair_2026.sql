-- ================================================================
-- 🛠️ BRAND MAQAM - DATABASE REPAIR SCRIPT 2026
-- ✅ Fixes missing columns and tables to restore checkout and offers.
-- Run in your Supabase SQL Editor: https://supabase.com
-- ================================================================

-- 1. ADD MISSING COLUMNS
-- Add alt_phone to orders table (crucial for checkout RPC)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS alt_phone text;

-- Add wholesale_price to products table (needed for admin & warehouse)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS wholesale_price numeric;


-- 2. CREATE MISSING OFFERS TABLE
CREATE TABLE IF NOT EXISTS public.offers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  discount_code text,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 3. ENABLE ROW LEVEL SECURITY (RLS) ON OFFERS
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;


-- 4. DROP OLD POLICIES FOR OFFERS (prevent conflicts)
DROP POLICY IF EXISTS "offers: public read" ON public.offers;
DROP POLICY IF EXISTS "offers: admin insert" ON public.offers;
DROP POLICY IF EXISTS "offers: admin update" ON public.offers;
DROP POLICY IF EXISTS "offers: admin delete" ON public.offers;


-- 5. CREATE CLEAN RLS POLICIES FOR OFFERS
-- Public can read offers
CREATE POLICY "offers: public read"
  ON public.offers FOR SELECT USING (true);

-- Admin can insert offers
CREATE POLICY "offers: admin insert"
  ON public.offers FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = 'alo1234salama@gmail.com');

-- Admin can update offers
CREATE POLICY "offers: admin update"
  ON public.offers FOR UPDATE
  USING (auth.jwt() ->> 'email' = 'alo1234salama@gmail.com');

-- Admin can delete offers
CREATE POLICY "offers: admin delete"
  ON public.offers FOR DELETE
  USING (auth.jwt() ->> 'email' = 'alo1234salama@gmail.com');

-- ================================================================
-- ✅ DONE! Run this script, then try placing an order and viewing offers.
-- ================================================================
