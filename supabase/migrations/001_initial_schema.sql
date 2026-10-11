-- MenuQR Initial Schema Migration
-- Run this in your Supabase SQL editor or via the Supabase CLI

-- ================================================
-- PROFILES
-- ================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT 'shop_owner' CHECK (role IN ('shop_owner', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: auto-create profile on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'shop_owner'  -- Always shop_owner on signup. Admins are set manually.
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- SHOPS
-- ================================================
CREATE TABLE IF NOT EXISTS public.shops (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name             TEXT NOT NULL CHECK (length(name) >= 2 AND length(name) <= 80),
  slug             TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' AND length(slug) BETWEEN 3 AND 50),
  description      TEXT,
  logo_url         TEXT,
  whatsapp_number  TEXT,
  address          TEXT,
  opening_hours    TEXT,
  currency_code    TEXT NOT NULL DEFAULT 'PKR' CHECK (length(currency_code) = 3),
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused')),
  plan_name        TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS shops_owner_id_idx ON public.shops(owner_id);
CREATE INDEX IF NOT EXISTS shops_slug_idx ON public.shops(slug);
CREATE INDEX IF NOT EXISTS shops_status_idx ON public.shops(status);

-- ================================================
-- CATEGORIES
-- ================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id     UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name        TEXT NOT NULL CHECK (length(name) >= 1 AND length(name) <= 80),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_visible  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS categories_shop_id_idx ON public.categories(shop_id);

-- ================================================
-- PRODUCTS
-- ================================================
CREATE TABLE IF NOT EXISTS public.products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id       UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  category_id   UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name          TEXT NOT NULL CHECK (length(name) >= 1 AND length(name) <= 100),
  description   TEXT,
  price         NUMERIC(12, 2) NOT NULL CHECK (price > 0),
  image_url     TEXT,
  is_available  BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS products_shop_id_idx ON public.products(shop_id);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON public.products(category_id);

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

ALTER TABLE public.profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products   ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES ----

-- Users can view their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (but NOT the role column)
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));
  -- ^^ prevents self-escalation to admin

-- Admins can read all profiles
CREATE POLICY "profiles_admin_select"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---- SHOPS ----

-- Public visitors can read active shops
CREATE POLICY "shops_public_select_active"
  ON public.shops FOR SELECT
  USING (status = 'active');

-- Shop owners can view their own shops (any status)
CREATE POLICY "shops_owner_select"
  ON public.shops FOR SELECT
  USING (owner_id = auth.uid());

-- Shop owners can insert their own shop
CREATE POLICY "shops_owner_insert"
  ON public.shops FOR INSERT
  WITH CHECK (owner_id = auth.uid() AND status = 'pending');
  -- owners can only create shops in pending state

-- Shop owners can update their own shops (but NOT the status or owner_id)
CREATE POLICY "shops_owner_update"
  ON public.shops FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (
    owner_id = auth.uid() AND
    status = (SELECT status FROM public.shops WHERE id = shops.id)
    -- ^^ owner cannot change their own shop status
  );

-- Admins can do everything on shops
CREATE POLICY "shops_admin_all"
  ON public.shops FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---- CATEGORIES ----

-- Public can read visible categories of active shops
CREATE POLICY "categories_public_select"
  ON public.categories FOR SELECT
  USING (
    is_visible = TRUE AND
    EXISTS (SELECT 1 FROM public.shops WHERE id = categories.shop_id AND status = 'active')
  );

-- Owners can read all categories of their own shop
CREATE POLICY "categories_owner_select"
  ON public.categories FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.shops WHERE id = categories.shop_id AND owner_id = auth.uid())
  );

-- Owners can insert categories to their own shop
CREATE POLICY "categories_owner_insert"
  ON public.categories FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.shops WHERE id = shop_id AND owner_id = auth.uid())
  );

-- Owners can update categories of their own shop
CREATE POLICY "categories_owner_update"
  ON public.categories FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.shops WHERE id = categories.shop_id AND owner_id = auth.uid())
  );

-- Owners can delete categories of their own shop
CREATE POLICY "categories_owner_delete"
  ON public.categories FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.shops WHERE id = categories.shop_id AND owner_id = auth.uid())
  );

-- Admins can do everything
CREATE POLICY "categories_admin_all"
  ON public.categories FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---- PRODUCTS ----

-- Public can read available products of active shops
CREATE POLICY "products_public_select"
  ON public.products FOR SELECT
  USING (
    is_available = TRUE AND
    EXISTS (SELECT 1 FROM public.shops WHERE id = products.shop_id AND status = 'active')
  );

-- Owners can read all products of their own shop
CREATE POLICY "products_owner_select"
  ON public.products FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.shops WHERE id = products.shop_id AND owner_id = auth.uid())
  );

-- Owners can insert products to their own shop
CREATE POLICY "products_owner_insert"
  ON public.products FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.shops WHERE id = shop_id AND owner_id = auth.uid())
  );

-- Owners can update their own products
CREATE POLICY "products_owner_update"
  ON public.products FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.shops WHERE id = products.shop_id AND owner_id = auth.uid())
  );

-- Owners can delete their own products
CREATE POLICY "products_owner_delete"
  ON public.products FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.shops WHERE id = products.shop_id AND owner_id = auth.uid())
  );

-- Admins can do everything
CREATE POLICY "products_admin_all"
  ON public.products FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

