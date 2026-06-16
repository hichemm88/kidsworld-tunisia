-- ============================================================
-- KidsWorld Tunisia — Données d'exemple (seed)
-- Coller dans : Supabase > SQL Editor > New query
-- IMPORTANT : Exécuter schema.sql d'abord
-- ============================================================

-- ─── LISTINGS ─────────────────────────────────────────────────
INSERT INTO listings (slug, nom, description, category_id, ville, quartier, adresse, phone, website, plan, is_verified, is_active, age_min, age_max, prix_label) VALUES

-- Loisirs
('jumpark-trampoline',
 'Jumpark Trampoline',
 'Sur plus de 2 500 m², Jumpark est le plus grand complexe multi-activités indoor de Tunisie. Basketball trampoline, fosse de mousse, parcours Ninja Warrior, Laser Room, zone kids dès 3 ans et Jump Coffee pour les parents.',
 (SELECT id FROM categories WHERE slug = 'loisirs'),
 'Tunis', 'La Soukra', 'Route de La Soukra, Ariana',
 '+216 71 000 001', 'jumpark.tn',
 'premium', true, true, 3, 14, 'Dès 15 TND'),

('fanta-park',
 'Fanta Park',
 'Parc d''attractions indoor pour les tout-petits. Manèges, toboggans géants, zone bébé sécurisée et café parents. Idéal pour les 2-12 ans.',
 (SELECT id FROM categories WHERE slug = 'loisirs'),
 'Tunis', 'Les Berges du Lac', 'Avenue Mohamed V, Lac 1',
 '+216 71 000 002', NULL,
 'premium', true, true, 2, 12, 'Dès 20 TND'),

('mini-ferme-pedagogique',
 'Mini Ferme Pédagogique Bir El Bey',
 'Ferme pédagogique en plein air : animaux de la ferme, ateliers jardinage, pique-nique. Idéal pour les sorties scolaires et en famille.',
 (SELECT id FROM categories WHERE slug = 'loisirs'),
 'Ben Arous', 'Bir El Bey', 'Route de Bir El Bey',
 '+216 71 000 003', NULL,
 'free', false, true, 2, 10, 'Dès 25 TND'),

-- Santé
('dr-ben-ali-sana',
 'Dr. Ben Ali Sana — Pédiatre',
 'Pédiatre avec 15 ans d''expérience. Consultations, vaccinations, urgences enfants. Accueil chaleureux et attentionné pour les tout-petits.',
 (SELECT id FROM categories WHERE slug = 'sante'),
 'Tunis', 'Les Berges du Lac', 'Immeuble Lac Center, Bureau 304',
 '+216 71 000 010', NULL,
 'premium', true, true, 0, 16, '60 TND'),

('dr-trabelsi-dentiste',
 'Dr. Trabelsi — Dentiste Pédiatrique',
 'Cabinet dentaire spécialisé enfants et adolescents. Environnement adapté pour mettre les enfants à l''aise. Orthodontie, soins préventifs.',
 (SELECT id FROM categories WHERE slug = 'sante'),
 'Tunis', 'Lac 1', 'Résidence du Lac, Apt 12',
 '+216 71 000 011', NULL,
 'free', true, true, 3, 18, '70 TND'),

('dr-mansour-ophtalmologue',
 'Dr. Mansour — Ophtalmologue Enfants',
 'Consultation ophtalmologique pédiatrique. Dépistage des troubles visuels, prescription de lunettes enfants, amblyopie.',
 (SELECT id FROM categories WHERE slug = 'sante'),
 'Tunis', 'El Menzah', 'Av. de la Liberté, El Menzah 6',
 '+216 71 000 012', NULL,
 'free', true, true, 0, 18, '55 TND'),

