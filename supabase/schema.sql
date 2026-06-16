-- ============================================================
-- KidsWorld Tunisia — Schéma Supabase
-- Coller ce SQL dans : Supabase > SQL Editor > New query
-- ============================================================

-- Extension pour les UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── CATEGORIES ───────────────────────────────────────────────
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug       TEXT UNIQUE NOT NULL,
  nom        TEXT NOT NULL,
  emoji      TEXT,
  couleur    TEXT DEFAULT '#F26522',
  parent_id  UUID REFERENCES categories(id),
  ordre      INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Catégories principales
INSERT INTO categories (slug, nom, emoji, couleur, ordre) VALUES
  ('sante',     'Santé',             '🏥', '#16a34a', 1),
  ('education', 'Éducation',         '🎓', '#7C3AED', 2),
  ('loisirs',   'Loisirs',           '🎪', '#2563EB', 3),
  ('ateliers',  'Ateliers & Sport',  '🎨', '#DC2626', 4),
  ('fetes',     'Fêtes & Événements','🎂', '#DB2777', 5),
  ('shopping',  'Shopping',          '🛍', '#0891B2', 6);

-- ─── LISTINGS ─────────────────────────────────────────────────
CREATE TABLE listings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT UNIQUE NOT NULL,
  nom           TEXT NOT NULL,
  description   TEXT,
  category_id   UUID REFERENCES categories(id),

  -- Localisation
  ville         TEXT NOT NULL DEFAULT 'Tunis',
  quartier      TEXT,
  adresse       TEXT,
  lat           DECIMAL(9,6),
  lng           DECIMAL(9,6),

  -- Contact
  phone         TEXT,
  website       TEXT,
  email         TEXT,
  instagram     TEXT,
  facebook      TEXT,

  -- Business
  plan          TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  is_verified   BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,

  -- Infos pratiques
  age_min       INT,   -- âge minimum en années
  age_max       INT,   -- âge maximum en années
  prix_label    TEXT,  -- ex: "À partir de 15 DT", "60 DT", "Sur devis"

  -- SEO
  meta_title       TEXT,
  meta_description TEXT,

  -- Propriétaire (professionnel inscrit)
  owner_id      UUID REFERENCES auth.users(id),

  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── HORAIRES ─────────────────────────────────────────────────
CREATE TABLE listing_hours (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID REFERENCES listings(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Dim, 1=Lun...
  open_time   TIME,
  close_time  TIME,
  is_closed   BOOLEAN DEFAULT FALSE
);

-- ─── MÉDIAS ───────────────────────────────────────────────────
CREATE TABLE listing_media (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID REFERENCES listings(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  type        TEXT DEFAULT 'image' CHECK (type IN ('image', 'video')),
  is_cover    BOOLEAN DEFAULT FALSE,
  ordre       INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AVIS ─────────────────────────────────────────────────────
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID REFERENCES listings(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id),
  note        INT NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PROFILS UTILISATEURS ─────────────────────────────────────
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  nom         TEXT,
  prenom      TEXT,
  avatar_url  TEXT,
  role        TEXT DEFAULT 'parent' CHECK (role IN ('parent', 'pro', 'admin')),
  ville       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── FAVORIS ──────────────────────────────────────────────────
CREATE TABLE favorites (
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, listing_id)
);

-- ─── VUE : note moyenne par listing ──────────────────────────
CREATE VIEW listings_with_stats AS
SELECT
  l.*,
  c.nom           AS category_nom,
  c.emoji         AS category_emoji,
  c.couleur       AS category_couleur,
  COALESCE(AVG(r.note), 0)::DECIMAL(3,1) AS note_moyenne,
  COUNT(r.id)     AS nb_avis
FROM listings l
LEFT JOIN categories c ON c.id = l.category_id
LEFT JOIN reviews r ON r.listing_id = l.id
GROUP BY l.id, c.nom, c.emoji, c.couleur;

-- ─── INDEX ────────────────────────────────────────────────────
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_ville ON listings(ville);
CREATE INDEX idx_listings_plan ON listings(plan);
CREATE INDEX idx_listings_active ON listings(is_active);
CREATE INDEX idx_reviews_listing ON reviews(listing_id);

-- ─── RLS (Row Level Security) ─────────────────────────────────
ALTER TABLE listings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites     ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_media ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les listings actifs
CREATE POLICY "listings_public_read" ON listings
  FOR SELECT USING (is_active = TRUE);

-- Un pro peut modifier son propre listing
CREATE POLICY "listings_owner_write" ON listings
  FOR ALL USING (auth.uid() = owner_id);

-- Tout le monde peut lire les avis
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (TRUE);

-- Utilisateur connecté peut écrire un avis
CREATE POLICY "reviews_auth_write" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Profil : chacun voit/modifie le sien
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Favoris : chacun gère les siens
CREATE POLICY "favorites_own" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- Trigger : updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_listings_updated
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
