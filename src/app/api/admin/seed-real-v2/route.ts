import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── TYPES ──────────────────────────────────────────────────────────────────
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
  openDays = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"],
  open = "09:00",
  close = "18:00"
) =>
  DAYS.map((jour) => ({
    jour,
    ouvert: openDays.includes(jour),
    heure_ouverture: open,
    heure_fermeture: close,
  }));

// ─── IMAGES PAR CATÉGORIE ───────────────────────────────────────────────────
const IMG = {
  pediatre: [
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
    "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80",
  ],
  dentiste: [
    "https://images.unsplash.com/photo-1588776814546-1ffbb3527eff?w=800&q=80",
    "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&q=80",
  ],
  orl: [
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
  ],
  ophtalmo: [
    "https://images.unsplash.com/photo-1516069677018-378971e2d685?w=800&q=80",
  ],
  orthophoniste: [
    "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&q=80",
    "https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=800&q=80",
  ],
  kine: [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80",
  ],
  psychologue: [
    "https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=800&q=80",
  ],
  ecole: [
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80",
  ],
  creche: [
    "https://images.unsplash.com/photo-1567443024551-f3e3cc2be870?w=800&q=80",
    "https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=800&q=80",
  ],
  langue: [
    "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
  ],
  piscine: [
    "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80",
    "https://images.unsplash.com/photo-1560090995-01632a28895b?w=800&q=80",
  ],
  parcjeux: [
    "https://images.unsplash.com/photo-1503676382389-4809596d5290?w=800&q=80",
    "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&q=80",
  ],
  sport: [
    "https://images.unsplash.com/photo-1547899934-b9a3d9ddc2c8?w=800&q=80",
    "https://images.unsplash.com/photo-1510525009512-ad7fc13ecc58?w=800&q=80",
  ],
  danse: [
    "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=800&q=80",
    "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&q=80",
  ],
  musique: [
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
    "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?w=800&q=80",
  ],
  artsmartiaux: [
    "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&q=80",
    "https://images.unsplash.com/photo-1564419320461-6870880221ad?w=800&q=80",
  ],
  tennis: [
    "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80",
    "https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=800&q=80",
  ],
  sciences: [
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    "https://images.unsplash.com/photo-1564325724739-bae0bd08762c?w=800&q=80",
  ],
  fete: [
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
  ],
  animation: [
    "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&q=80",
    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80",
  ],
  jouets: [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    "https://images.unsplash.com/photo-1516981879613-9f5da904015f?w=800&q=80",
  ],
  vetements: [
    "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800&q=80",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80",
  ],
};

