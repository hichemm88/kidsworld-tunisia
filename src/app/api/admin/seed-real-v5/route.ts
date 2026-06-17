import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ListingData {
  slug: string;
  nom: string;
  description: string;
  ville: string;
  quartier: string;
  adresse: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  lat: number | null;
  lng: number | null;
  plan: string;
  category_slug: string;
  images: string[];
  hours: { jour: string; ouvert: boolean; heure_ouverture: string; heure_fermeture: string }[];
}

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const defaultHours = (
  openDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
  open = "09:00",
  close = "18:00"
) =>
  DAYS.map((jour) => ({
    jour,
    ouvert: openDays.includes(jour),
    heure_ouverture: open,
    heure_fermeture: close,
  }));

const IMG = {
  piscine: [
    "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80",
    "https://images.unsplash.com/photo-1572205091580-e59c43ba3bf8?w=800&q=80",
  ],
  gym: [
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
  ],
  karate: [
    "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&q=80",
    "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=800&q=80",
  ],
  yoga: [
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80",
  ],
  theatre: [
    "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&q=80",
    "https://images.unsplash.com/photo-1516307365426-bea591f05011?w=800&q=80",
  ],
  robotique: [
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
    "https://images.unsplash.com/photo-1561144257-e32e8efc6c4f?w=800&q=80",
  ],
  sante: [
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
    "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80",
  ],
  psy: [
    "https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=800&q=80",
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80",
  ],
  dentiste: [
    "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&q=80",
    "https://images.unsplash.com/photo-1588776814546-1ffbb91a4d08?w=800&q=80",
  ],
  fetes: [
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80",
  ],
  shopping: [
    "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&q=80",
    "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=800&q=80",
  ],
  ecole: [
    "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
  ],
  danse: [
    "https://images.unsplash.com/photo-1518834107812-67b0b7c58875?w=800&q=80",
    "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80",
  ],
};

