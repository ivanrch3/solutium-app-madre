-- SQL "BLINDADO" PARA SOLUTIUM EN SUPABASE
-- Borra lo anterior y pega esto en el SQL Editor

-- 1. Habilitar la extensión para generar IDs automáticos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Limpiar tablas previas para evitar conflictos de estructura
DROP TABLE IF EXISTS apps CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 3. Tabla de Perfiles de Usuario
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  subscription_tier TEXT DEFAULT 'free',
  language TEXT DEFAULT 'es',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabla de Proyectos
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand_colors JSONB DEFAULT '["#3b82f6", "#1e293b", "#f59e0b"]',
  logo_url TEXT,
  contact_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabla de Aplicaciones Satélite
CREATE TABLE apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 6. Insertar datos de prueba
INSERT INTO apps (name, description, url, category, icon)
VALUES 
('Constructor Web', 'Crea sitios web con IA', 'http://localhost:3000', 'Marketing', 'Globe'),
('Generador de Facturas', 'Gestión de cobros profesional', 'http://localhost:3000', 'Finanzas', 'FileText');

-- 7. Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role, language)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    COALESCE(new.raw_user_meta_data->>'language', 'es')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
