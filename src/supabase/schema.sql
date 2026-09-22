-- ==============================================================================
-- MONTUÁ PRESENTES — SCHEMA POSTGRESQL / SUPABASE (PRODUÇÃO COMERCIAL)
-- ==============================================================================

-- 1. Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. STORAGE BUCKETS (Supabase Storage)
-- Inserção dos 3 buckets essenciais para produção
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('artworks', 'artworks', true, 15728640, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']),
  ('customer-uploads', 'customer-uploads', true, 15728640, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']),
  ('order-previews', 'order-previews', true, 10485760, ARRAY['image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas de Storage
CREATE POLICY "Public read artworks" ON storage.objects
  FOR SELECT USING (bucket_id = 'artworks');

CREATE POLICY "Admin write artworks" ON storage.objects
  FOR ALL USING (bucket_id = 'artworks' AND auth.role() = 'authenticated');

CREATE POLICY "Public insert customer uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'customer-uploads');

CREATE POLICY "Public read customer uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'customer-uploads');

CREATE POLICY "Public insert order previews" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'order-previews');

CREATE POLICY "Public read order previews" ON storage.objects
  FOR SELECT USING (bucket_id = 'order-previews');


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

-- 5. TABELA DE ARTES DO CATÁLOGO (Cliparts / Ilustrações Administrativas)
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
    order_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. PED-A82F31
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    customer_cep VARCHAR(20),
    customer_address TEXT,
    customer_notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'novo',
    -- Fluxo oficial: 'novo', 'aguardando_pagamento', 'pago', 'arte_aprovada', 'em_producao', 'pronto', 'entregue', 'cancelado'
    
    -- SNAPSHOT DO MOMENTO DA COMPRA (Garante imutabilidade comercial)
    product_snapshot JSONB NOT NULL,
    
    -- VALORES RECALCULADOS NO SERVIDOR (Não confia no frontend)
    base_price NUMERIC(10, 2) NOT NULL,
    additional_surfaces_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    packaging_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_amount NUMERIC(10, 2) NOT NULL,
    packaging_included BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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
    -- Métricas Físicas em Milímetros para Produção DTF UV
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
CREATE POLICY "Public read products" ON public.products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read product surfaces" ON public.product_surfaces
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read artworks" ON public.artworks
  FOR SELECT USING (is_active = true);

-- 2. Clientes Públicos (Inserção de pedidos)
CREATE POLICY "Public insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public insert order_status_history" ON public.order_status_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public insert order_items" ON public.order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public insert customizations" ON public.customizations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public insert customization_elements" ON public.customization_elements
  FOR INSERT WITH CHECK (true);

-- 3. Bloqueio de Leitura Pública de Pedidos de Outros Clientes
-- Clientes NÃO podem selecionar a lista de pedidos. Apenas administradores autenticados ou consultas por número + telefone podem visualizar
CREATE POLICY "Admin full access products" ON public.products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access product surfaces" ON public.product_surfaces
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access artworks" ON public.artworks
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access orders" ON public.orders
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access order_status_history" ON public.order_status_history
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access order_items" ON public.order_items
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access customizations" ON public.customizations
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access customization_elements" ON public.customization_elements
  FOR ALL USING (auth.role() = 'authenticated');