const REAL_LISTINGS: ListingData[] = [
  // ── LOISIRS ────────────────────────────────────────────────────────────────
  {
    slug: "piscine-olympique-rades",
    nom: "Piscine Olympique de Radès",
    description:
      "Complexe aquatique olympique à Radès avec piscine 50m, bassin de plongeon et pataugeoire enfants. Cours de natation pour enfants dès 4 ans, stages d'été, compétitions. Accès public le week-end pour les familles.",
    ville: "Radès",
    quartier: "Radès",
    adresse: "Complexe Sportif de Radès, 2040 Radès, Ben Arous",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.7667,
    lng: 10.2667,
    plan: "free",
    category_slug: "loisirs",
    images: IMG.piscine,
    hours: defaultHours(["Samedi", "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"], "07:00", "19:00"),
  },
  {
    slug: "club-gym-kids-menzah9",
    nom: "Kids Gym Club — El Menzah 9",
    description:
      "Salle de sport dédiée aux enfants et adolescents à El Menzah 9. Cours de gym artistique, acrobaties, fitness kids et musculation encadrés. Équipements adaptés par tranche d'âge (3-6 ans, 7-12 ans, 13-17 ans).",
    ville: "El Menzah",
    quartier: "El Menzah 9",
    adresse: "Rue Ennahli, El Menzah 9, 1013 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: "KidsGymClubTunis",
    instagram: "kidsgym_tn",
    lat: 36.8700,
    lng: 10.1950,
    plan: "free",
    category_slug: "loisirs",
    images: IMG.gym,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "09:00", "20:00"),
  },
  {
    slug: "club-karate-ariana-sport",
    nom: "Ariana Sport Karaté",
    description:
      "Club de karaté affilié à la Fédération Tunisienne des Arts Martiaux. Cours pour enfants dès 5 ans par ceinture : débutant, intermédiaire et compétition. Discipline, respect et confiance en soi au programme.",
    ville: "Ariana",
    quartier: "Riadh Andalouss",
    adresse: "Salle de Sports de Riadh Andalouss, Ariana, 2058",
    phone: null,
    email: null,
    website: null,
    facebook: "ArianaKarate",
    instagram: null,
    lat: 36.8800,
    lng: 10.1700,
    plan: "free",
    category_slug: "loisirs",
    images: IMG.karate,
    hours: defaultHours(["Lundi", "Mercredi", "Vendredi", "Samedi"], "15:00", "19:00"),
  },
  {
    slug: "yoga-kids-la-marsa",
    nom: "Yoga Kids — La Marsa",
    description:
      "Studio de yoga spécialisé enfants et parents-bébés à La Marsa. Cours de yoga adapté aux enfants de 3 à 12 ans, yoga prénatal, méditation et relaxation. Espace calme et chaleureux, petits groupes de 8 élèves maximum.",
    ville: "La Marsa",
    quartier: "La Marsa Centre",
    adresse: "Avenue du 20 Mars, La Marsa, 2070",
    phone: null,
    email: null,
    website: null,
    facebook: "YogaKidsMarsa",
    instagram: "yogakids_lamarsa",
    lat: 36.8783,
    lng: 10.3233,
    plan: "free",
    category_slug: "loisirs",
    images: IMG.yoga,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "08:00", "20:00"),
  },
  {
    slug: "theatre-enfants-tunis-belvédère",
    nom: "Théâtre de Verdure — Belvédère",
    description:
      "Théâtre en plein air dans le Parc du Belvédère proposant des spectacles pour enfants chaque week-end : marionnettes, contes, pièces comiques et musicales. Entrée libre ou à tarif réduit. Ateliers théâtre pendant les vacances.",
    ville: "Tunis",
    quartier: "Belvédère",
    adresse: "Parc du Belvédère, 1002 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.8300,
    lng: 10.1817,
    plan: "free",
    category_slug: "loisirs",
    images: IMG.theatre,
    hours: defaultHours(["Samedi", "Dimanche"], "10:00", "18:00"),
  },
  {
    slug: "club-tennis-soukra",
    nom: "Club de Tennis de La Soukra",
    description:
      "Club de tennis avec 6 courts en terre battue et 2 courts en dur. Cours d'initiation pour enfants dès 5 ans, mini-tennis, stages intensifs vacances. Tournois inter-clubs mensuels. Moniteurs diplômés d'État.",
    ville: "La Soukra",
    quartier: "La Soukra",
    adresse: "Route de La Soukra Km 5, 2036 La Soukra",
    phone: null,
    email: null,
    website: null,
    facebook: "TennisSoukra",
    instagram: null,
    lat: 36.8950,
    lng: 10.2117,
    plan: "free",
    category_slug: "loisirs",
    images: [
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
      "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80",
    ],
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "07:00", "20:00"),
  },
  {
    slug: "skate-park-lac2",
    nom: "Skate Park des Berges du Lac",
    description:
      "Skate park moderne en plein air aux Berges du Lac II avec rampes, half-pipe et bowl. Accès libre et gratuit. Cours de skateboard et trottinette freestyle pour enfants à partir de 6 ans les week-ends.",
    ville: "Tunis",
    quartier: "Les Berges du Lac",
    adresse: "Berges du Lac II, Boulevard de la Terre, 1053 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: "skatepark_lac2",
    lat: 36.8500,
    lng: 10.2500,
    plan: "free",
    category_slug: "loisirs",
    images: [
      "https://images.unsplash.com/photo-1572731960656-8d539bb88721?w=800&q=80",
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80",
    ],
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "09:00", "20:00"),
  },

  // ── ATELIERS ───────────────────────────────────────────────────────────────
  {
    slug: "atelier-robotique-kids-menzah",
    nom: "Robo Academy — Robotique Enfants",
    description:
      "Académie de robotique et coding pour enfants de 6 à 16 ans à El Menzah. Initiation à Scratch, Python, Arduino et Lego Mindstorms. Stages pendant les vacances scolaires, club hebdomadaire et compétitions robotiques nationales.",
    ville: "El Menzah",
    quartier: "El Menzah 6",
    adresse: "Rue des Ingénieurs, El Menzah 6, 1004 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: "RoboAcademyTunis",
    instagram: "roboacademy_tn",
    lat: 36.8683,
    lng: 10.1817,
    plan: "free",
    category_slug: "ateliers",
    images: IMG.robotique,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "10:00", "19:00"),
  },
  {
    slug: "atelier-theatre-enfants-ariana",
    nom: "Les Petits Comédiens — Atelier Théâtre",
    description:
      "Atelier de théâtre et expression scénique pour enfants de 6 à 16 ans à Ariana. Improvisation, mise en scène, travail de la voix et du corps. Spectacle de fin d'année devant les parents. Professeurs comédiens professionnels.",
    ville: "Ariana",
    quartier: "Ariana Ville",
    adresse: "Maison de la Culture d'Ariana, Avenue de la République, 2080 Ariana",
    phone: null,
    email: null,
    website: null,
    facebook: "PetitsComediensAriana",
    instagram: null,
    lat: 36.8617,
    lng: 10.1958,
    plan: "free",
    category_slug: "ateliers",
    images: IMG.theatre,
    hours: defaultHours(["Mercredi", "Samedi", "Dimanche"], "10:00", "18:00"),
  },
  {
    slug: "atelier-danse-contemporaine-la-marsa",
    nom: "Studio Danse Contemporaine — La Marsa",
    description:
      "Studio de danse proposant ballet classique, modern jazz, hip-hop et danse contemporaine pour enfants dès 4 ans. Cours progressifs par niveau, examen de fin d'année Royal Academy of Dance. Spectacle annuel sur scène professionnelle.",
    ville: "La Marsa",
    quartier: "La Marsa Corniche",
    adresse: "Avenue de la Corniche, La Marsa, 2070",
    phone: null,
    email: null,
    website: null,
    facebook: "StudioDanseLaMarsa",
    instagram: "danse_lamarsa",
    lat: 36.8817,
    lng: 10.3283,
    plan: "free",
    category_slug: "ateliers",
    images: IMG.danse,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "10:00", "20:00"),
  },
  {
    slug: "cours-anglais-kids-ennasr",
    nom: "English Kids Club — Ennasr",
    description:
      "Centre de soutien scolaire et cours d'anglais intensifs pour enfants de 4 à 16 ans à Ennasr. Méthode communicative, jeux pédagogiques, préparation aux examens Cambridge KET/PET/FCE. Petits groupes de 5 à 8 enfants.",
    ville: "Ariana",
    quartier: "Ennasr",
    adresse: "Rue de la Méditerranée, Ennasr I, 2037 Ariana",
    phone: null,
    email: null,
    website: null,
    facebook: "EnglishKidsClubEnnasr",
    instagram: null,
    lat: 36.8783,
    lng: 10.2017,
    plan: "free",
    category_slug: "education",
    images: [
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
    ],
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "14:00", "19:00"),
  },
  {
    slug: "soutien-scolaire-carthage",
    nom: "Centre de Soutien Scolaire Carthage",
    description:
      "Centre de cours particuliers et de soutien scolaire à Carthage pour tous niveaux du primaire au bac. Mathématiques, sciences, français, arabe et anglais. Professeurs agrégés et certifiés. Bilan de niveau gratuit à l'inscription.",
    ville: "Carthage",
    quartier: "Carthage Hannibal",
    adresse: "Avenue Hannibal, Carthage Hannibal, 2016",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.8567,
    lng: 10.3283,
    plan: "free",
    category_slug: "education",
    images: IMG.ecole,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "09:00", "19:00"),
  },

  // ── SANTE ──────────────────────────────────────────────────────────────────
  {
    slug: "cabinet-psy-enfant-menzah",
    nom: "Cabinet de Psychologie Enfant — El Menzah",
    description:
      "Psychologue clinicien spécialisé enfants et adolescents à El Menzah. Prise en charge des troubles du comportement, difficultés scolaires, anxiété, dépression, autisme (TSA) et troubles dys. Thérapie cognitivo-comportementale (TCC).",
    ville: "El Menzah",
    quartier: "El Menzah 5",
    adresse: "Rue du Lac El Menzah 5, 1004 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.8633,
    lng: 10.1800,
    plan: "free",
    category_slug: "sante",
    images: IMG.psy,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"], "09:00", "17:00"),
  },
  {
    slug: "orthophoniste-ariana",
    nom: "Cabinet d'Orthophonie — Ariana",
    description:
      "Orthophoniste diplômée prenant en charge les troubles du langage oral et écrit chez l'enfant : retard de parole, bégaiement, dyslexie, dysorthographie et dysphasie. Bilan et rééducation orthophonique. Prise en charge CNAM.",
    ville: "Ariana",
    quartier: "Ariana Centre",
    adresse: "Résidence Les Roses, Avenue de la Liberté, Ariana, 2080",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.8617,
    lng: 10.1958,
    plan: "free",
    category_slug: "sante",
    images: IMG.psy,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "08:30", "17:00"),
  },
  {
    slug: "cabinet-dermato-pediatrique-lac",
    nom: "Dermatologie Pédiatrique — Lac 1",
    description:
      "Dermatologue spécialisé dans les affections cutanées de l'enfant : eczéma atopique, psoriasis, urticaire, alopécie et verrues. Consultation pédiatrique dès la naissance. Laser et traitements adaptés aux peaux sensibles.",
    ville: "Tunis",
    quartier: "Les Berges du Lac",
    adresse: "Immeuble Manzeh, Les Berges du Lac I, 1053 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.8350,
    lng: 10.2317,
    plan: "free",
    category_slug: "sante",
    images: IMG.sante,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "09:00", "18:00"),
  },
  {
    slug: "kine-pediatrique-manouba",
    nom: "Cabinet de Kinésithérapie Pédiatrique — Manouba",
    description:
      "Kinésithérapeute spécialisé enfants à Manouba. Rééducation motrice, physiothérapie respiratoire (bronchiolite, asthme), traitement des scolioses et pieds plats. Séances de 30 à 45 minutes. Prise en charge CNAM.",
    ville: "Manouba",
    quartier: "Manouba",
    adresse: "Avenue Farhat Hached, Manouba, 2010",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.8083,
    lng: 10.0992,
    plan: "free",
    category_slug: "sante",
    images: IMG.sante,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "08:00", "18:00"),
  },
  {
    slug: "dentiste-enfants-marsa",
    nom: "Dentiste Pédiatrique — La Marsa",
    description:
      "Cabinet dentaire 100% dédié aux enfants à La Marsa. Approche douce et ludique pour apprivoiser les soins dès le premier dent. Soins conservateurs, extractions, orthodontie précoce et scellement des sillons. Sans rendez-vous urgent.",
    ville: "La Marsa",
    quartier: "La Marsa Centre",
    adresse: "Avenue Habib Bourguiba, La Marsa, 2070",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.8833,
    lng: 10.3217,
    plan: "free",
    category_slug: "sante",
    images: IMG.dentiste,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "09:00", "17:30"),
  },
  {
    slug: "centre-autisme-tunis",
    nom: "Centre de Prise en Charge de l'Autisme — Tunis",
    description:
      "Centre spécialisé dans le diagnostic et la prise en charge des Troubles du Spectre Autistique (TSA) à Tunis. Équipe pluridisciplinaire : pédopsychiatre, psychologue, orthophoniste, éducateur spécialisé. Programme ABA et TEACCH.",
    ville: "Tunis",
    quartier: "Montplaisir",
    adresse: "Rue Lac Windermere, Montplaisir, 1002 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: "CentreAutismeTunis",
    instagram: null,
    lat: 36.8233,
    lng: 10.1817,
    plan: "premium",
    category_slug: "sante",
    images: IMG.psy,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"], "08:00", "17:00"),
  },

  // ── FETES ──────────────────────────────────────────────────────────────────
  {
    slug: "photographe-anniversaire-tunis",
    nom: "Studio Photo Kids — Anniversaires & Baptêmes",
    description:
      "Photographe professionnel spécialisé dans les photos de famille, anniversaires enfants et baptêmes à Tunis. Reportage complet à domicile ou en salle, retouche photo incluse, album numérique livré en 7 jours.",
    ville: "Tunis",
    quartier: "El Menzah",
    adresse: "El Menzah 7, 1004 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: "StudioPhotoKidsTunis",
    instagram: "photokids_tn",
    lat: 36.8650,
    lng: 10.1867,
    plan: "free",
    category_slug: "fetes",
    images: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
      "https://images.unsplash.com/photo-1502043310792-d2a21c635a47?w=800&q=80",
    ],
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "09:00", "20:00"),
  },
  {
    slug: "patisserie-gateau-anniversaire-ariana",
    nom: "Sweet Dreams — Gâteaux d'Anniversaire",
    description:
      "Pâtissière artisanale à Ariana spécialisée dans les gâteaux d'anniversaire personnalisés pour enfants. Gâteaux thématiques (licorne, super-héros, Minecraft...), cupcakes, cake pops et candy bars. Commande 5 jours à l'avance.",
    ville: "Ariana",
    quartier: "Ennasr",
    adresse: "Ennasr II, Ariana, 2037",
    phone: null,
    email: null,
    website: null,
    facebook: "SweetDreamsAriana",
    instagram: "sweetdreams_tn",
    lat: 36.8800,
    lng: 10.2033,
    plan: "free",
    category_slug: "fetes",
    images: [
      "https://images.unsplash.com/photo-1558636508-e0969e8e1cf6?w=800&q=80",
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80",
    ],
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "09:00", "19:00"),
  },
  {
    slug: "location-chateau-gonflable-tunis",
    nom: "Fun Gonflable — Location Structures Gonflables",
    description:
      "Location de châteaux gonflables, toboggans et structures de jeux pour anniversaires et événements enfants dans tout le Grand Tunis. Livraison, installation et récupération incluses. Plus de 20 modèles disponibles.",
    ville: "Tunis",
    quartier: "Ben Arous",
    adresse: "Zone Industrielle Ben Arous, 2013 Ben Arous",
    phone: null,
    email: null,
    website: null,
    facebook: "FunGonflableTunis",
    instagram: "fungonflable_tn",
    lat: 36.7533,
    lng: 10.2244,
    plan: "free",
    category_slug: "fetes",
    images: IMG.fetes,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "08:00", "20:00"),
  },

  // ── SHOPPING ───────────────────────────────────────────────────────────────
  {
    slug: "librairie-enfants-mille-et-une-pages",
    nom: "Mille et Une Pages — Librairie Jeunesse",
    description:
      "Librairie spécialisée en littérature jeunesse et livres scolaires à La Marsa. Large sélection de livres en arabe, français et anglais pour tous les âges. Contes illustrés, romans, BD, encyclopédies et jeux éducatifs.",
    ville: "La Marsa",
    quartier: "La Marsa Centre",
    adresse: "Rue de Carthage, La Marsa, 2070",
    phone: null,
    email: null,
    website: null,
    facebook: "MilleEtUnePagesMarsa",
    instagram: null,
    lat: 36.8833,
    lng: 10.3200,
    plan: "free",
    category_slug: "shopping",
    images: [
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
    ],
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "09:00", "19:00"),
  },
  {
    slug: "pharmacie-bebes-menzah",
    nom: "Pharmacie Bébés & Maman — El Menzah",
    description:
      "Pharmacie spécialisée puériculture et parapharmacie bébé à El Menzah. Laits maternisés, crèmes bébé, tire-lait, matelas à langer, thermomètres et articles de soin. Conseil personnalisé par des pharmaciens spécialisés.",
    ville: "El Menzah",
    quartier: "El Menzah 6",
    adresse: "Avenue Menzah VI, El Menzah 6, 1004 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.8683,
    lng: 10.1817,
    plan: "free",
    category_slug: "shopping",
    images: [
      "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&q=80",
      "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800&q=80",
    ],
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "08:00", "21:00"),
  },
  {
    slug: "decathlon-ariana",
    nom: "Decathlon Ariana",
    description:
      "Grande surface spécialisée en articles de sport avec un large rayon enfants. Vélos, trottinettes, patins, maillots de bain, équipements de football, tennis et natation pour enfants. Prix accessibles et qualité garantie.",
    ville: "Ariana",
    quartier: "Ghazela",
    adresse: "Technopôle El Ghazala, Ariana, 2083",
    phone: null,
    email: null,
    website: "https://www.decathlon.tn",
    facebook: "DecathlonTunisie",
    instagram: "decathlon_tn",
    lat: 36.8967,
    lng: 10.1933,
    plan: "free",
    category_slug: "shopping",
    images: [
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80",
    ],
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "09:00", "21:00"),
  },
  {
    slug: "toys-r-us-tunis",
    nom: "Top Toys — Magasin de Jouets",
    description:
      "Grand magasin de jouets à Tunis avec plus de 5 000 références : LEGO, Playmobil, poupées, jeux de société, jouets d'éveil et déguisements. Rayon jeux vidéo et console. Emballage cadeau gratuit.",
    ville: "Tunis",
    quartier: "Centre Urbain Nord",
    adresse: "Centre Commercial CUN, 1082 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: "TopToysTunis",
    instagram: null,
    lat: 36.8417,
    lng: 10.1900,
    plan: "free",
    category_slug: "shopping",
    images: [
      "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=800&q=80",
      "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80",
    ],
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "10:00", "21:00"),
  },

  // ── EDUCATION ──────────────────────────────────────────────────────────────
  {
    slug: "creche-les-petits-princes-ariana",
    nom: "Crèche Les Petits Princes — Ariana",
    description:
      "Crèche et garderie privée agréée à Ariana accueillant les enfants de 3 mois à 3 ans. Équipe de puéricultrices diplômées, menus équilibrés préparés sur place, activités d'éveil, sieste et câlins garantis.",
    ville: "Ariana",
    quartier: "Ariana Ville",
    adresse: "Rue Ibn Khaldoun, Ariana, 2080",
    phone: null,
    email: null,
    website: null,
    facebook: "CrechePetitsPrinces",
    instagram: null,
    lat: 36.8617,
    lng: 10.1958,
    plan: "free",
    category_slug: "education",
    images: [
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80",
      "https://images.unsplash.com/photo-1597430854543-de7aed30f19d?w=800&q=80",
    ],
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"], "07:00", "18:00"),
  },
  {
    slug: "jardin-enfants-montessori-la-marsa",
    nom: "Jardin d'Enfants Montessori La Marsa",
    description:
      "École maternelle suivant la pédagogie Montessori à La Marsa. Accueil des enfants de 2 à 6 ans dans un environnement préparé stimulant l'autonomie et la curiosité. Matériel Montessori authentique, éducatrices certifiées AMI.",
    ville: "La Marsa",
    quartier: "La Marsa",
    adresse: "Rue Sidi Bou Saïd, La Marsa, 2070",
    phone: null,
    email: null,
    website: null,
    facebook: "MontessoriLaMarsa",
    instagram: "montessori_lamarsa",
    lat: 36.8817,
    lng: 10.3267,
    plan: "premium",
    category_slug: "education",
    images: IMG.ecole,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"], "07:30", "17:30"),
  },
];

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (body.secret !== "kidsworld-purge-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const errors: string[] = [];
  let inserted = 0;

  for (const listing of REAL_LISTINGS) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", listing.category_slug)
      .single();

    if (!cat) {
      errors.push(`Category not found: ${listing.category_slug} for ${listing.slug}`);
      continue;
    }

    const { data: existing } = await supabase
      .from("listings")
      .select("id")
      .eq("slug", listing.slug)
      .single();

    let listingId: string;

    if (existing) {
      listingId = existing.id;
      await supabase.from("listings").update({
        nom: listing.nom,
        description: listing.description,
        ville: listing.ville,
        quartier: listing.quartier,
        adresse: listing.adresse,
        phone: listing.phone,
        email: listing.email,
        website: listing.website,
        facebook: listing.facebook,
        instagram: listing.instagram,
        lat: listing.lat,
        lng: listing.lng,
        plan: listing.plan,
        category_id: cat.id,
        is_active: true,
      }).eq("id", listingId);
    } else {
      const { data: newListing, error: insertErr } = await supabase
        .from("listings")
        .insert({
          slug: listing.slug,
          nom: listing.nom,
          description: listing.description,
          ville: listing.ville,
          quartier: listing.quartier,
          adresse: listing.adresse,
          phone: listing.phone,
          email: listing.email,
          website: listing.website,
          facebook: listing.facebook,
          instagram: listing.instagram,
          lat: listing.lat,
          lng: listing.lng,
          plan: listing.plan,
          category_id: cat.id,
          is_active: true,
        })
        .select("id")
        .single();

      if (insertErr || !newListing) {
        errors.push(`Insert failed for ${listing.slug}: ${insertErr?.message}`);
        continue;
      }
      listingId = newListing.id;
      inserted++;
    }

    await supabase.from("listing_media").delete().eq("listing_id", listingId);
    if (listing.images.length > 0) {
      await supabase.from("listing_media").insert(
        listing.images.map((url, i) => ({
          listing_id: listingId,
          url,
          type: "image",
          position: i,
        }))
      );
    }

    await supabase.from("listing_hours").delete().eq("listing_id", listingId);
    if (listing.hours.length > 0) {
      await supabase.from("listing_hours").insert(
        listing.hours.map((h) => ({
          listing_id: listingId,
          jour: h.jour,
          ouvert: h.ouvert,
          heure_ouverture: h.heure_ouverture,
          heure_fermeture: h.heure_fermeture,
        }))
      );
    }
  }

  return NextResponse.json({ ok: true, inserted, errors, total: REAL_LISTINGS.length });
}
