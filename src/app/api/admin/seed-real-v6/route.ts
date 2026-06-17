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
  sante: [
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
    "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80",
  ],
  psy: [
    "https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=800&q=80",
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80",
  ],
  sport: [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&q=80",
  ],
  football: [
    "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&q=80",
    "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&q=80",
  ],
  natation: [
    "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80",
    "https://images.unsplash.com/photo-1600965962361-9035dbfd1c50?w=800&q=80",
  ],
  ecole: [
    "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
  ],
  art: [
    "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80",
    "https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=800&q=80",
  ],
  fetes: [
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80",
  ],
  shopping: [
    "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&q=80",
    "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=800&q=80",
  ],
  cuisine: [
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
    "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&q=80",
  ],
  musique: [
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
    "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&q=80",
  ],
  parc: [
    "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&q=80",
    "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&q=80",
  ],
};

const REAL_LISTINGS: ListingData[] = [
  // ── SANTE ──────────────────────────────────────────────────────────────────
  {
    slug: "cabinet-neonatologie-tunis",
    nom: "Cabinet de Néonatologie et Pédiatrie Néonatale",
    description:
      "Pédiatre néonatologue pour le suivi des nouveau-nés et prématurés à Tunis. Bilan néonatal, dépistage auditif, suivi de la courbe de poids, vaccination. Disponible 6j/7 pour les urgences nouveau-né.",
    ville: "Tunis",
    quartier: "Mutuelleville",
    adresse: "Avenue de la Liberté, Mutuelleville, 1002 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.8267,
    lng: 10.1800,
    plan: "free",
    category_slug: "sante",
    images: IMG.sante,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "09:00", "17:00"),
  },
  {
    slug: "clinique-hannibal-la-marsa",
    nom: "Clinique Hannibal",
    description:
      "Clinique privée pluridisciplinaire de haut niveau à La Marsa. Service pédiatrie, maternité, urgences 24h/24. Plateau technique complet (IRM, scanner, bloc opératoire). Personnel médical francophone expérimenté.",
    ville: "La Marsa",
    quartier: "La Marsa",
    adresse: "Route de La Marsa, 2070 La Marsa",
    phone: "71 745 800",
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.8783,
    lng: 10.3250,
    plan: "premium",
    category_slug: "sante",
    images: IMG.sante,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "00:00", "23:59"),
  },
  {
    slug: "centre-ergo-pediatrie-tunis",
    nom: "Centre d'Ergothérapie Pédiatrique — Tunis",
    description:
      "Cabinet d'ergothérapie spécialisé enfants à Tunis. Prise en charge des troubles de l'intégration sensorielle, de la coordination motrice fine, troubles dys et difficultés d'autonomie. Bilan et rééducation sur prescription médicale.",
    ville: "Tunis",
    quartier: "Menzah 5",
    adresse: "El Menzah 5, Avenue du Lac, 1004 Tunis",
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
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"], "09:00", "18:00"),
  },

  // ── LOISIRS ────────────────────────────────────────────────────────────────
  {
    slug: "academie-football-ben-arous",
    nom: "Académie de Football des Jeunes — Ben Arous",
    description:
      "École de football pour enfants de 5 à 17 ans à Ben Arous. Entraîneurs diplômés UEFA, terrains synthétiques et naturels, tournois régionaux. Détection de talents et suivi individuel des progrès. Stages intensifs vacances.",
    ville: "Ben Arous",
    quartier: "Ben Arous",
    adresse: "Stade Municipal de Ben Arous, 2013 Ben Arous",
    phone: null,
    email: null,
    website: null,
    facebook: "AcademiefootBenArous",
    instagram: null,
    lat: 36.7533,
    lng: 10.2244,
    plan: "free",
    category_slug: "loisirs",
    images: IMG.football,
    hours: defaultHours(["Mercredi", "Samedi", "Dimanche"], "09:00", "18:00"),
  },
  {
    slug: "piscine-privee-carthage-kids",
    nom: "Aqua Kids Club — Carthage",
    description:
      "Club de natation privé à Carthage avec piscine chauffée couverte. Cours de natation bébé (dès 4 mois), initiation enfants, perfectionnement et compétition. Instructeurs brevetés d'État. Accès illimité pour les membres.",
    ville: "Carthage",
    quartier: "Carthage Dermèche",
    adresse: "Avenue de la Médina, Carthage Dermèche, 2016",
    phone: null,
    email: null,
    website: null,
    facebook: "AquaKidsClubCarthage",
    instagram: "aquakids_carthage",
    lat: 36.8583,
    lng: 10.3267,
    plan: "premium",
    category_slug: "loisirs",
    images: IMG.natation,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "07:00", "20:00"),
  },
  {
    slug: "minigolf-gammarth",
    nom: "Mini Golf de Gammarth",
    description:
      "Parcours de mini-golf 18 trous en plein air à Gammarth face à la mer. Idéal pour les sorties familiales, anniversaires et groupes scolaires. Location de matériel incluse. Buvette sur place. Ouvert toute l'année.",
    ville: "Gammarth",
    quartier: "Gammarth",
    adresse: "Route Touristique de Gammarth, 2078 Gammarth",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.9150,
    lng: 10.2883,
    plan: "free",
    category_slug: "loisirs",
    images: IMG.parc,
    hours: defaultHours(["Samedi", "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"], "09:00", "19:00"),
  },
  {
    slug: "accrobranche-bardo",
    nom: "Accro'Kids — Parcours Accrobranche",
    description:
      "Parcours accrobranche et tyrolienne pour enfants et familles dans un cadre boisé près du Bardo. Plusieurs niveaux de difficulté pour les 3-12 ans et les ados. Harnais et équipement de sécurité fournis. Animation de groupes.",
    ville: "Bardo",
    quartier: "Le Bardo",
    adresse: "Parc du Bardo, Avenue du 20 Mars, 2000 Le Bardo",
    phone: null,
    email: null,
    website: null,
    facebook: "AccroKidsTunis",
    instagram: null,
    lat: 36.8092,
    lng: 10.1361,
    plan: "free",
    category_slug: "loisirs",
    images: [
      "https://images.unsplash.com/photo-1504280317859-a3b05c0f2f51?w=800&q=80",
      "https://images.unsplash.com/photo-1465379944081-7f47de8d74ac?w=800&q=80",
    ],
    hours: defaultHours(["Samedi", "Dimanche"], "09:00", "18:00"),
  },
  {
    slug: "centre-equestre-mornag",
    nom: "Centre Équestre de Mornag",
    description:
      "Centre équestre en pleine nature à Mornag. Cours d'équitation pour enfants à partir de 4 ans (poneys), balade en famille, stages équestres pendant les vacances. Boutique équitation sur place.",
    ville: "Mornag",
    quartier: "Mornag",
    adresse: "Route de Mornag, 2060 Ben Arous",
    phone: null,
    email: null,
    website: null,
    facebook: "CentreEquestreMornag",
    instagram: null,
    lat: 36.7167,
    lng: 10.2833,
    plan: "free",
    category_slug: "loisirs",
    images: [
      "https://images.unsplash.com/photo-1553284965-5dd51e817e8d?w=800&q=80",
      "https://images.unsplash.com/photo-1598974357801-cbca100e65d3?w=800&q=80",
    ],
    hours: defaultHours(["Samedi", "Dimanche", "Mercredi"], "08:00", "18:00"),
  },

  // ── ATELIERS ───────────────────────────────────────────────────────────────
  {
    slug: "atelier-photo-kids-menzah",
    nom: "Atelier Photo Créative Enfants — El Menzah",
    description:
      "Atelier de photographie artistique pour enfants de 8 à 16 ans à El Menzah. Initiation à la prise de vue, composition, retouche photo et storytelling visuel. Exposition des œuvres en fin de cycle. Appareils fournis.",
    ville: "El Menzah",
    quartier: "El Menzah 7",
    adresse: "El Menzah 7, Rue des Arts, 1004 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: "photokids_menzah",
    lat: 36.8650,
    lng: 10.1867,
    plan: "free",
    category_slug: "ateliers",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
      "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=800&q=80",
    ],
    hours: defaultHours(["Mercredi", "Samedi"], "10:00", "18:00"),
  },
  {
    slug: "cours-calligraphie-arabe-tunis",
    nom: "Atelier de Calligraphie Arabe — Tunis",
    description:
      "Cours de calligraphie arabe traditionnelle pour enfants et adultes à Tunis. Styles Naskh, Thuluth et Diwani enseignés par un maître calligraphe. Matériel calame et encre fourni. Cadeau idéal, oeuvre personnalisée possible.",
    ville: "Tunis",
    quartier: "Médina",
    adresse: "Souk des Libraires, Médina de Tunis, 1008 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: "CalligraphieTunis",
    instagram: "calligraphie_arabe_tn",
    lat: 36.7983,
    lng: 10.1708,
    plan: "free",
    category_slug: "ateliers",
    images: IMG.art,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "09:00", "17:00"),
  },
  {
    slug: "atelier-origami-papier-lac",
    nom: "Atelier Origami & Paper Art — Lac",
    description:
      "Atelier créatif au Lac I proposant des cours d'origami, papier mâché et découpage artistique pour enfants de 5 à 14 ans. Ateliers du mercredi et du week-end, stages thématiques vacances. Toutes fournitures incluses.",
    ville: "Tunis",
    quartier: "Les Berges du Lac",
    adresse: "Les Berges du Lac I, Rue du Lac Malaren, 1053 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: "OrigamiKidsTunis",
    instagram: null,
    lat: 36.8367,
    lng: 10.2300,
    plan: "free",
    category_slug: "ateliers",
    images: IMG.art,
    hours: defaultHours(["Mercredi", "Samedi", "Dimanche"], "10:00", "17:00"),
  },
  {
    slug: "eveil-musical-bebe-ariana",
    nom: "Éveil Musical Bébé — Ariana",
    description:
      "Ateliers d'éveil musical pour bébés de 0 à 3 ans en présence d'un parent à Ariana. Chansons, percussions douces, instruments sonores et comptines. Développement sensoriel, langage et lien parent-enfant renforcé.",
    ville: "Ariana",
    quartier: "Ariana Ville",
    adresse: "Maison des Associations, Ariana, 2080",
    phone: null,
    email: null,
    website: null,
    facebook: "EveilMusicalAriana",
    instagram: "eveil_musical_tn",
    lat: 36.8617,
    lng: 10.1958,
    plan: "free",
    category_slug: "ateliers",
    images: IMG.musique,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "09:00", "13:00"),
  },

  // ── FETES ──────────────────────────────────────────────────────────────────
  {
    slug: "magicien-tunis-spectacles-enfants",
    nom: "Magie Show — Magicien pour Enfants",
    description:
      "Magicien professionnel intervenant pour des spectacles de magie lors d'anniversaires, fêtes d'école et événements enfants dans tout le Grand Tunis. Spectacle interactif de 45 à 90 minutes, effets visuels bluffants.",
    ville: "Tunis",
    quartier: "El Menzah",
    adresse: "El Menzah, Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: "MagieShowTunis",
    instagram: "magie_show_tn",
    lat: 36.8650,
    lng: 10.1867,
    plan: "free",
    category_slug: "fetes",
    images: [
      "https://images.unsplash.com/photo-1576267423048-15c0040fec78?w=800&q=80",
      "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=800&q=80",
    ],
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "10:00", "22:00"),
  },
  {
    slug: "salle-fetes-eden-manouba",
    nom: "Salle des Fêtes Eden — Manouba",
    description:
      "Salle des fêtes climatisée à Manouba pouvant accueillir 100 à 400 personnes. Formules anniversaire enfants clés en main : salle décorée, sono, vidéoprojecteur et buffet. Parking extérieur gratuit et grande capacité.",
    ville: "Manouba",
    quartier: "Manouba",
    adresse: "Avenue Habib Thameur, Manouba, 2010",
    phone: null,
    email: null,
    website: null,
    facebook: "SalleFetesEdenManouba",
    instagram: null,
    lat: 36.8083,
    lng: 10.0992,
    plan: "free",
    category_slug: "fetes",
    images: IMG.fetes,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "09:00", "23:59"),
  },
  {
    slug: "traiteur-kids-party-tunis",
    nom: "Yummy Kids — Traiteur Anniversaires",
    description:
      "Service de traiteur spécialisé en buffets et candy bars pour anniversaires enfants. Sandwichs colorés, cupcakes, macarons, fontaine à chocolat, bonbons en vrac. Livraison dans tout le Grand Tunis. Devis gratuit.",
    ville: "Tunis",
    quartier: "Ennasr",
    adresse: "Ennasr II, Ariana, 2037",
    phone: null,
    email: null,
    website: null,
    facebook: "YummyKidsTunis",
    instagram: "yummykids_tn",
    lat: 36.8800,
    lng: 10.2033,
    plan: "free",
    category_slug: "fetes",
    images: [
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80",
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80",
    ],
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], "09:00", "20:00"),
  },

  // ── SHOPPING ───────────────────────────────────────────────────────────────
  {
    slug: "boutique-uniforme-scolaire-tunis",
    nom: "Uniforme & Co — Fournitures Scolaires",
    description:
      "Boutique spécialisée en uniformes scolaires, fournitures et cartables à Tunis. Tenues pour toutes les écoles du Grand Tunis, broderie personnalisée du prénom. Grande braderie en août-septembre avant la rentrée.",
    ville: "Tunis",
    quartier: "Bab El Bahr",
    adresse: "Avenue Habib Bourguiba, Tunis, 1000",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.7983,
    lng: 10.1800,
    plan: "free",
    category_slug: "shopping",
    images: IMG.shopping,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "09:00", "19:00"),
  },
  {
    slug: "puericulteur-bebe-shop-menzah",
    nom: "Bébé Shop — Puériculture & Accessoires",
    description:
      "Magasin de puériculture à El Menzah spécialisé en poussettes, sièges auto, lits bébé, transats et accessoires de maternité. Grandes marques : Chicco, Cybex, Maxi-Cosi, Stokke. Service de montage et livraison.",
    ville: "El Menzah",
    quartier: "El Menzah 8",
    adresse: "Avenue des Fleurs, El Menzah 8, 1004 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: "BebeShopMenzah",
    instagram: "bebeshop_tn",
    lat: 36.8667,
    lng: 10.1850,
    plan: "free",
    category_slug: "shopping",
    images: [
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80",
      "https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=800&q=80",
    ],
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "09:00", "19:00"),
  },

  // ── EDUCATION ──────────────────────────────────────────────────────────────
  {
    slug: "ecole-primaire-privee-ennasr",
    nom: "École Primaire Privée Al Khwarizmi",
    description:
      "École primaire privée à Ennasr proposant un enseignement de qualité de la 1ère à la 6ème année. Programme national tunisien enrichi avec l'anglais dès la 1ère année, informatique et activités parascolaires (dessin, sport, club lecture).",
    ville: "Ariana",
    quartier: "Ennasr",
    adresse: "Rue de l'Environnement, Ennasr I, 2037 Ariana",
    phone: null,
    email: null,
    website: null,
    facebook: "EcoleAlKhwarizmiEnnasr",
    instagram: null,
    lat: 36.8783,
    lng: 10.2017,
    plan: "free",
    category_slug: "education",
    images: IMG.ecole,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"], "07:30", "17:00"),
  },
  {
    slug: "garderie-matin-soir-menzah",
    nom: "Garderie Périscolaire Les Étoiles",
    description:
      "Service de garderie périscolaire matin (7h-8h) et soir (16h30-19h) pour enfants du primaire à El Menzah. Goûter, aide aux devoirs, activités ludiques. Transport scolaire organisé. Inscription mensuelle ou à la semaine.",
    ville: "El Menzah",
    quartier: "El Menzah 6",
    adresse: "El Menzah 6, 1004 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: "GarderieEtoilesMenzah",
    instagram: null,
    lat: 36.8683,
    lng: 10.1817,
    plan: "free",
    category_slug: "education",
    images: IMG.ecole,
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"], "07:00", "19:00"),
  },
  {
    slug: "auto-ecole-ados-tunis",
    nom: "Conduite Future — Préparation Code & Permis Jeunes",
    description:
      "Auto-école spécialisée jeunes conducteurs à Tunis. Préparation au code de la route dès 15 ans (conduite accompagnée), cours théoriques interactifs, simulateur de conduite. Taux de réussite 92%. Formules adaptées étudiants.",
    ville: "Tunis",
    quartier: "Lafayette",
    adresse: "Avenue de Paris, Lafayette, 1002 Tunis",
    phone: null,
    email: null,
    website: null,
    facebook: null,
    instagram: null,
    lat: 36.8200,
    lng: 10.1750,
    plan: "free",
    category_slug: "education",
    images: [
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80",
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
    ],
    hours: defaultHours(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], "09:00", "18:00"),
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