-- Éducation
('kids-english-club',
 'Kids English Club',
 'École de langue anglaise pour enfants de 6 à 16 ans. Méthode communicative, petits groupes, certifications Cambridge. Cours du soir et stages été.',
 (SELECT id FROM categories WHERE slug = 'education'),
 'Tunis', 'Manar 2', 'Rue des Orangers, Manar 2',
 '+216 71 000 020', 'kidsenglishclub.tn',
 'free', true, true, 6, 16, 'Sur inscription'),

('ecole-arc-en-ciel',
 'École Arc-en-Ciel',
 'École maternelle bilingue français-arabe, pédagogie Montessori. Accueil dès 3 ans, petits effectifs, jardin sécurisé, cantine bio.',
 (SELECT id FROM categories WHERE slug = 'education'),
 'Tunis', 'La Marsa', 'Rue de la Corniche, La Marsa',
 '+216 71 000 021', NULL,
 'free', true, true, 3, 6, 'Sur inscription'),

-- Ateliers
('club-natation-junior',
 'Club Natation Junior',
 'Cours de natation pour enfants de 4 à 14 ans. Niveaux débutant à compétition. Piscine couverte chauffée, maîtres-nageurs diplômés d''État.',
 (SELECT id FROM categories WHERE slug = 'ateliers'),
 'Tunis', 'El Menzah', 'Complexe Sportif El Menzah',
 '+216 71 000 030', NULL,
 'free', true, true, 4, 14, 'Dès 80 TND/mois'),

('atelier-robotique-kids',
 'Atelier Robotique Kids',
 'Initiation à la robotique et au code pour les 8-16 ans. Lego Mindstorms, Scratch, Arduino, impression 3D. Stages vacances disponibles.',
 (SELECT id FROM categories WHERE slug = 'ateliers'),
 'Tunis', 'Centre Urbain Nord', 'Immeuble Businesspark, CUN',
 '+216 71 000 031', NULL,
 'premium', true, true, 8, 16, 'Dès 120 TND/mois'),

('studio-danse-kids',
 'Studio Danse Kids',
 'Cours de danse pour enfants : ballet classique, danse moderne, hip-hop. Professeurs diplômés, spectacles de fin d''année.',
 (SELECT id FROM categories WHERE slug = 'ateliers'),
 'Tunis', 'Ennasr', 'Av. des Palmiers, Ennasr 2',
 '+216 71 000 032', NULL,
 'free', true, true, 4, 16, 'Dès 90 TND/mois'),

-- Fêtes
('happy-birthday-events',
 'Happy Birthday Events',
 'Organisation d''anniversaires clé en main pour enfants. Décoration thématique, animation, traiteur, photographe. Du rêve à la réalité !',
 (SELECT id FROM categories WHERE slug = 'fetes'),
 'Tunis', 'Ariana', 'Rue Ibn Khaldoun, Ariana',
 '+216 71 000 040', NULL,
 'premium', false, true, 0, 99, 'Sur devis'),

-- Shopping
('librairie-jeunesse-tunis',
 'Librairie Jeunesse Tunis',
 'La plus grande librairie pour enfants de Tunisie. Livres en français, arabe et anglais, jeux éducatifs, BD, manga, activités créatives.',
 (SELECT id FROM categories WHERE slug = 'shopping'),
 'Tunis', 'Les Berges du Lac', 'Mall du Lac, Rez-de-chaussée',
 '+216 71 000 050', NULL,
 'free', true, true, 0, 16, NULL);

-- ─── HORAIRES (Jumpark) ────────────────────────────────────────
INSERT INTO listing_hours (listing_id, day_of_week, open_time, close_time, is_closed) VALUES
((SELECT id FROM listings WHERE slug = 'jumpark-trampoline'), 0, '10:00', '22:00', false),
((SELECT id FROM listings WHERE slug = 'jumpark-trampoline'), 1, '14:00', '22:00', false),
((SELECT id FROM listings WHERE slug = 'jumpark-trampoline'), 2, '14:00', '22:00', false),
((SELECT id FROM listings WHERE slug = 'jumpark-trampoline'), 3, '14:00', '22:00', false),
((SELECT id FROM listings WHERE slug = 'jumpark-trampoline'), 4, '14:00', '22:00', false),
((SELECT id FROM listings WHERE slug = 'jumpark-trampoline'), 5, '10:00', '23:00', false),
((SELECT id FROM listings WHERE slug = 'jumpark-trampoline'), 6, '10:00', '23:00', false);

