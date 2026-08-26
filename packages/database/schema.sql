-- ============================================================================
-- Thiqti Database Schema
-- PostgreSQL 15+ compatible
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ----------------------------------------------------------------------------
-- 1. Table `vehicles`
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  sub VARCHAR(255),
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  model_family VARCHAR(100),
  fuel VARCHAR(50) NOT NULL CHECK (fuel IN ('Essence', 'Diesel', 'Hybride', 'Electrique', 'Plug-in Hybride')),
  body_type VARCHAR(50) NOT NULL CHECK (body_type IN ('Citadine', 'Berline', 'Compacte', 'Crossover', 'SUV', 'Monospace', 'Utilitaire', 'Pick-up', 'Cabriolet', 'Coupé')),
  transmission VARCHAR(50) NOT NULL CHECK (transmission IN ('Manuelle', 'Automatique', 'CVT')),
  year INTEGER NOT NULL,
  price_mad INTEGER NOT NULL,
  price_display VARCHAR(50) NOT NULL,
  km INTEGER DEFAULT 0,
  city VARCHAR(100) NOT NULL DEFAULT 'Maroc',
  color VARCHAR(50),
  places INTEGER DEFAULT 5,
  engine_power_ch INTEGER,
  consumption_l100km DECIMAL(4, 2),
  co2_gkm INTEGER,
  acceleration_0_100 DECIMAL(4, 2),
  trunk_liters INTEGER,
  inventory_type VARCHAR(20) NOT NULL DEFAULT 'occasion' CHECK (inventory_type IN ('neuf', 'occasion')),
  description TEXT,
  score DECIMAL(5, 2) NOT NULL DEFAULT 80.0,
  score_normalized DECIMAL(4, 2) NOT NULL DEFAULT 8.0,
  nb_reviews INTEGER DEFAULT 0,
  source VARCHAR(100) NOT NULL DEFAULT 'Thiqti',
  source_url TEXT,
  seller_name VARCHAR(200),
  seller_phone VARCHAR(50),
  whatsapp_number VARCHAR(50),
  image_url TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  delivery_delay VARCHAR(100),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour la table `vehicles`
CREATE INDEX IF NOT EXISTS idx_vehicles_make_model ON vehicles(make, model);
CREATE INDEX IF NOT EXISTS idx_vehicles_fuel ON vehicles(fuel);
CREATE INDEX IF NOT EXISTS idx_vehicles_body_type ON vehicles(body_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_price ON vehicles(price_mad);
CREATE INDEX IF NOT EXISTS idx_vehicles_year ON vehicles(year);
CREATE INDEX IF NOT EXISTS idx_vehicles_inventory_type ON vehicles(inventory_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_score ON vehicles(score DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_city ON vehicles(city);

-- Index Full-Text Search GIN
CREATE INDEX IF NOT EXISTS idx_vehicles_search ON vehicles USING GIN (
  to_tsvector('french', COALESCE(name, '') || ' ' || COALESCE(make, '') || ' ' || COALESCE(model, '') || ' ' || COALESCE(body_type, '') || ' ' || COALESCE(fuel, '') || ' ' || COALESCE(city, ''))
);

-- ----------------------------------------------------------------------------
-- 2. Table `reviews`
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  sentiment VARCHAR(20) NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  category VARCHAR(50) NOT NULL CHECK (category IN ('Confort', 'Consommation', 'Fiabilité', 'Design', 'Équipements', 'Prix', 'Sûreté')),
  rating DECIMAL(3, 1),
  source VARCHAR(100) DEFAULT 'user',
  author_name VARCHAR(100),
  language VARCHAR(20) DEFAULT 'fr' CHECK (language IN ('fr', 'ar', 'darija')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_vehicle_id ON reviews(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reviews_sentiment ON reviews(sentiment);
CREATE INDEX IF NOT EXISTS idx_reviews_category ON reviews(category);

-- ----------------------------------------------------------------------------
-- 3. Table `conversations`
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(100) NOT NULL,
  user_message TEXT NOT NULL,
  bot_reply TEXT NOT NULL,
  criteria JSONB DEFAULT '{}'::jsonb,
  intent VARCHAR(50) DEFAULT 'search' CHECK (intent IN ('greeting', 'search', 'info', 'compare', 'help', 'thanks', 'unknown')),
  vehicles_shown JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);

-- ----------------------------------------------------------------------------
-- 4. Table `favorites`
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(100) NOT NULL,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_session_vehicle UNIQUE (session_id, vehicle_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_session ON favorites(session_id);

-- ----------------------------------------------------------------------------
-- 5. Table `search_logs`
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS search_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(100),
  query TEXT,
  filters JSONB DEFAULT '{}'::jsonb,
  results_count INTEGER DEFAULT 0,
  vehicle_id_clicked UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_logs_session ON search_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at DESC);