// ─── BATCH 2 — LISTINGS RÉELS GRAND TUNIS ──────────────────────────────────
// Tous les numéros de téléphone vérifiés via web (med.tn, allo-docteur, annuaire-publicitaire,
// dziri-fi-tounes, ecoleprimaire.tn, sites officiels)
// phone: null → professionnel réel trouvé en ligne, numéro non disponible publiquement
const REAL_LISTINGS: ListingData[] = [

  // ══════════════════════════════════════════════════
  //  SANTÉ — Pédiatres
  // ══════════════════════════════════════════════════
  {
    slug: "dr-hamouda-mestiri-pediatre",
    nom: "Dr Hamouda Mestiri — Pédiatre",
    description: "Pédiatre à La Marsa. Consultations pour nourrissons et enfants. Suivi du développement, vaccinations, maladies infantiles. Sur rendez-vous.",
    ville: "Tunis", quartier: "La Marsa", adresse: "16 Avenue Taieb M'hiri, La Marsa",
    phone: "71743450", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8780, lng: 10.3247, plan: "free", category_slug: "sante",
    images: IMG.pediatre,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "17:30"),
  },
  {
    slug: "dr-khaled-kabbous-pediatre-ariana",
    nom: "Dr Khaled Kabbous — Pédiatre-Allergologue",
    description: "Pédiatre-allergologue diplômé de la Faculté de Médecine de Paris. Spécialisé en allergologie pédiatrique, asthme et dermatite atopique. Cabinet La Perle de l'Ariana.",
    ville: "Ariana", quartier: "Ariana Centre", adresse: "11 Avenue Taieb Mehiri, La Perle de l'Ariana, 1er étage, Cabinet N°3",
    phone: "71711717", email: "kabbouskhaled@yahoo.fr", website: null, facebook: null, instagram: null,
    lat: 36.8686, lng: 10.1937, plan: "premium", category_slug: "sante",
    images: IMG.pediatre,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "18:00"),
  },
  {
    slug: "dr-chawki-gharbi-pediatre-el-mourouj",
    nom: "Dr Mohamed Chawki Gharbi — Pédiatre",
    description: "Spécialiste en pédiatrie et néonatologie. Consultation générale, suivi du nouveau-né, maladies infectieuses, nutrition infantile. Centre Médical Al Ahmadi, El Mourouj 4.",
    ville: "Ben Arous", quartier: "El Mourouj 4", adresse: "Centre Médical Al Ahmadi, El Mourouj 4, Ben Arous",
    phone: "92516311", email: "gharbimedchawki@outlook.com", website: null, facebook: null, instagram: null,
    lat: 36.7726, lng: 10.2133, plan: "free", category_slug: "sante",
    images: IMG.pediatre,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "18:00"),
  },
  {
    slug: "dr-raboudi-nejib-pediatre-ennasr",
    nom: "Dr Raboudi Nejib — Pédiatre",
    description: "Pédiatre à Cité Ennasr, Ariana. Suivi pédiatrique de la naissance à l'adolescence. Consultations courantes et urgences pédiatriques en semaine.",
    ville: "Ariana", quartier: "Cité Ennasr", adresse: "Avenue de l'Ère Nouvelle, Cité Ennasr, Ariana",
    phone: "70852917", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8819, lng: 10.1930, plan: "free", category_slug: "sante",
    images: IMG.pediatre,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "17:00"),
  },
  {
    slug: "dr-sofiane-meherzi-pediatre-la-marsa",
    nom: "Dr Mohamed Sofiane Meherzi — Pédiatre",
    description: "Pédiatre à La Marsa (Marsa Saf Saf). Résidence Ennakhil. Spécialiste en santé de l'enfant, suivi de croissance, vaccinations et maladies infantiles. Sur rendez-vous.",
    ville: "Tunis", quartier: "La Marsa", adresse: "Résidence Ennakhil 2, Bloc B – App. 2, Rue du Koweit, La Marsa 2078",
    phone: "52839391", email: "meherzi.sofiane@gmail.com", website: null, facebook: null, instagram: null,
    lat: 36.8774, lng: 10.3255, plan: "free", category_slug: "sante",
    images: IMG.pediatre,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "18:00"),
  },
  {
    slug: "dr-abdellatif-ben-jeddou-pediatre",
    nom: "Dr Abdellatif Ben Jeddou — Pédiatre",
    description: "Pédiatre au Complexe Somai, El Mourouj 3. Spécialiste reconnu en pédiatrie générale. Consultations matin et après-midi du lundi au samedi. Accueil chaleureux pour les familles.",
    ville: "Ben Arous", quartier: "El Mourouj 3", adresse: "Complexe Somai, Avenue des Martyrs, 2ème étage, El Mourouj 3, Ben Arous",
    phone: "71473020", email: "benjeddouavdellatif@yahoo.fr", website: null, facebook: null, instagram: null,
    lat: 36.7738, lng: 10.2145, plan: "free", category_slug: "sante",
    images: IMG.pediatre,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "14:00"),
  },
  {
    slug: "dr-hamdi-guedhami-pediatre-ben-arous",
    nom: "Dr Hamdi Guedhami — Pédiatre",
    description: "Pédiatre-néonatologue à Ben Arous. Consultation générale et urgences pour nourrissons et enfants de 0 à 16 ans. Cabinet bien équipé, accueil familial.",
    ville: "Ben Arous", quartier: "Ben Arous Centre", adresse: "12 Rue Mongi Slim, Ben Arous",
    phone: "71383259", email: "hamdi@guedhami.com", website: null, facebook: null, instagram: null,
    lat: 36.7547, lng: 10.2280, plan: "free", category_slug: "sante",
    images: IMG.pediatre,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "18:00"),
  },

  // ══════════════════════════════════════════════════
  //  SANTÉ — Dentiste pédiatrique
  // ══════════════════════════════════════════════════
  {
    slug: "dr-sonia-laourine-dentiste-la-marsa",
    nom: "Dr Sonia Laourine Ben Rejeb — Dentiste Pédiatrique",
    description: "Spécialiste en dentisterie pédiatrique à La Marsa. Soins dentaires doux pour enfants et adolescents. Prévention, fluoration, orthodontie précoce. Cabinet Fethi Zouhir.",
    ville: "Tunis", quartier: "La Marsa", adresse: "Centre Médical Fethi Zouhir, 19 Avenue de la République, La Marsa 2078",
    phone: "71745353", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8795, lng: 10.3236, plan: "free", category_slug: "sante",
    images: IMG.dentiste,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "18:00"),
  },

  // ══════════════════════════════════════════════════
  //  SANTÉ — ORL / Ophtalmologie
  // ══════════════════════════════════════════════════
  {
    slug: "dr-slim-kallala-ophtalmologue-la-marsa",
    nom: "Dr Slim Kallala — Ophtalmologue",
    description: "Ophtalmologue à La Marsa. Bilan visuel complet pour enfants, dépistage précoce des troubles de la vue, correction optique. Consultations sur rendez-vous.",
    ville: "Tunis", quartier: "La Marsa", adresse: "5 Rue Naceur Bey, La Marsa",
    phone: "71749809", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8791, lng: 10.3229, plan: "free", category_slug: "sante",
    images: IMG.ophtalmo,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "17:30"),
  },
  {
    slug: "dr-zied-zayani-orl-la-marsa",
    nom: "Dr Zied Zayani — ORL",
    description: "Oto-Rhino-Laryngologiste à La Marsa. Spécialiste des troubles de l'oreille, du nez et de la gorge chez l'enfant. Audiométrie, adénoïdes, amygdales. Sur rendez-vous.",
    ville: "Tunis", quartier: "La Marsa", adresse: "9 bis Avenue Ali Belahouane, La Marsa",
    phone: "71980122", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8779, lng: 10.3241, plan: "free", category_slug: "sante",
    images: IMG.orl,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "18:00"),
  },

  // ══════════════════════════════════════════════════
  //  SANTÉ — Orthophonie / Kinésithérapie / Psychologie
  // ══════════════════════════════════════════════════
  {
    slug: "souhaila-karboul-orthophoniste-mourouj",
    nom: "Souhaila Karboul Baccouche — Orthophoniste",
    description: "Orthophoniste à El Mourouj, Ben Arous. Bilan et rééducation des troubles du langage, de la parole, de la déglutition et des apprentissages chez l'enfant. Prise en charge personnalisée.",
    ville: "Ben Arous", quartier: "El Mourouj", adresse: "Immeuble Jinene El Mourouj, Bloc C, Appartement C – 5ème étage, Ben Arous",
    phone: "31107230", email: null, website: null, facebook: null, instagram: null,
    lat: 36.7722, lng: 10.2148, plan: "free", category_slug: "sante",
    images: IMG.orthophoniste,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "18:00"),
  },
  {
    slug: "hela-taboubi-orthophoniste-mourouj",
    nom: "Hela Taboubi — Orthophoniste",
    description: "Orthophoniste à El Mourouj. Spécialisée dans le traitement de l'autisme, du bégaiement, du retard de langage, des difficultés d'apprentissage et des troubles de la communication.",
    ville: "Ben Arous", quartier: "El Mourouj", adresse: "Centre Jamel, Avenue Habib Thameur, El Mourouj, Ben Arous",
    phone: "22495071", email: null, website: null, facebook: null, instagram: null,
    lat: 36.7735, lng: 10.2141, plan: "free", category_slug: "sante",
    images: IMG.orthophoniste,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "18:00"),
  },
  {
    slug: "ibtihel-ayari-kinesitherapie-ariana",
    nom: "Ibtihel Ayari — Kinésithérapie & Rééducation",
    description: "Cabinet de kinésithérapie et rééducation fonctionnelle à Borj Louzir, Ariana. Rééducation pédiatrique, paralysie cérébrale, troubles moteurs de l'enfant. Prise en charge pluridisciplinaire.",
    ville: "Ariana", quartier: "Borj Louzir", adresse: "Centre Chifee 2, Avenue Mustapha Mohsen, Borj Louzir, Ariana",
    phone: "54021711", email: "cabinet.ayariibtihel@gmail.com", website: null, facebook: null, instagram: null,
    lat: 36.8544, lng: 10.1805, plan: "free", category_slug: "sante",
    images: IMG.kine,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "08:30", "18:00"),
  },
  {
    slug: "centre-hanene-kinesitherapie-raoued",
    nom: "Centre Hanene de Kinésithérapie",
    description: "Centre de kinésithérapie et rééducation à Raoued, Ariana. Spécialisé dans les soins du nourrisson, rééducation pédiatrique, torticolis, retards moteurs. Physiothérapeute certifiée.",
    ville: "Ariana", quartier: "Raoued", adresse: "4 Rue Ben Hani, Route de Raoued Km 7, Jaafar 2, Ariana",
    phone: "24187848", email: null, website: null, facebook: null, instagram: null,
    lat: 36.9025, lng: 10.1441, plan: "free", category_slug: "sante",
    images: IMG.kine,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "08:00", "18:00"),
  },
  {
    slug: "raja-cabinet-psychologie-ennasr",
    nom: "Raja Cabinet de Psychologie Clinique",
    description: "Cabinet de psychologie clinique à Cité Ennasr, Ariana. Évaluation psychologique de l'enfant, accompagnement des difficultés scolaires, anxiété, troubles du comportement et TDA/H.",
    ville: "Ariana", quartier: "Cité Ennasr", adresse: "Résidence la Coupole, Avenue Hédi Nouira, Cité Ennasr 2, Ariana",
    phone: "98666704", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8823, lng: 10.1914, plan: "free", category_slug: "sante",
    images: IMG.psychologue,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "18:00"),
  },
  {
    slug: "cabinet-neuropediatrie-centre-urbain",
    nom: "Cabinet de Neuropédiatrie — Centre Urbain Nord",
    description: "Cabinet privé de neuropédiatrie au Centre Urbain Nord, Tunis. Explorations neurophysiologiques, epilepsie, troubles du développement, retard psychomoteur. Prise en charge spécialisée enfants.",
    ville: "Tunis", quartier: "Centre Urbain Nord", adresse: "Cabinet A0-5, Rez-de-Chaussée, Cléopâtre Center, Centre Urbain Nord, Tunis 1003",
    phone: "70033065", email: "nediaachour@yahoo.fr", website: null, facebook: null, instagram: null,
    lat: 36.8372, lng: 10.1952, plan: "premium", category_slug: "sante",
    images: IMG.psychologue,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "08:30", "17:00"),
  },

  // ══════════════════════════════════════════════════
  //  ÉDUCATION — Écoles primaires
  // ══════════════════════════════════════════════════
  {
    slug: "carthage-academy-la-soukra",
    nom: "Carthage Academy — École Primaire Privée",
    description: "École primaire privée à La Soukra, Ariana. Accueil des élèves de la préparatoire à la 6ème année. Programme renforcé en langue française et sciences. Inscriptions ouvertes.",
    ville: "Ariana", quartier: "La Soukra", adresse: "41 Rue Ibn Sana El Molk, La Soukra, Ariana 2036",
    phone: "21600111", email: "carthage.academy.lasoukra@gmail.com", website: null, facebook: "carthageacademy2017", instagram: null,
    lat: 36.8651, lng: 10.1540, plan: "free", category_slug: "education",
    images: IMG.ecole,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "07:30", "16:30"),
  },
  {
    slug: "le-petit-robert-la-soukra",
    nom: "Le Petit Robert — École Privée",
    description: "École préparatoire, primaire et collège privé à La Soukra. Programme bilingue franco-arabe, activités parascolaires, encadrement de qualité. Inscriptions ouvertes toute l'année.",
    ville: "Ariana", quartier: "La Soukra", adresse: "Borj Louzir, La Soukra, Ariana 2073",
    phone: "54555666", email: "ecolepetitrobert@gmail.com", website: null, facebook: null, instagram: null,
    lat: 36.8579, lng: 10.1593, plan: "free", category_slug: "education",
    images: IMG.ecole,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "07:30", "17:00"),
  },
  {
    slug: "ecole-el-ferdaous-el-mourouj",
    nom: "École Privée El Ferdaous — El Mourouj",
    description: "École primaire privée à El Mourouj, Ben Arous. Pédagogie moderne, effectifs limités, suivi personnalisé. Niveaux préparatoire à 6ème. Activités sportives et culturelles.",
    ville: "Ben Arous", quartier: "El Mourouj", adresse: "Avenue Africia, El Mourouj, Ben Arous 2074",
    phone: "94405546", email: null, website: null, facebook: null, instagram: null,
    lat: 36.7730, lng: 10.2161, plan: "free", category_slug: "education",
    images: IMG.ecole,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "07:30", "16:30"),
  },
  {
    slug: "le-pre-vert-megrine",
    nom: "École Privée Le Pré-Vert — Mégrine",
    description: "École primaire privée à Mégrine Coteaux, Ben Arous. Encadrement de qualité, classes à effectifs réduits. Activités artistiques et sportives incluses. De la maternelle à la 6ème.",
    ville: "Ben Arous", quartier: "Mégrine", adresse: "93 Avenue de la République, Mégrine, Ben Arous",
    phone: "52663737", email: null, website: null, facebook: null, instagram: null,
    lat: 36.7789, lng: 10.2354, plan: "free", category_slug: "education",
    images: IMG.ecole,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "07:30", "16:30"),
  },

  // ══════════════════════════════════════════════════
  //  ÉDUCATION — Crèches & Jardins d'enfants
  // ══════════════════════════════════════════════════
  {
    slug: "happy-child-ennasr-jardin",
    nom: "Happy Child Ennasr — Jardin d'Enfants",
    description: "Jardin d'enfants à Ennasr 2, Ariana. Accueil des enfants de 2 à 6 ans. Programme d'éveil bilingue, activités artistiques et motrices. Personnel diplômé en petite enfance.",
    ville: "Ariana", quartier: "Ennasr 2", adresse: "19 Rue Ezzedine El Hammi, Ennasr 2, Ariana",
    phone: "28246328", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8853, lng: 10.1867, plan: "free", category_slug: "education",
    images: IMG.creche,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "07:00", "17:30"),
  },
  {
    slug: "dream-kids-ennasr-creche",
    nom: "Dream Kids — Crèche & Jardin d'Enfants",
    description: "Crèche et jardin d'enfants à Ennasr 2, Ariana. Accueil dès 3 mois. Éveil sensoriel pour bébés, activités éducatives pour les plus grands. Espace verdoyant et sécurisé.",
    ville: "Ariana", quartier: "Ennasr 2", adresse: "Cité Ennasr 2, Ariana",
    phone: "58128618", email: null, website: null, facebook: "CrecheJardindenfants", instagram: null,
    lat: 36.8848, lng: 10.1878, plan: "free", category_slug: "education",
    images: IMG.creche,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "07:00", "18:00"),
  },
  {
    slug: "jardin-smiley-ennasr-2",
    nom: "Jardin d'Enfants Smiley — Ennasr 2",
    description: "Jardin d'enfants à Ennasr 2, Ariana. Encadrement bienveillant pour enfants de 2 à 6 ans. Activités d'éveil, musique, peinture, sport. Préparation à l'entrée en école primaire.",
    ville: "Ariana", quartier: "Ennasr 2", adresse: "23 Rue Bir Radhouen, Ennasr 2, Ariana",
    phone: null, email: null, website: null, facebook: null, instagram: null,
    lat: 36.8857, lng: 10.1860, plan: "free", category_slug: "education",
    images: IMG.creche,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "07:00", "17:00"),
  },

  // ══════════════════════════════════════════════════
  //  ÉDUCATION — Langues
  // ══════════════════════════════════════════════════
  {
    slug: "alliance-francaise-tunis-menzah-6",
    nom: "Alliance Française Tunis",
    description: "Centre culturel et linguistique de référence à Menzah 6, Ariana. Cours de français pour enfants, adolescents et adultes. Certifications DELF, DALF, TCF. Ateliers culturels et parascolaires.",
    ville: "Ariana", quartier: "Menzah 6", adresse: "29 Rue Ali Ibn Abi Taleb, El Menzah 6, Ariana 2091",
    phone: "71234466", email: "contact@alliancefr.tn", website: "https://www.alliancefr.tn", facebook: "AllianceFrancaiseTunis", instagram: "alliancefrancaisetunis",
    lat: 36.8586, lng: 10.1948, plan: "premium", category_slug: "education",
    images: IMG.langue,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "08:30", "18:30"),
  },
  {
    slug: "inlingua-tunis-berges-du-lac",
    nom: "Inlingua Tunis — École de Langues",
    description: "École internationale de langues aux Berges du Lac 1. Cours d'anglais, français, espagnol, allemand et arabe pour enfants et adolescents. Méthode inlingua reconnue dans 40 pays.",
    ville: "Tunis", quartier: "Berges du Lac 1", adresse: "02 Rue du Lac Lochness, Berges du Lac 1, Tunis 1053",
    phone: "29053700", email: "info.tunis@inlingua-schools.tn", website: "https://www.inlingua-schools.tn", facebook: null, instagram: null,
    lat: 36.8469, lng: 10.2299, plan: "premium", category_slug: "education",
    images: IMG.langue,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "08:30", "18:30"),
  },

  // ══════════════════════════════════════════════════
  //  LOISIRS
  // ══════════════════════════════════════════════════
  {
    slug: "twin-park-manar-city",
    nom: "Twin Park Manar City",
    description: "Parc de loisirs indoor au cœur de Manar City. Play Zone, trampolines, jeux vidéo, jeux de challenge et espace café pour les parents. Ouvert 7j/7 de 10h à 22h.",
    ville: "Tunis", quartier: "El Manar", adresse: "Centre Commercial Manar City, Avenue Abdelaziz Saoud, El Manar, Tunis",
    phone: "36365454", email: "contact@entourage-group.com", website: "https://twin-park.tn", facebook: "TwinPark.ManarCity", instagram: "twinpark.manarcity",
    lat: 36.8396, lng: 10.1669, plan: "premium", category_slug: "loisirs",
    images: [
      "https://images.unsplash.com/photo-1503676382389-4809596d5290?w=800&q=80",
      "https://images.unsplash.com/photo-1567016523207-6b57bbd5da54?w=800&q=80",
    ],
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"], "10:00", "22:00"),
  },
  {
    slug: "ice-park-parc-essaada-la-marsa",
    nom: "Ice Park — Parc Essaada La Marsa",
    description: "Patinoire sur glace et espace de loisirs au Parc Essaada de La Marsa. Patinage enfants et adultes, leçons de patinage, sessions libres. Ambiance festive toute l'année.",
    ville: "Tunis", quartier: "La Marsa", adresse: "Parc Essaada, Ksar Essaada, La Marsa 2078",
    phone: "71740447", email: null, website: null, facebook: "iceparkmarsa", instagram: null,
    lat: 36.8833, lng: 10.3208, plan: "free", category_slug: "loisirs",
    images: [
      "https://images.unsplash.com/photo-1515131493071-e2290e41bb61?w=800&q=80",
      "https://images.unsplash.com/photo-1519766020890-24c7c1a83d6b?w=800&q=80",
    ],
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"], "16:00", "23:00"),
  },
  {
    slug: "lili-land-la-marsa",
    nom: "Lili Land — Parc de Jeux La Marsa",
    description: "Parc de jeux et d'aventure pour enfants au Parc Essaada, La Marsa. Parcours d'escalade, toboggan géant, piscine à balles, trampolines géants et château gonflable. Idéal pour 1-12 ans.",
    ville: "Tunis", quartier: "La Marsa", adresse: "Parc Essaada, La Marsa 2078",
    phone: "28476240", email: null, website: null, facebook: "lili.land.park", instagram: null,
    lat: 36.8836, lng: 10.3211, plan: "free", category_slug: "loisirs",
    images: IMG.parcjeux,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"], "10:00", "22:00"),
  },
  {
    slug: "sciencia-menzah-6",
    nom: "Sciencia — Centre de Loisirs Scientifiques",
    description: "Réseau de centres de loisirs scientifiques pour enfants de 6 à 16 ans, Menzah 6, Ariana. Ateliers robotique, aéronautique, électronique, chimie et physique. Stages vacances scolaires.",
    ville: "Ariana", quartier: "Menzah 6", adresse: "14 Rue Ahmed Tlili, Menzah 6, Ariana",
    phone: "71776867", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8583, lng: 10.1954, plan: "free", category_slug: "loisirs",
    images: IMG.sciences,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "18:00"),
  },
  {
    slug: "le-club-de-gammarth",
    nom: "Le Club de Gammarth",
    description: "Complexe sportif et de loisirs de 6 000 m² face à la mer à Cap Gammarth. Piscines, tennis, football, aquaclub enfants, kids fight (arts martiaux), kids club, restaurant. Ambiance familiale.",
    ville: "Tunis", quartier: "Gammarth", adresse: "Zone touristique Cap Gammarth, Lot A9, La Marsa 2070",
    phone: "71912212", email: "clubgammarth@gmail.com", website: "https://www.leclub.tn", facebook: "leclubdegammarth", instagram: "leclubdegammarth",
    lat: 36.9180, lng: 10.2868, plan: "premium", category_slug: "loisirs",
    images: [
      "https://images.unsplash.com/photo-1575505586569-646b2ca898fc?w=800&q=80",
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80",
    ],
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"], "07:00", "22:00"),
  },
  {
    slug: "club-passion-natation-la-marsa",
    nom: "Club Passion Natation",
    description: "Club de natation pour enfants et adultes à La Marsa et Menzah. Cours de natation par niveaux, bébés nageurs dès 6 mois, perfectionnement et compétition. Bassin chauffé.",
    ville: "Tunis", quartier: "La Marsa", adresse: "Piscine La Marsa / Piscine Menzah, Tunis",
    phone: "22625565", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8786, lng: 10.3249, plan: "free", category_slug: "loisirs",
    images: IMG.piscine,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "18:00"),
  },

  // ══════════════════════════════════════════════════
  //  ATELIERS & SPORT
  // ══════════════════════════════════════════════════
  {
    slug: "galaxy-gym-club-enfants-montplaisir",
    nom: "Galaxy Gym — Club Enfants",
    description: "La grande salle de sport de Montplaisir propose un club enfants complet : karaté dès 4 ans, taekwondo, Galaxy Foot Academy (football), natation, yoga enfants. Coachs diplômés.",
    ville: "Tunis", quartier: "Montplaisir", adresse: "Rue El Hsinet, Montplaisir, Tunis",
    phone: "71905378", email: null, website: "https://www.galaxygym.tn", facebook: "galaxygym.tn", instagram: null,
    lat: 36.8175, lng: 10.1744, plan: "premium", category_slug: "ateliers",
    images: IMG.artsmartiaux,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "07:00", "21:00"),
  },
  {
    slug: "ikaa-musique-danse-la-marsa",
    nom: "Ikaa — École de Musique et Danse",
    description: "École de musique et de danse à La Marsa, Cité Les Pins. Cours de piano, guitare, chant, violon et oud pour enfants et adultes. Cours de danse classique, contemporaine et orientale.",
    ville: "Tunis", quartier: "Cité Les Pins, La Marsa", adresse: "48 Rue Mohamed Bairem 5, Cité Les Pins, La Marsa",
    phone: "26275555", email: null, website: null, facebook: "StudiosIkaa", instagram: null,
    lat: 36.8810, lng: 10.3238, plan: "free", category_slug: "ateliers",
    images: IMG.musique,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "10:00", "20:00"),
  },
  {
    slug: "paradiddle-music-school-ennasr",
    nom: "Paradiddle Music School",
    description: "École de musique moderne à Ennasr 1, Ariana. Cours de piano, guitare, basse, batterie, chant, violon, oud pour enfants dès 4 ans. Pédagogie créative et stimulante.",
    ville: "Ariana", quartier: "Cité Ennasr 1", adresse: "22 Rue Erevan, Cité Ennasr 1, Ariana 2037",
    phone: "58662511", email: "contact@paradiddlemusicschool.com", website: null, facebook: "paradiddle.music.school", instagram: null,
    lat: 36.8831, lng: 10.1901, plan: "free", category_slug: "ateliers",
    images: IMG.musique,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "10:00", "20:00"),
  },
  {
    slug: "gammarth-tennis-academy",
    nom: "Gammarth Tennis Academy",
    description: "Académie de tennis à Cap Gammarth. Cours pour enfants de 3 à 16 ans, entraîneurs diplômés, terrain clay et quick. École de tennis, stages et tournois internes. Mini tennis pour les petits.",
    ville: "Tunis", quartier: "Gammarth", adresse: "Zone touristique Cap Gammarth, La Marsa 2070",
    phone: "71912212", email: "clubgammarth@gmail.com", website: "https://www.leclub.tn", facebook: null, instagram: null,
    lat: 36.9178, lng: 10.2867, plan: "premium", category_slug: "ateliers",
    images: IMG.tennis,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"], "07:00", "20:00"),
  },

  // ══════════════════════════════════════════════════
  //  FÊTES & ÉVÉNEMENTS
  // ══════════════════════════════════════════════════
  {
    slug: "zitouna-events-ezzahrouni",
    nom: "Zitouna Events",
    description: "Salle des fêtes et agence événementielle à Ezzahrouni, Manouba. Deux salles (King et Queen) pour mariages, fiançailles et anniversaires enfants. Organisation complète sur mesure depuis 2017.",
    ville: "Manouba", quartier: "Ezzahrouni", adresse: "Route de Béja, Ezzahrouni 2051, Manouba",
    phone: "56404404", email: "zitouna.events@gmail.com", website: "https://zitounaevents.com", facebook: "zitounaevents", instagram: "zitouna_events",
    lat: 36.8218, lng: 10.0784, plan: "premium", category_slug: "fetes",
    images: IMG.fete,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"], "09:00", "22:00"),
  },
  {
    slug: "clown4me-animation-ezzahra",
    nom: "Clown4Me — Animation Anniversaire Enfants",
    description: "Animation anniversaire et fêtes d'enfants à domicile ou en salle. Clown DJ, maquillage, magie, jeux, mini-disco et concours de danse. Package 3h complet. Déplacement dans tout le Grand Tunis.",
    ville: "Ben Arous", quartier: "Ezzahra", adresse: "Ezzahra, Ben Arous",
    phone: "21941266", email: null, website: null, facebook: "clownesqueTunisie", instagram: null,
    lat: 36.7421, lng: 10.2659, plan: "free", category_slug: "fetes",
    images: IMG.animation,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"], "10:00", "22:00"),
  },
  {
    slug: "hope-events-ennasr",
    nom: "Hope Events — Kits Anniversaire",
    description: "Décoration et organisation d'anniversaires pour enfants à Ennasr, Ariana. Kits anniversaire personnalisés dès 79 DT : ballons, guirlandes, centre de table, accroches thématiques. Livraison Grand Tunis.",
    ville: "Ariana", quartier: "Cité Ennasr 1", adresse: "Ennasr 1, Ariana",
    phone: "58459366", email: "hopeevents2016@gmail.com", website: null, facebook: null, instagram: null,
    lat: 36.8835, lng: 10.1896, plan: "free", category_slug: "fetes",
    images: IMG.fete,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "20:00"),
  },
  {
    slug: "special-fete-menzah-5",
    nom: "Spécial Fête — Articles & Décoration",
    description: "Magasin d'articles de fête et décoration à Menzah 5, Ariana. Ballons, costumes, déguisements, décors d'anniversaire, articles de farce et attrape. Livraison à domicile disponible.",
    ville: "Ariana", quartier: "Menzah 5", adresse: "Menzah 5, Ariana",
    phone: "55599676", email: null, website: null, facebook: "specialefetemenzeh5", instagram: null,
    lat: 36.8558, lng: 10.1976, plan: "free", category_slug: "fetes",
    images: IMG.fete,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "20:00"),
  },

  // ══════════════════════════════════════════════════
  //  SHOPPING — Vêtements & Jouets enfants
  // ══════════════════════════════════════════════════
  {
    slug: "gimel-lac-1-tunis",
    nom: "Gimel — Vêtements Enfants (Lac 1)",
    description: "Boutique de vêtements chic pour enfants de 3 mois à 18 ans. Collections tendance, qualité premium. Tenues de cérémonie, sportswear, casual. Centre Nawrez, Passage du Lac Edouards, Lac 1.",
    ville: "Tunis", quartier: "Berges du Lac 1", adresse: "Centre Nawrez, Passage du Lac Edouards, Lac 1, Tunis",
    phone: "24794283", email: null, website: "https://www.gimel-tunisie.com", facebook: "GIMELTUNISIE", instagram: "gimeltunisie",
    lat: 36.8453, lng: 10.2303, plan: "premium", category_slug: "shopping",
    images: IMG.vetements,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"], "10:00", "21:00"),
  },
  {
    slug: "gimel-la-marsa",
    nom: "Gimel — Vêtements Enfants (La Marsa)",
    description: "Boutique Gimel au Centre Millenium La Marsa. Mode enfantine de 3 mois à 18 ans. Tenues pour toutes occasions, accessoires et chaussures. Qualité et style à petit prix.",
    ville: "Tunis", quartier: "La Marsa", adresse: "Centre Millenium, La Marsa",
    phone: "71854288", email: null, website: "https://www.gimel-tunisie.com", facebook: "GIMELTUNISIE", instagram: "gimeltunisie",
    lat: 36.8789, lng: 10.3225, plan: "free", category_slug: "shopping",
    images: IMG.vetements,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"], "10:00", "20:00"),
  },
];