-- ─── AVIS ─────────────────────────────────────────────────────
-- Note: user_id NULL pour les données de démo (à remplacer par de vrais users)
-- On désactive temporairement la RLS pour les seeds
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

INSERT INTO reviews (listing_id, note, commentaire, is_verified) VALUES
((SELECT id FROM listings WHERE slug = 'jumpark-trampoline'), 5, 'On y revient chaque vacances scolaires. Mehdi adore le Ninja Warrior !', true),
((SELECT id FROM listings WHERE slug = 'jumpark-trampoline'), 5, 'L''anniversaire de Yasmine était magique. Tout était organisé.', true),
((SELECT id FROM listings WHERE slug = 'jumpark-trampoline'), 4, 'Super pour les grands, la zone kids est un peu petite pour les tout-petits.', true),
((SELECT id FROM listings WHERE slug = 'jumpark-trampoline'), 5, 'Meilleur parc de Tunis sans hésitation !', true),
((SELECT id FROM listings WHERE slug = 'jumpark-trampoline'), 5, 'On y va tous les week-ends. Personnel très sympathique.', true),

((SELECT id FROM listings WHERE slug = 'dr-ben-ali-sana'), 5, 'Docteur très à l''écoute, rassurante avec les enfants.', true),
((SELECT id FROM listings WHERE slug = 'dr-ben-ali-sana'), 5, 'Excellente pédiatre, explique bien les choses aux parents.', true),
((SELECT id FROM listings WHERE slug = 'dr-ben-ali-sana'), 5, 'Temps d''attente raisonnable, cabinet propre et moderne.', true),

((SELECT id FROM listings WHERE slug = 'kids-english-club'), 5, 'Mon fils a fait des progrès impressionnants en 6 mois.', true),
((SELECT id FROM listings WHERE slug = 'kids-english-club'), 4, 'Bonne méthode pédagogique, petits groupes comme promis.', true),

((SELECT id FROM listings WHERE slug = 'atelier-robotique-kids'), 5, 'Ma fille de 10 ans est passionnée depuis qu''elle a commencé !', true),
((SELECT id FROM listings WHERE slug = 'atelier-robotique-kids'), 5, 'Super encadrement, les enfants apprennent en s''amusant.', true),

((SELECT id FROM listings WHERE slug = 'happy-birthday-events'), 5, 'Anniversaire parfait pour mes jumeaux. Merci à toute l''équipe !', true),
((SELECT id FROM listings WHERE slug = 'happy-birthday-events'), 4, 'Très belle décoration, animation au top, prix raisonnable.', true),

((SELECT id FROM listings WHERE slug = 'librairie-jeunesse-tunis'), 5, 'Incroyable choix de livres en arabe et français pour enfants.', true),
((SELECT id FROM listings WHERE slug = 'librairie-jeunesse-tunis'), 5, 'Le personnel conseille très bien selon l''âge de l''enfant.', true);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ─── VÉRIFICATION ─────────────────────────────────────────────
SELECT
  l.nom,
  c.nom as categorie,
  l.plan,
  ROUND(AVG(r.note)::numeric, 1) as note_moyenne,
  COUNT(r.id) as nb_avis
FROM listings l
LEFT JOIN categories c ON c.id = l.category_id
LEFT JOIN reviews r ON r.listing_id = l.id
GROUP BY l.nom, c.nom, l.plan
ORDER BY c.nom, nb_avis DESC;
