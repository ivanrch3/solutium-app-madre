-- SQL para configurar la base de datos de Solutium en Supabase
-- Copia y pega esto en el SQL Editor de Supabase y dale a "Run"

-- 1. Tabla de Aplicaciones Satélite
CREATE TABLE IF NOT EXISTS apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Code',
  url TEXT NOT NULL,
  category TEXT DEFAULT 'Productividad',
  status TEXT DEFAULT 'active',
  lifecycle_status TEXT DEFAULT 'development',
  requires_pro BOOLEAN DEFAULT false,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Perfiles de Usuario
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Proyectos
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand_colors JSONB DEFAULT '["#3b82f6", "#1e293b", "#f59e0b"]',
  logo_url TEXT,
  contact_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Datos iniciales para probar (Opcional)
INSERT INTO apps (name, description, url, category, icon)
VALUES 
('Constructor Web', 'Crea sitios web con IA', 'http://localhost:3000', 'Marketing', 'Globe'),
('Generador de Facturas', 'Gestión de cobros profesional', 'http://localhost:3000', 'Finanzas', 'FileText');
