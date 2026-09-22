-- ==============================================================================
-- MONTUÁ PRESENTES — MIGRATION 001_INITIAL_SCHEMA.SQL (PRODUÇÃO COMERCIAL)
-- Idempotente: seguro para execução em bases virgens ou bases pré-existentes.
-- ==============================================================================

-- 1. Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. STORAGE BUCKETS (Supabase Storage)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('artworks', 'artworks', true, 15728640, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']),
  ('customer-uploads', 'customer-uploads', false, 15728640, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']),
  ('order-previews', 'order-previews', false, 10485760, ARRAY['image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas de Storage
DROP POLICY IF EXISTS "Public read artworks" ON storage.objects;
CREATE POLICY "Public read artworks" ON storage.objects
  FOR SELECT USING (bucket_id = 'artworks');

DROP POLICY IF EXISTS "Admin write artworks" ON storage.objects;
CREATE POLICY "Admin write artworks" ON storage.objects
  FOR ALL USING (bucket_id = 'artworks' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public insert customer uploads" ON storage.objects;

DROP POLICY IF EXISTS "Public read customer uploads" ON storage.objects;
DROP POLICY IF EXISTS "Admin list customer uploads" ON storage.objects;
CREATE POLICY "Admin list customer uploads" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'customer-uploads' AND 
    (auth.role() = 'authenticated' OR auth.role() = 'service_role')
  );

DROP POLICY IF EXISTS "Public insert order previews" ON storage.objects;

DROP POLICY IF EXISTS "Public read order previews" ON storage.objects;
CREATE POLICY "Admin read order previews" ON storage.objects
  FOR SELECT USING (bucket_id = 'order-previews' AND auth.role() = 'authenticated');


-- 3. TABELA DE PRODUTOS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    short_description TEXT,
    description TEXT,
    category VARCHAR(100) NOT NULL DEFAULT 'Geral',
    base_price NUMERIC(10, 2) NOT NULL DEFAULT 29.90,
    surface_additional_price NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
    packaging_price NUMERIC(10, 2) NOT NULL DEFAULT 9.90,
    available_colors JSONB NOT NULL DEFAULT '[]'::jsonb,
    default_color_id VARCHAR(50) NOT NULL DEFAULT 'white',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE SUPERFÍCIES DO PRODUTO (Frente, Verso, Alça, Inferior, etc.)
CREATE TABLE IF NOT EXISTS public.product_surfaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    surface_key VARCHAR(50) NOT NULL, -- 'front', 'back', 'handle', 'bottom'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    canvas_width INTEGER NOT NULL DEFAULT 320,
    canvas_height INTEGER NOT NULL DEFAULT 380,
    real_width_mm NUMERIC(6, 2) NOT NULL DEFAULT 80.0,
    real_height_mm NUMERIC(6, 2) NOT NULL DEFAULT 95.0,
    printable_area JSONB NOT NULL, -- { x, y, width, height, borderRadius, isCircle }
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_product_surface UNIQUE (product_id, surface_key)
);

-- 5. TABELA DE ARTES DO CATÁLOGO (Cliparts / Ilustrações)
CREATE TABLE IF NOT EXISTS public.artworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    file_path TEXT,
    public_url TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABELA DE PEDIDOS COM SNAPSHOT IMUTÁVEL
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Assegura compatibilidade mesmo em tabelas existentes com esquema legado
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(50);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_cep VARCHAR(20);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'novo';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS product_snapshot JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS base_price NUMERIC(10, 2) DEFAULT 29.90;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS additional_surfaces_price NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS packaging_price NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10, 2) DEFAULT 29.90;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2) DEFAULT 29.90;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS packaging_included BOOLEAN DEFAULT false;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_order_number_unique') THEN
        ALTER TABLE public.orders ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 7. TABELA DE HISTÓRICO DE STATUS DO PEDIDO
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABELA DE ITENS DO PEDIDO
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    color_selected JSONB NOT NULL, -- { id, name, hex, mockupHex }
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_item_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TABELA DE CUSTOMIZAÇÕES DO ITEM (Superfícies e Previews)
CREATE TABLE IF NOT EXISTS public.customizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
    surfaces_data JSONB NOT NULL, -- Mapa completo de elementos e previews
    preview_front_url TEXT,
    preview_back_url TEXT,
    preview_handle_url TEXT,
    preview_bottom_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. TABELA DE ELEMENTOS DE CUSTOMIZAÇÃO (Com Medidas Físicas em mm e DPI)
CREATE TABLE IF NOT EXISTS public.customization_elements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customization_id UUID NOT NULL REFERENCES public.customizations(id) ON DELETE CASCADE,
    surface_key VARCHAR(50) NOT NULL,
    element_type VARCHAR(50) NOT NULL, -- 'text', 'image', 'clipart'
    content TEXT NOT NULL,
    pos_x_px NUMERIC(8, 2) NOT NULL,
    pos_y_px NUMERIC(8, 2) NOT NULL,
    width_px NUMERIC(8, 2) NOT NULL,
    height_px NUMERIC(8, 2) NOT NULL,
    pos_x_mm NUMERIC(8, 2) NOT NULL,
    pos_y_mm NUMERIC(8, 2) NOT NULL,
    width_mm NUMERIC(8, 2) NOT NULL,
    height_mm NUMERIC(8, 2) NOT NULL,
    rotation_deg NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    estimated_dpi INTEGER,
    quality_rating VARCHAR(20),
    z_index INTEGER NOT NULL DEFAULT 0,
    visual_properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_product_surfaces_product_id ON public.product_surfaces(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_customizations_order_item_id ON public.customizations(order_item_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) RIGOROSA
-- ==============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_surfaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customization_elements ENABLE ROW LEVEL SECURITY;

-- 1. Leitura Pública para Catálogo (apenas itens ativos)
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read product surfaces" ON public.product_surfaces;
CREATE POLICY "Public read product surfaces" ON public.product_surfaces
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read artworks" ON public.artworks;
CREATE POLICY "Public read artworks" ON public.artworks
  FOR SELECT USING (is_active = true);

-- 2. Clientes Públicos (Inserção de pedidos autorizada)
DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
CREATE POLICY "Public insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert order_status_history" ON public.order_status_history;
CREATE POLICY "Public insert order_status_history" ON public.order_status_history
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert order_items" ON public.order_items;
CREATE POLICY "Public insert order_items" ON public.order_items
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert customizations" ON public.customizations;
CREATE POLICY "Public insert customizations" ON public.customizations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert customization_elements" ON public.customization_elements;
CREATE POLICY "Public insert customization_elements" ON public.customization_elements
  FOR INSERT WITH CHECK (true);

-- 3. Acesso Administrativo Total (via usuário autenticado ou service_role)
DROP POLICY IF EXISTS "Admin full access products" ON public.products;
CREATE POLICY "Admin full access products" ON public.products
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admin full access product surfaces" ON public.product_surfaces;
CREATE POLICY "Admin full access product surfaces" ON public.product_surfaces
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admin full access artworks" ON public.artworks;
CREATE POLICY "Admin full access artworks" ON public.artworks
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admin full access orders" ON public.orders;
CREATE POLICY "Admin full access orders" ON public.orders
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admin full access order_status_history" ON public.order_status_history;
CREATE POLICY "Admin full access order_status_history" ON public.order_status_history
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admin full access order_items" ON public.order_items;
CREATE POLICY "Admin full access order_items" ON public.order_items
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admin full access customizations" ON public.customizations;
CREATE POLICY "Admin full access customizations" ON public.customizations
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admin full access customization_elements" ON public.customization_elements;
CREATE POLICY "Admin full access customization_elements" ON public.customization_elements
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 4. Inserção Inicial de Catálogo: Caneca de Cerâmica 325ml (idempotente)
INSERT INTO public.products (
  id, slug, name, short_description, description, category, base_price, surface_additional_price, packaging_price, available_colors, default_color_id, is_active
) VALUES (
  'e2a86d9a-5b12-4c28-98e1-f67823e59001',
  'caneca-ceramica-325ml',
  'Caneca de Cerâmica 325ml',
  'Caneca branca brilhante classe AAA com personalização em altíssima definição DTF UV.',
  'Caneca de cerâmica de alta qualidade para presentes e uso diário. Personalize frente, verso e alça.',
  'Canecas',
  29.90,
  5.00,
  9.90,
  '[
    {"id": "white", "name": "Branca", "hex": "#FFFFFF", "mockupHex": "#F8FAFC", "textColor": "#1E293B"},
    {"id": "black", "name": "Preta", "hex": "#1E293B", "mockupHex": "#1E293B", "textColor": "#FFFFFF"},
    {"id": "pink", "name": "Rosa Claro", "hex": "#FBCFE8", "mockupHex": "#FDF2F8", "textColor": "#831843"},
    {"id": "blue", "name": "Azul Bebê", "hex": "#BAE6FD", "mockupHex": "#F0F9FF", "textColor": "#0C4A6E"}
  ]'::jsonb,
  'white',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  base_price = EXCLUDED.base_price,
  surface_additional_price = EXCLUDED.surface_additional_price,
  packaging_price = EXCLUDED.packaging_price,
  available_colors = EXCLUDED.available_colors;

-- Inserção das Superfícies da Caneca
INSERT INTO public.product_surfaces (
  product_id, surface_key, name, description, canvas_width, canvas_height, real_width_mm, real_height_mm, printable_area, display_order, is_active
) VALUES 
(
  'e2a86d9a-5b12-4c28-98e1-f67823e59001',
  'front',
  'Frente',
  'Área frontal principal da caneca',
  320, 380, 80.0, 95.0,
  '{"x": 60, "y": 80, "width": 200, "height": 220, "borderRadius": 8}'::jsonb,
  1, true
),
(
  'e2a86d9a-5b12-4c28-98e1-f67823e59001',
  'back',
  'Verso',
  'Área posterior da caneca',
  320, 380, 80.0, 95.0,
  '{"x": 60, "y": 80, "width": 200, "height": 220, "borderRadius": 8}'::jsonb,
  2, true
),
(
  'e2a86d9a-5b12-4c28-98e1-f67823e59001',
  'handle',
  'Alça',
  'Faixa vertical da alça para nomes ou detalhes',
  320, 380, 15.0, 75.0,
  '{"x": 120, "y": 70, "width": 80, "height": 240, "borderRadius": 12}'::jsonb,
  3, true
)
ON CONFLICT (product_id, surface_key) DO UPDATE SET
  name = EXCLUDED.name,
  real_width_mm = EXCLUDED.real_width_mm,
  real_height_mm = EXCLUDED.real_height_mm,
  printable_area = EXCLUDED.printable_area;
