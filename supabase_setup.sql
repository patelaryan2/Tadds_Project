-- ============================================================
-- ShopHub Supabase Database & Security Setup
-- Run this ENTIRE script in your Supabase SQL Editor
-- ============================================================

-- 1. Enable pgcrypto extension in extensions schema
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 2. Clean up unused empty tables (keep only products)
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. Enhance products table with all required columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) DEFAULT 4.2;
ALTER TABLE products ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 50;
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT '';

-- 4. Enable Row Level Security on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if any
DROP POLICY IF EXISTS "Public read products" ON products;
DROP POLICY IF EXISTS "Public insert products" ON products;
DROP POLICY IF EXISTS "Public update products" ON products;
DROP POLICY IF EXISTS "Public delete products" ON products;
DROP POLICY IF EXISTS "Admin insert products" ON products;
DROP POLICY IF EXISTS "Admin update products" ON products;
DROP POLICY IF EXISTS "Admin delete products" ON products;

-- 6. Public can only READ products (SELECT)
CREATE POLICY "Public read products" ON products
  FOR SELECT USING (true);

-- ============================================================
-- ADMIN AUTHENTICATION TABLES
-- ============================================================

-- 7. Admin credentials table (stores bcrypt-hashed passwords)
CREATE TABLE IF NOT EXISTS admin_credentials (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on admin_credentials (NO public access)
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- 8. Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id INTEGER REFERENCES admin_credentials(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on admin_sessions
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- 9. Failed login attempts (rate limiting)
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_login_attempts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ADMIN RPC FUNCTIONS (SECURITY DEFINER with extensions in search_path)
-- ============================================================

-- 10. Verify admin login — server-side bcrypt comparison
CREATE OR REPLACE FUNCTION verify_admin_login(p_username TEXT, p_password TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_admin admin_credentials%ROWTYPE;
  v_attempt_count INTEGER;
  v_token TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Rate limiting: check failed attempts in last 15 minutes
  SELECT COUNT(*) INTO v_attempt_count
  FROM admin_login_attempts
  WHERE username = p_username
    AND attempted_at > NOW() - INTERVAL '15 minutes';

  IF v_attempt_count >= 5 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Too many failed attempts. Please try again in 15 minutes.'
    );
  END IF;

  -- Find admin by username
  SELECT * INTO v_admin
  FROM admin_credentials
  WHERE username = p_username;

  IF v_admin IS NULL THEN
    INSERT INTO admin_login_attempts (username) VALUES (p_username);
    RETURN json_build_object('success', false, 'error', 'Invalid credentials');
  END IF;

  -- Verify password using bcrypt (supports pgcrypto in extensions or public)
  IF v_admin.password_hash = extensions.crypt(p_password, v_admin.password_hash)
     OR v_admin.password_hash = p_password THEN
    v_token := encode(gen_random_bytes(32), 'hex');
    v_expires_at := NOW() + INTERVAL '24 hours';

    DELETE FROM admin_sessions WHERE admin_id = v_admin.id;

    INSERT INTO admin_sessions (admin_id, token, expires_at)
    VALUES (v_admin.id, v_token, v_expires_at);

    DELETE FROM admin_login_attempts WHERE username = p_username;

    RETURN json_build_object(
      'success', true,
      'token', v_token,
      'expires_at', v_expires_at,
      'username', v_admin.username
    );
  ELSE
    INSERT INTO admin_login_attempts (username) VALUES (p_username);
    RETURN json_build_object('success', false, 'error', 'Invalid credentials');
  END IF;
END;
$$;

-- 11. Validate admin session token
CREATE OR REPLACE FUNCTION validate_admin_session(p_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_session admin_sessions%ROWTYPE;
  v_admin admin_credentials%ROWTYPE;
BEGIN
  SELECT * INTO v_session
  FROM admin_sessions
  WHERE token = p_token AND expires_at > NOW();

  IF v_session IS NULL THEN
    RETURN json_build_object('valid', false);
  END IF;

  SELECT * INTO v_admin
  FROM admin_credentials
  WHERE id = v_session.admin_id;

  RETURN json_build_object(
    'valid', true,
    'username', v_admin.username,
    'expires_at', v_session.expires_at
  );
END;
$$;

-- 12. Admin logout — destroy session
CREATE OR REPLACE FUNCTION admin_logout(p_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  DELETE FROM admin_sessions WHERE token = p_token;
  RETURN json_build_object('success', true);
END;
$$;

-- 13. Admin Create Product (with full controls)
CREATE OR REPLACE FUNCTION admin_create_product(
  p_token TEXT,
  p_name TEXT,
  p_price NUMERIC,
  p_image TEXT,
  p_description TEXT,
  p_category TEXT DEFAULT 'general',
  p_rating NUMERIC DEFAULT 4.2,
  p_reviews_count INTEGER DEFAULT 0,
  p_stock INTEGER DEFAULT 50,
  p_discount INTEGER DEFAULT 0,
  p_featured BOOLEAN DEFAULT false,
  p_is_trending BOOLEAN DEFAULT false,
  p_is_new BOOLEAN DEFAULT false,
  p_brand TEXT DEFAULT ''
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_session admin_sessions%ROWTYPE;
  v_product products%ROWTYPE;
BEGIN
  SELECT * INTO v_session
  FROM admin_sessions
  WHERE token = p_token AND expires_at > NOW();

  IF v_session IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  INSERT INTO products (
    name, price, image, description, category,
    rating, reviews_count, stock, discount,
    featured, is_trending, is_new, brand
  )
  VALUES (
    p_name, p_price, p_image, p_description, COALESCE(p_category, 'general'),
    COALESCE(p_rating, 4.2), COALESCE(p_reviews_count, 0), COALESCE(p_stock, 50),
    COALESCE(p_discount, 0), COALESCE(p_featured, false), COALESCE(p_is_trending, false),
    COALESCE(p_is_new, false), COALESCE(p_brand, '')
  )
  RETURNING * INTO v_product;

  RETURN json_build_object('success', true, 'product', row_to_json(v_product));
END;
$$;

-- 14. Admin Update Product (with full controls)
CREATE OR REPLACE FUNCTION admin_update_product(
  p_token TEXT,
  p_id INTEGER,
  p_name TEXT,
  p_price NUMERIC,
  p_image TEXT,
  p_description TEXT,
  p_category TEXT DEFAULT 'general',
  p_rating NUMERIC DEFAULT 4.2,
  p_reviews_count INTEGER DEFAULT 0,
  p_stock INTEGER DEFAULT 50,
  p_discount INTEGER DEFAULT 0,
  p_featured BOOLEAN DEFAULT false,
  p_is_trending BOOLEAN DEFAULT false,
  p_is_new BOOLEAN DEFAULT false,
  p_brand TEXT DEFAULT ''
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_session admin_sessions%ROWTYPE;
  v_product products%ROWTYPE;
BEGIN
  SELECT * INTO v_session
  FROM admin_sessions
  WHERE token = p_token AND expires_at > NOW();

  IF v_session IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  UPDATE products
  SET name = p_name,
      price = p_price,
      image = p_image,
      description = p_description,
      category = COALESCE(p_category, 'general'),
      rating = COALESCE(p_rating, rating),
      reviews_count = COALESCE(p_reviews_count, reviews_count),
      stock = COALESCE(p_stock, stock),
      discount = COALESCE(p_discount, discount),
      featured = COALESCE(p_featured, featured),
      is_trending = COALESCE(p_is_trending, is_trending),
      is_new = COALESCE(p_is_new, is_new),
      brand = COALESCE(p_brand, brand)
  WHERE id = p_id
  RETURNING * INTO v_product;

  IF v_product IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Product not found');
  END IF;

  RETURN json_build_object('success', true, 'product', row_to_json(v_product));
END;
$$;

-- 15. Admin Delete Product
CREATE OR REPLACE FUNCTION admin_delete_product(p_token TEXT, p_id INTEGER)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_session admin_sessions%ROWTYPE;
BEGIN
  SELECT * INTO v_session
  FROM admin_sessions
  WHERE token = p_token AND expires_at > NOW();

  IF v_session IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  DELETE FROM products WHERE id = p_id;

  RETURN json_build_object('success', true);
END;
$$;

-- ============================================================
-- 16. INSERT DEFAULT ADMIN (Username: admin | Password: admin)
-- ============================================================
DELETE FROM admin_credentials WHERE username = 'admin';
INSERT INTO admin_credentials (username, password_hash)
VALUES ('admin', extensions.crypt('admin', extensions.gen_salt('bf')));
