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
  ecole: [
    "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
  ],
  langue: [
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
  ],
  musique: [
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
    "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&q=80",
  ],
  equitation: [
    "https://images.unsplash.com/photo-1553284965-5dd51e817e8d?w=800&q=80",
    "https://images.unsplash.com/photo-1598974357801-cbca100e65d3?w=800&q=80",
  ],
  nautique: [
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    "https://images.unsplash.com/photo-1502007651369-93d5a7f9dbb5?w=800&q=80",
  ],
  sport: [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&q=80",
  ],
  zoo: [
    "https://images.unsplash.com/photo-1497906539264-eb74442e37a9?w=800&q=80",
    "https://images.unsplash.com/photo-1504173010664-32509107de5f?w=800&q=80",
  ],
  parc: [
    "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&q=80",
    "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&q=80",
  ],
  fetes: [
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80",
  ],
  shopping: [
    "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&q=80",
    "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=800&q=80",
  ],
  poterie: [
    "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80",
    "https://images.unsplash.com/photo-1494932648085-4478e9f5a1fe?w=800&q=80",
  ],
  art: [
    "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80",
    "https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=800&q=80",
  ],
  sante: [
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
    "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80",
  ],
  bowling: [
    "https://images.unsplash.com/photo-1596451190630-186aff535bf2?w=800&q=80",
    "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=800&q=80",
  ],
  cuisine: [
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
    "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&q=80",
  ],
};

