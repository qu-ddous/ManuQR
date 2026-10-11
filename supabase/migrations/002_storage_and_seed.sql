-- MenuQR Storage Bucket Setup & Security Policies
-- Run this in your Supabase SQL editor

-- 1. Create storage bucket for shop assets (logos, product photos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'shop-assets',
  'shop-assets',
  true,
  5242880, -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Storage Policies

-- Public can view/download images from shop-assets
CREATE POLICY "Public Read shop-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'shop-assets');

-- Authenticated users can upload only into their own user folder: <user_id>/*
CREATE POLICY "Owner Upload shop-assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'shop-assets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can update/overwrite files in their own folder
CREATE POLICY "Owner Update shop-assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'shop-assets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete files in their own folder
CREATE POLICY "Owner Delete shop-assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'shop-assets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins have full access to shop-assets
CREATE POLICY "Admin Full shop-assets"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'shop-assets' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ========================================================
-- OPTIONAL DEVELOPMENT SEED DATA
-- (Run only if you want sample data for local preview)
-- Note: Replace with real user IDs if testing with auth.
-- ========================================================
/*
DO $$
DECLARE
  demo_user_id UUID := '00000000-0000-0000-0000-000000000001';
  demo_shop_id UUID;
  cat_burgers UUID;
  cat_drinks  UUID;
BEGIN
  -- Insert demo profile
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (demo_user_id, 'Demo Chef', 'shop_owner')
  ON CONFLICT (id) DO NOTHING;

  -- Insert demo shop
  INSERT INTO public.shops (owner_id, name, slug, description, whatsapp_number, address, opening_hours, currency_code, status, plan_name)
  VALUES (
    demo_user_id,
    'Karachi Bites Cafe',
    'karachi-bites',
    'Artisanal smash burgers, crispy sides, and refreshing shakes in Karachi.',
    '+923001234567',
    'Shop 4, Block 7, Clifton, Karachi',
    '12:00 PM – 1:00 AM Daily',
    'PKR',
    'active',
    'Professional'
  )
  ON CONFLICT (slug) DO UPDATE SET status = 'active'
  RETURNING id INTO demo_shop_id;

  -- Insert categories
  INSERT INTO public.categories (shop_id, name, sort_order, is_visible)
  VALUES (demo_shop_id, 'Smash Burgers', 0, true)
  RETURNING id INTO cat_burgers;

  INSERT INTO public.categories (shop_id, name, sort_order, is_visible)
  VALUES (demo_shop_id, 'Drinks & Shakes', 1, true)
  RETURNING id INTO cat_drinks;

  -- Insert products
  INSERT INTO public.products (shop_id, category_id, name, description, price, is_available, sort_order)
  VALUES
    (demo_shop_id, cat_burgers, 'Classic Single Smash', '100g beef patty, American cheese, pickles, secret sauce on a brioche bun', 650.00, true, 0),
    (demo_shop_id, cat_burgers, 'Double Trouble Smash', 'Two 100g beef patties, double cheese, caramelized onions, house truffle mayo', 950.00, true, 1),
    (demo_shop_id, cat_burgers, 'Crispy Zinger Crunch', 'Golden fried chicken breast, spicy coleslaw, jalapenos, peri-peri glaze', 720.00, true, 2),
    (demo_shop_id, cat_drinks, 'Mint Margarita', 'Fresh mint, lime juice, sparkling soda with crushed ice', 280.00, true, 0),
    (demo_shop_id, cat_drinks, 'Lotus Biscoff Shake', 'Rich vanilla gelato blended with Lotus spread and crushed biscuits', 450.00, true, 1);
END $$;
*/