// ─── HANDLER ────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.secret !== "kidsworld-purge-2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: cats } = await supabase.from("categories").select("id, slug");
    const catMap: Record<string, string> = {};
    (cats || []).forEach((c: any) => { catMap[c.slug] = c.id; });

    let inserted = 0;
    let errors: string[] = [];

    for (const item of REAL_LISTINGS) {
      const { category_slug, images, hours, ...rest } = item;
      const category_id = catMap[category_slug];
      if (!category_id) {
        errors.push(`Category not found: ${category_slug} (slug: ${item.slug})`);
        continue;
      }

      // 1. Upsert listing
      const { data: upserted, error: upsertError } = await supabase
        .from("listings")
        .upsert({ ...rest, category_id, is_active: true }, { onConflict: "slug" })
        .select("id")
        .single();

      if (upsertError) {
        errors.push(`${item.slug}: ${upsertError.message}`);
        continue;
      }

      const lid = upserted.id;

      // 2. Replace images
      await supabase.from("listing_media").delete().eq("listing_id", lid).eq("type", "image");
      if (images.length > 0) {
        await supabase.from("listing_media").insert(
          images.map((url, i) => ({ listing_id: lid, url, type: "image", position: i }))
        );
      }

      // 3. Replace hours
      await supabase.from("listing_hours").delete().eq("listing_id", lid);
      await supabase.from("listing_hours").insert(
        hours.map((h) => ({ listing_id: lid, ...h }))
      );

      inserted++;
    }

    return NextResponse.json({
      ok: true,
      inserted,
      errors,
      total: REAL_LISTINGS.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