const REAL_LISTINGS: ListingData[] = [
  // ── EDUCATION ──────────────────────────────────────────────────────────────
  {
    slug: "iblv-tunis",
    nom: "Institut Bourguiba des Langues Vivantes",
    description:
      "L'une des meilleures écoles de langues de Tunisie, fondée en 1956. Cours d'anglais, français, arabe, allemand, espagnol et italien pour enfants dès 6 ans. Examens officiels Cambridge et DELF.",
    ville: "Tunis",
    quartier: "Montfleury",
    adresse: "47 Avenue de la Liberté, 1002 Tunis",
    phone: "71 832 418",
    email: null,
    website: "http://www.iblv.rnu.tn",
    facebook: null,
    instagram: null,
    lat: 36.8274,
    lng: 10.1774,
    plan: "premium",
    category_slug: "education",
    images: IMG.langue,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "08:00", "19:00"),
  },
  {
    slug: "british-school-tunis",
    nom: "British School of Tunis",
    description:
      "École internationale privée suivant le programme britannique National Curriculum. Accueil des enfants de 3 à 18 ans. Maternelle, primaire et secondaire en anglais. Préparation aux examens IGCSE et A-Levels.",
    ville: "Tunis",
    quartier: "Les Berges du Lac",
    adresse: "Rue du Lac Windermere, Les Berges du Lac II, 1053 Tunis",
    phone: null,
    email: "admissions@bst.edu.tn",
    website: "https://www.bst.edu.tn",
    facebook: "BritishSchoolTunis",
    instagram: null,
    lat: 36.8428,
    lng: 10.2456,
    plan: "premium",
    category_slug: "education",
    images: IMG.ecole,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"], "07:30", "16:30"),
  },
  {
    slug: "ecole-internationale-privee-carthage",
    nom: "École Internationale Privée de Carthage",
    description:
      "Établissement scolaire privé de haut niveau à Carthage proposant les cycles maternelle, primaire et collège. Enseignement bilingue français-anglais avec activités extrascolaires (sport, théâtre, arts plastiques).",
    ville: "Carthage",
    quartier: "Carthage Salammbô",
    adresse: "Avenue Hannibal, Carthage, 2016 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.8617,
    lng: 10.3244,
    plan: "free",
    category_slug: "education",
    images: IMG.ecole,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"], "08:00", "17:00"),
  },
  {
    slug: "conservatoire-national-musique-tunis",
    nom: "Conservatoire National de Musique de Tunis",
    description:
      "Institution publique de référence pour l'enseignement musical en Tunisie. Cours de piano, violon, flûte, oud, percussions et chant pour enfants à partir de 6 ans. Cursus classique occidental et musique arabe.",
    ville: "Tunis",
    quartier: "Bab El Khadra",
    adresse: "20 Rue Zarkoun, 1008 Tunis",
    phone: "71 563 524",
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.8233,
    lng: 10.1783,
    plan: "free",
    category_slug: "ateliers",
    images: IMG.musique,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "09:00", "18:00"),
  },
  {
    slug: "academie-musique-espace-sonore-ariana",
    nom: "Espace Sonore — École de Musique",
    description:
      "Académie de musique privée à Ariana proposant des cours individuels et collectifs : piano, guitare, chant, percussions et solfège. Professeurs diplômés, cours adaptés aux enfants dès 5 ans et aux adultes.",
    ville: "Ariana",
    quartier: "Ariana Ville",
    adresse: "Rue de la République, Ariana, 2080",
    phone: null,
    email: null,
    website: null,
    facebook: "EspaceSonoreTunis",
    instagram: "espacesonore_tn",
    lat: 36.8617,
    lng: 10.1958,
    plan: "free",
    category_slug: "ateliers",
    images: IMG.musique,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "10:00", "20:00"),
  },

  // ── LOISIRS ────────────────────────────────────────────────────────────────
  {
    slug: "club-hippique-soukra",
    nom: "Club Hippique de La Soukra",
    description:
      "Centre équestre offrant des cours d'équitation pour enfants et adultes de tous niveaux. Poneys pour les plus jeunes, stages durant les vacances scolaires, compétitions internes. Cadre verdoyant aux portes de Tunis.",
    ville: "La Soukra",
    quartier: "La Soukra",
    adresse: "Route de La Soukra, 2036 La Soukra",
    phone: null,
    email: null,
    website: null,
    facebook: "ClubHippiquesoukra",
    instagram: null,
    lat: 36.8917,
    lng: 10.2167,
    plan: "free",
    category_slug: "loisirs",
    images: IMG.equitation,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "08:00", "18:00"),
  },
  {
    slug: "club-nautique-goulette",
    nom: "Club Nautique de La Goulette",
    description:
      "Club de voile et sports nautiques fondé en 1951, situé au port de La Goulette. Initiation à la voile pour enfants dès 8 ans, kayak, planche à voile. Stages d'été et compétitions régionales.",
    ville: "La Goulette",
    quartier: "La Goulette",
    adresse: "Port de La Goulette, 2060 La Goulette",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.8183,
    lng: 10.3022,
    plan: "free",
    category_slug: "loisirs",
    images: IMG.nautique,
    hours: defaultHours(["Samedi", "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"], "08:00", "17:00"),
  },
  {
    slug: "complexe-sportif-menzah",
    nom: "Complexe Sportif El Menzah",
    description:
      "Grand complexe sportif avec stade, piscines olympiques, terrains de tennis et de football. Accueil des familles pour la natation libre le week-end. Stages sportifs enfants pendant les vacances scolaires.",
    ville: "El Menzah",
    quartier: "El Menzah 1",
    adresse: "Avenue Mohamed V, El Menzah, 1004 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.8550,
    lng: 10.1817,
    plan: "free",
    category_slug: "loisirs",
    images: IMG.sport,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "07:00", "20:00"),
  },
  {
    slug: "zoo-belvedere-tunis",
    nom: "Zoo et Parc du Belvédère",
    description:
      "Le plus grand parc public de Tunis (100 ha) et son zoo abritant plus de 200 animaux. Idéal pour une sortie en famille : lions, girafes, singes, oiseaux exotiques. Aire de jeux pour enfants, piste de vélo et espaces verts.",
    ville: "Tunis",
    quartier: "Belvédère",
    adresse: "Avenue du Belvédère, 1002 Tunis",
    phone: "71 288 686",
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.8283,
    lng: 10.1817,
    plan: "free",
    category_slug: "loisirs",
    images: IMG.zoo,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "09:00", "17:00"),
  },
  {
    slug: "parc-ennahli-tunis",
    nom: "Parc Ennahli",
    description:
      "Parc municipal verdoyant d'El Menzah avec aires de jeux modernes, pistes de jogging et espaces pique-nique. Très apprécié des familles avec enfants le week-end. Entrée libre. Accessible en voiture et en bus.",
    ville: "El Menzah",
    quartier: "Ennahli",
    adresse: "Avenue Ennahli, El Menzah 9, 1013 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.8700,
    lng: 10.1933,
    plan: "free",
    category_slug: "loisirs",
    images: IMG.parc,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "08:00", "20:00"),
  },
  {
    slug: "magic-land-tunis",
    nom: "Magic Land — Parc de Jeux",
    description:
      "Parc d'attractions indoor pour enfants de 2 à 12 ans : toboggan géant, trampolines, piscine à balles, château gonflable et manèges. Animation anniversaire sur réservation. Café-restaurant pour les parents.",
    ville: "Tunis",
    quartier: "Centre Urbain Nord",
    adresse: "Centre Commercial CUN, Avenue Taïeb Mehiri, 1082 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: "MagicLandTunis",
    instagram: "magicland_tunis",
    lat: 36.8417,
    lng: 10.1900,
    plan: "free",
    category_slug: "loisirs",
    images: [
      "https://images.unsplash.com/photo-1597733153203-a54d0fbc47de?w=800&q=80",
      "https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=800&q=80",
    ],
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "10:00", "21:00"),
  },
  {
    slug: "bowling-menzah",
    nom: "Bowling de Menzah",
    description:
      "Salle de bowling moderne à El Menzah avec 12 pistes professionnelles. Idéal pour les anniversaires et sorties familiales. Location de chaussures incluse. Bar et restauration sur place. Réservation possible en ligne.",
    ville: "El Menzah",
    quartier: "El Menzah 5",
    adresse: "Rue du Bowling, El Menzah 5, 1004 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.8633,
    lng: 10.1800,
    plan: "free",
    category_slug: "loisirs",
    images: IMG.bowling,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "14:00", "23:00"),
  },
  {
    slug: "paintball-gammarth",
    nom: "Paintball Gammarth",
    description:
      "Terrain de paintball en plein air à Gammarth, idéal pour les anniversaires d'enfants (à partir de 10 ans) et les sorties en groupe. Équipement fourni, instructeurs certifiés. Formules demi-journée et journée complète.",
    ville: "Gammarth",
    quartier: "Gammarth",
    adresse: "Route Touristique de Gammarth, 2078 Gammarth",
    phone: null,
    email: null,
    website: null,
    facebook: "PaintballGammarth",
    instagram: null,
    lat: 36.9167,
    lng: 10.2900,
    plan: "free",
    category_slug: "loisirs",
    images: [
      "https://images.unsplash.com/photo-1551645099-c609d46f86de?w=800&q=80",
      "https://images.unsplash.com/photo-1562088287-bde35a1ea917?w=800&q=80",
    ],
    hours: defaultHours(["Samedi", "Dimanche"], "09:00", "18:00"),
  },

  // ── FETES ──────────────────────────────────────────────────────────────────
  {
    slug: "salle-fetes-dar-jed-la-marsa",
    nom: "Dar Jed — Salle des Fêtes",
    description:
      "Belle salle des fêtes à La Marsa pouvant accueillir de 50 à 300 personnes. Spécialiste des fêtes d'anniversaire enfants, mariages et réceptions. Décoration personnalisée, traiteur partenaire, animations disponibles.",
    ville: "La Marsa",
    quartier: "La Marsa",
    adresse: "Route de La Marsa, 2070 La Marsa",
    phone: null,
    email: null,
    website: null,
    facebook: "DarJedLaMarsa",
    instagram: null,
    lat: 36.8783,
    lng: 10.3250,
    plan: "free",
    category_slug: "fetes",
    images: IMG.fetes,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "10:00", "23:00"),
  },
  {
    slug: "salle-fetes-les-palmiers-ariana",
    nom: "Salle des Fêtes Les Palmiers",
    description:
      "Salle des fêtes moderne à Ariana avec jardin privatif. Capacité de 80 à 250 personnes. Formules clés en main pour anniversaires enfants : décoration thématique, animateur, buffet sucré. Parking gratuit.",
    ville: "Ariana",
    quartier: "Ariana Soghra",
    adresse: "Avenue des Palmiers, Ariana, 2080",
    phone: null,
    email: null,
    website: null,
    facebook: "SalleFetesPalmiersAriana",
    instagram: null,
    lat: 36.8717,
    lng: 10.1900,
    plan: "free",
    category_slug: "fetes",
    images: IMG.fetes,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "10:00", "23:00"),
  },
  {
    slug: "animateur-kids-party-tunis",
    nom: "Kids Party — Animation Enfants",
    description:
      "Service d'animation professionnelle pour fêtes d'anniversaire et événements enfants. Clowns, magiciens, maquillage, jeux gonflables et ateliers créatifs. Intervient à domicile ou en salle partout dans le Grand Tunis.",
    ville: "Tunis",
    quartier: "Menzah 6",
    adresse: "El Menzah 6, 1004 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: "KidsPartyTunis",
    instagram: "kidsparty_tn",
    lat: 36.8683,
    lng: 10.1817,
    plan: "free",
    category_slug: "fetes",
    images: [
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80",
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    ],
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "09:00", "22:00"),
  },
  {
    slug: "chapiteau-fetes-gammarth",
    nom: "Le Chapiteau — Réceptions & Fêtes",
    description:
      "Salle de réception haut de gamme à Gammarth avec vue mer. Idéale pour baptêmes, anniversaires et mariages. Capacité jusqu'à 500 personnes. Cuisine traiteur raffinée, décoration florale sur mesure, DJ disponible.",
    ville: "Gammarth",
    quartier: "Gammarth Supérieur",
    adresse: "Route Touristique de Gammarth, 2078 Gammarth",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.9133,
    lng: 10.2867,
    plan: "free",
    category_slug: "fetes",
    images: IMG.fetes,
    hours: defaultHours(["Vendredi", "Samedi", "Dimanche"], "12:00", "23:59"),
  },

  // ── SHOPPING ───────────────────────────────────────────────────────────────
  {
    slug: "orchestra-tunis-city",
    nom: "Orchestra Prémaman — Tunis City",
    description:
      "Enseigne française spécialisée en vêtements et accessoires pour enfants de 0 à 14 ans et femmes enceintes. Large choix de collections saisonnières, chaussures, puériculture légère et jouets d'éveil. Promotions régulières.",
    ville: "Tunis",
    quartier: "Centre Urbain Nord",
    adresse: "Centre Commercial Tunis City, Avenue Taïeb Mehiri, 1082 Tunis",
    phone: null,
    email: null,
    website: "https://www.orchestra.fr",
    facebook: null,
    instagram: null,
    lat: 36.8408,
    lng: 10.1908,
    plan: "free",
    category_slug: "shopping",
    images: IMG.shopping,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "10:00", "21:00"),
  },
  {
    slug: "kiabi-lac-tunis",
    nom: "Kiabi — Les Berges du Lac",
    description:
      "Grande surface textile familiale proposant des vêtements à petits prix pour toute la famille, de la naissance à l'adulte. Large rayon enfants et bébés, sous-vêtements, accessoires de mode. Parking gratuit.",
    ville: "Tunis",
    quartier: "Les Berges du Lac",
    adresse: "Centre Commercial du Lac, Les Berges du Lac I, 1053 Tunis",
    phone: null,
    email: null,
    website: "https://www.kiabi.com",
    facebook: null,
    instagram: null,
    lat: 36.8383,
    lng: 10.2317,
    plan: "free",
    category_slug: "shopping",
    images: IMG.shopping,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "10:00", "21:00"),
  },
  {
    slug: "zara-kids-tunis-city",
    nom: "Zara Kids — Tunis City",
    description:
      "Boutique Zara dédiée aux collections enfants et bébés. Mode tendance de 0 à 14 ans : vêtements, chaussures et accessoires renouvelés chaque saison. Situé dans le centre commercial Tunis City.",
    ville: "Tunis",
    quartier: "Centre Urbain Nord",
    adresse: "Centre Commercial Tunis City, Avenue Taïeb Mehiri, 1082 Tunis",
    phone: null,
    email: null,
    website: "https://www.zara.com",
    facebook: null,
    instagram: null,
    lat: 36.8410,
    lng: 10.1906,
    plan: "free",
    category_slug: "shopping",
    images: IMG.shopping,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "10:00", "21:00"),
  },
  {
    slug: "mothercare-tunis",
    nom: "Mothercare Tunis",
    description:
      "Spécialiste de la puériculture et de la mode maternité-bébé. Poussettes, sièges auto, lits, vêtements nouveau-né et jouets d'éveil. Conseil personnalisé par des spécialistes. Livraison à domicile disponible.",
    ville: "Tunis",
    quartier: "Les Berges du Lac",
    adresse: "Les Berges du Lac II, 1053 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: "MothercareTunisie",
    instagram: "mothercare_tn",
    lat: 36.8450,
    lng: 10.2400,
    plan: "free",
    category_slug: "shopping",
    images: [
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80",
      "https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=800&q=80",
    ],
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "10:00", "21:00"),
  },
  {
    slug: "jumbo-toys-tunis",
    nom: "Jumbo Score — Rayon Jouets",
    description:
      "Hypermarché Jumbo Score avec l'un des plus grands rayons jouets et articles bébé de Tunis. Grandes marques à prix compétitifs : LEGO, Playmobil, Barbie, vélos enfants, jeux de société. Promotions spéciales fêtes.",
    ville: "Tunis",
    quartier: "Centre Urbain Nord",
    adresse: "Avenue Taïeb Mehiri, Centre Urbain Nord, 1082 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.8433,
    lng: 10.1917,
    plan: "free",
    category_slug: "shopping",
    images: [
      "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=800&q=80",
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80",
    ],
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "09:00", "21:00"),
  },

  // ── ATELIERS ───────────────────────────────────────────────────────────────
  {
    slug: "atelier-poterie-sidi-bou-said",
    nom: "Atelier de Poterie de Sidi Bou Saïd",
    description:
      "Atelier authentique de poterie bleue et blanche dans le village pittoresque de Sidi Bou Saïd. Cours de poterie pour enfants et adultes : tournage, modelage, décoration et cuisson. Souvenir unique à ramener chez soi.",
    ville: "Sidi Bou Saïd",
    quartier: "Sidi Bou Saïd",
    adresse: "Rue Sidi Bou Saïd, 2026 Sidi Bou Saïd",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: "poterie_sidibousaid",
    lat: 36.8708,
    lng: 10.3414,
    plan: "free",
    category_slug: "ateliers",
    images: IMG.poterie,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "09:00", "18:00"),
  },
  {
    slug: "atelier-arts-plastiques-ennasr",
    nom: "Atelier des Arts Plastiques — Ennasr",
    description:
      "Studio d'arts plastiques pour enfants de 4 à 16 ans à Ennasr. Dessin, peinture, sculpture, art numérique et calligraphie arabe. Cours hebdomadaires, stages vacances et ateliers anniversaire. Exposition annuelle des œuvres.",
    ville: "Ariana",
    quartier: "Ennasr",
    adresse: "Rue de l'Environnement, Ennasr II, 2037 Ariana",
    phone: null,
    email: null,
    website: null,
    facebook: "AtelierArtsPlastiquesEnnasr",
    instagram: "arts_plastiques_ennasr",
    lat: 36.8783,
    lng: 10.2017,
    plan: "free",
    category_slug: "ateliers",
    images: IMG.art,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "10:00", "19:00"),
  },
  {
    slug: "atelier-cuisine-enfants-la-marsa",
    nom: "Petits Chefs — Atelier Cuisine Enfants",
    description:
      "Atelier de cuisine ludique pour enfants de 5 à 14 ans à La Marsa. Préparation de recettes sucrées et salées encadrée par un chef. Cours du week-end, stages thématiques pendant les vacances, ateliers anniversaire.",
    ville: "La Marsa",
    quartier: "La Marsa Centre",
    adresse: "Avenue Habib Bourguiba, La Marsa, 2070",
    phone: null,
    email: null,
    website: null,
    facebook: "PetitsChefsTunis",
    instagram: "petits_chefs_tn",
    lat: 36.8833,
    lng: 10.3217,
    plan: "free",
    category_slug: "ateliers",
    images: IMG.cuisine,
    hours: defaultHours(["Samedi", "Dimanche"], "10:00", "18:00"),
  },

  // ── SANTE ──────────────────────────────────────────────────────────────────
  {
    slug: "polyclinique-jasmins-menzah6",
    nom: "Polyclinique Les Jasmins",
    description:
      "Clinique privée de référence à El Menzah 6 avec service pédiatrie, néonatologie et urgences 24h/24. Consultation de pédiatrie générale, pneumologie pédiatrique, ORL et dermatologie enfants. Plateau technique complet.",
    ville: "El Menzah",
    quartier: "El Menzah 6",
    adresse: "Rue des Jasmins, El Menzah 6, 1004 Tunis",
    phone: "71 236 100",
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.8683,
    lng: 10.1817,
    plan: "premium",
    category_slug: "sante",
    images: IMG.sante,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "00:00", "23:59"),
  },
  {
    slug: "cabinet-pediatrie-manouba",
    nom: "Cabinet de Pédiatrie — Manouba",
    description:
      "Cabinet pédiatrique généraliste à Manouba. Consultations nourrissons et enfants, suivi de croissance, vaccinations, pathologies courantes. Médecin pédiatre conventionné CNAM. Rendez-vous téléphonique.",
    ville: "Manouba",
    quartier: "Manouba Centre",
    adresse: "Avenue Habib Bourguiba, Manouba, 2010",
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
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "08:30", "17:30"),
  },
  {
    slug: "centre-ortho-dento-facial-lac",
    nom: "Centre d'Orthodontie et Dentisterie — Lac",
    description:
      "Cabinet dentaire spécialisé enfants et orthodontie aux Berges du Lac. Consultation dès le premier dent de lait, détartrage pédiatrique, soins sans stress (sédation consciente disponible), pose d'appareils orthodontiques.",
    ville: "Tunis",
    quartier: "Les Berges du Lac",
    adresse: "Immeuble Lotus, Les Berges du Lac I, 1053 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.8367,
    lng: 10.2300,
    plan: "free",
    category_slug: "sante",
    images: [
      "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&q=80",
      "https://images.unsplash.com/photo-1588776814546-1ffbb91a4d08?w=800&q=80",
    ],
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "09:00", "18:00"),
  },
  {
    slug: "cabinet-ophtalmo-pediatrique-menzah",
    nom: "Cabinet d'Ophtalmologie Pédiatrique — Menzah",
    description:
      "Ophtalmologiste spécialisé dans la prise en charge des troubles visuels de l'enfant : dépistage de l'amblyopie, strabisme, correction optique. Bilan visuel dès 6 mois. Équipement adapté aux enfants non coopératifs.",
    ville: "El Menzah",
    quartier: "El Menzah 9",
    adresse: "Centre Commercial Ennahli, El Menzah 9, 1013 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.8700,
    lng: 10.1950,
    plan: "free",
    category_slug: "sante",
    images: IMG.sante,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "09:00", "17:00"),
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
    // Upsert listing
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
        actif: true,
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
          actif: true,
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

    // Upsert media
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

    // Upsert hours
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
