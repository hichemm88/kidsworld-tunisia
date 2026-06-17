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

const IMG = {
  pediatre: [
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
    "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80",
  ],
  psychomotricien: [
    "https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=800&q=80",
    "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&q=80",
  ],
  orthophoniste: [
    "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&q=80",
    "https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=800&q=80",
  ],
  dermatologue: [
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
  ],
  kine: [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80",
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
  arts: [
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
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
  librairie: [
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
  ],
  vetements: [
    "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800&q=80",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80",
  ],
  parcjeux: [
    "https://images.unsplash.com/photo-1503676382389-4809596d5290?w=800&q=80",
    "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&q=80",
  ],
  fitness: [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80",
  ],
};

const REAL_LISTINGS: ListingData[] = [

  // ══════════════════════════════════════════════════
  //  SANTÉ — Pédiatres Lac 2
  // ══════════════════════════════════════════════════
  {
    slug: "dr-jamel-chnayna-pediatre-lac-2",
    nom: "Dr Jamel Chnayna — Pédiatre-Néonatologue",
    description: "Pédiatre et néonatologue aux Berges du Lac 2. Ancien assistant hospitalo-universitaire en néonatologie à la Faculté de Médecine de Tunis. Consultations générales et urgences pédiatriques.",
    ville: "Tunis", quartier: "Berges du Lac 2", adresse: "Hannibal Medical Center, Cité Les Pins, 1er étage, Les Berges du Lac 2, Tunis 1053",
    phone: "70039160", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8405, lng: 10.2352, plan: "premium", category_slug: "sante",
    images: IMG.pediatre,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "18:00"),
  },
  {
    slug: "erable-medical-pediatre-lac-2",
    nom: "Centre Érable Médical — Pédiatrie",
    description: "Cabinet pédiatrique au Centre Érable Médical, Cité Les Pins, Lac 2. Suivi global de l'enfant de 0 à 16 ans. Consultations planifiées et urgences. Médecins pédiatres expérimentés.",
    ville: "Tunis", quartier: "Berges du Lac 2", adresse: "Centre Érable Médical, Rue de la Feuille d'Érable, Cité Les Pins, Lac 2, Tunis",
    phone: "71267463", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8400, lng: 10.2349, plan: "free", category_slug: "sante",
    images: IMG.pediatre,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "08:30", "18:00"),
  },

  // ══════════════════════════════════════════════════
  //  SANTÉ — Psychomotriciens
  // ══════════════════════════════════════════════════
  {
    slug: "mounira-farhat-psychomotricienne-menzah",
    nom: "Mounira Farhat — Psychomotricienne",
    description: "Cabinet de psychomotricité et neurofeedback à El Menzah, Tunis. Bilan et rééducation psychomotrice pour enfants et adolescents. Retard psychomoteur, TDA/H, anxiété scolaire, troubles autistiques.",
    ville: "Tunis", quartier: "El Manar 2", adresse: "El Manar 2, Tunis",
    phone: "55410330", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8393, lng: 10.1681, plan: "free", category_slug: "sante",
    images: IMG.psychomotricien,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "18:00"),
  },
  {
    slug: "marwa-bougamra-psychomotricienne-ennasr",
    nom: "Marwa Bougamra — Psychomotricité & Neuropsychologie",
    description: "Cabinet de psychomotricité et neuropsychologie à Ennasr 2, Ariana. Bilans psychomoteurs, rééducation des troubles du développement, autisme, dyspraxie, TDA/H. Prise en charge dès 18 mois.",
    ville: "Ariana", quartier: "Cité Ennasr 2", adresse: "Résidence Al Tillel, Avenue Hédi Nouira, App. 76, 2ème étage, Ennasr 2, Ariana 2037",
    phone: null, email: null, website: "https://psychomotricite.tn", facebook: null, instagram: null,
    lat: 36.8826, lng: 10.1907, plan: "free", category_slug: "sante",
    images: IMG.psychomotricien,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "19:00"),
  },

  // ══════════════════════════════════════════════════
  //  SANTÉ — Orthophonistes
  // ══════════════════════════════════════════════════
  {
    slug: "sawsen-chtioui-orthophoniste-mourouj",
    nom: "Sawsen Chtioui — Orthophoniste",
    description: "Orthophoniste à El Mourouj, Ben Arous. Spécialisée en rééducation de la voix et de la parole chez l'enfant et l'adulte. Bégaiement, retard de langage, troubles de la déglutition. Sur rendez-vous.",
    ville: "Ben Arous", quartier: "El Mourouj", adresse: "Résidence les Jardins d'El Mourouj, El Mourouj, Ben Arous",
    phone: "53876449", email: null, website: null, facebook: null, instagram: null,
    lat: 36.7719, lng: 10.2153, plan: "free", category_slug: "sante",
    images: IMG.orthophoniste,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "18:00"),
  },
  {
    slug: "hanen-awadi-orthophoniste-mourouj-3",
    nom: "Hanen Awadi — Orthophoniste",
    description: "Orthophoniste à El Mourouj 3, Ben Arous. Bilans et rééducation orthophonique pour enfants. Spécialités : retard de parole et de langage, troubles de la communication, autisme, bégaiement.",
    ville: "Ben Arous", quartier: "El Mourouj 3", adresse: "24 Avenue de l'Irak, El Mourouj 3, Ben Arous",
    phone: "79494604", email: null, website: null, facebook: null, instagram: null,
    lat: 36.7745, lng: 10.2140, plan: "free", category_slug: "sante",
    images: IMG.orthophoniste,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "18:00"),
  },
  {
    slug: "amira-ftouh-orthophonie-ariana",
    nom: "Centre d'Orthophonie Amira Ftouh",
    description: "Centre d'orthophonie à Ariana. Bilan et prise en charge des troubles du langage oral et écrit, de la communication et de la déglutition chez l'enfant. Séances individuelles adaptées à chaque profil.",
    ville: "Ariana", quartier: "Ariana Centre", adresse: "24 Avenue Ibn Khaldoun, Ariana",
    phone: "53132392", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8689, lng: 10.1947, plan: "free", category_slug: "sante",
    images: IMG.orthophoniste,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "17:30"),
  },

  // ══════════════════════════════════════════════════
  //  ÉDUCATION — Écoles primaires Menzah
  // ══════════════════════════════════════════════════
  {
    slug: "ecole-avicenne-menzah-8",
    nom: "École Privée Avicenne — El Menzah 8",
    description: "École primaire privée à El Menzah 8, Ariana. Programme bilingue franco-arabe, de la préparatoire à la 6ème. Enseignants qualifiés, suivi personnalisé, espace sportif. Inscriptions ouvertes.",
    ville: "Ariana", quartier: "El Menzah 8", adresse: "20 Rue de Tyr, El Menzah 8, Ariana 2037",
    phone: "70866223", email: "ecole.avicenne.menzah8@gmail.com", website: null, facebook: null, instagram: null,
    lat: 36.8628, lng: 10.2012, plan: "free", category_slug: "education",
    images: IMG.ecole,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "07:30", "16:30"),
  },
  {
    slug: "ecole-la-chandelle-menzah-5",
    nom: "École La Chandelle — El Menzah 5",
    description: "École primaire privée à El Menzah 5, Ariana. Accueil de la préparatoire à la 6ème année. Ambiance familiale, pédagogie bienveillante, effectifs réduits. Activités artistiques et culturelles.",
    ville: "Ariana", quartier: "El Menzah 5", adresse: "Rue Abderrazek Karabaka, Menzah 5, Ariana Ville 2091",
    phone: "20703470", email: "ecole.la.chandelle@gmail.com", website: null, facebook: null, instagram: null,
    lat: 36.8564, lng: 10.1981, plan: "free", category_slug: "education",
    images: IMG.ecole,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "07:30", "16:30"),
  },
  {
    slug: "ecole-charlemagne-menzah-4",
    nom: "École Charlemagne — El Menzah",
    description: "École primaire privée historique à El Menzah 4. Éducation de qualité depuis de nombreuses années. Programme bilingue franco-arabe, activités parascolaires variées. Encadrement pédagogique solide.",
    ville: "Tunis", quartier: "El Menzah 4", adresse: "66 Avenue du 10 Décembre, El Menzah 4, Tunis 1004",
    phone: "71767067", email: "ecole.charlemagne@yahoo.fr", website: null, facebook: null, instagram: null,
    lat: 36.8538, lng: 10.1936, plan: "free", category_slug: "education",
    images: IMG.ecole,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "07:30", "16:30"),
  },
  {
    slug: "ecole-marie-curie-menzah",
    nom: "École Marie Curie — El Menzah",
    description: "École primaire privée à El Menzah, Tunis. Programme renforcé en sciences et langues. Suivi individualisé, petits effectifs, enseignants expérimentés. De la maternelle à la 6ème.",
    ville: "Tunis", quartier: "El Menzah", adresse: "64 Rue Ibn Bassem, El Menzah, Tunis 1082",
    phone: "99725299", email: "marie.curie.school64@gmail.com", website: null, facebook: null, instagram: null,
    lat: 36.8548, lng: 10.1926, plan: "free", category_slug: "education",
    images: IMG.ecole,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "07:30", "16:30"),
  },
  {
    slug: "finland-leaders-school-menzah-7",
    nom: "Finland Leaders School (FLS) — El Menzah 7",
    description: "École primaire privée à El Menzah 7, Ariana. Pédagogie inspirée du modèle finlandais : apprentissage par l'expérience, créativité, autonomie. Programme bilingue, activités robotique et coding.",
    ville: "Ariana", quartier: "El Menzah 7", adresse: "20 Rue Ibn Hazm El Andaloussi, El Menzah 7, Ariana 2037",
    phone: "36136333", email: "finland.leaders.school@gmail.com", website: null, facebook: null, instagram: null,
    lat: 36.8612, lng: 10.2006, plan: "premium", category_slug: "education",
    images: IMG.ecole,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "07:30", "16:30"),
  },
  {
    slug: "ulysse-school-menzah-7",
    nom: "Ulysse School — El Menzah 7",
    description: "École primaire privée à El Menzah 7. Programme franco-arabe enrichi, sport, arts et culture. Encadrement de qualité, infrastructures modernes. Préparatoire, primaire et collège disponibles.",
    ville: "Ariana", quartier: "El Menzah 7", adresse: "12 Rue Rabaa Al Adaouia, El Menzah 7, Ariana 2037",
    phone: "71753290", email: "contact@ulysse.ens.tn", website: null, facebook: null, instagram: null,
    lat: 36.8618, lng: 10.2002, plan: "free", category_slug: "education",
    images: IMG.ecole,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "07:30", "16:30"),
  },
  {
    slug: "smart-school-mnihla-ariana",
    nom: "Smart School — M'nihla",
    description: "École primaire privée à M'nihla, Ariana. Pédagogie moderne et interactive, classes équipées de tableaux numériques. Cours de programmation, robotique et langues pour tous niveaux.",
    ville: "Ariana", quartier: "M'nihla", adresse: "66 Lotissement El Fell, Les Jardins d'El Menzah, M'nihla, Ariana 2094",
    phone: "70733808", email: "contact@smartschool.tn", website: null, facebook: null, instagram: null,
    lat: 36.8672, lng: 10.2055, plan: "premium", category_slug: "education",
    images: IMG.ecole,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "07:30", "16:00"),
  },

  // ══════════════════════════════════════════════════
  //  LOISIRS
  // ══════════════════════════════════════════════════
  {
    slug: "cure-sport-raoued-ariana",
    nom: "Cure Sport El Ghazala — Piscine & Fitness",
    description: "Centre sportif complet à Cité El Ghazala, Raoued, Ariana. Piscine couverte chauffée, cours de natation enfants dès 4 ans, musculation, aérobic et aquagym. Club d'été pour ados. Ambiance familiale.",
    ville: "Ariana", quartier: "El Ghazala, Raoued", adresse: "Rue Hamza Ibn Abdelmotaleb, Cité El Ghazala, Raoued, Ariana",
    phone: "70686702", email: "cure.sport2021@gmail.com", website: null, facebook: null, instagram: null,
    lat: 36.9015, lng: 10.1468, plan: "free", category_slug: "loisirs",
    images: IMG.piscine,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"], "08:00", "19:00"),
  },
  {
    slug: "kids-parc-menzah-6",
    nom: "Kids Parc — Aire de Jeux Menzah 6",
    description: "Aire de jeux et de loisirs pour enfants à El Menzah 6. Structures gonflables, balançoires, toboggans, coin créatif. Idéal pour les anniversaires et les sorties en famille. Restauration légère sur place.",
    ville: "Ariana", quartier: "El Menzah 6", adresse: "Avenue de l'Environnement, El Menzah 6, Ariana 2091",
    phone: null, email: null, website: null, facebook: null, instagram: null,
    lat: 36.8589, lng: 10.1951, plan: "free", category_slug: "loisirs",
    images: IMG.parcjeux,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"], "10:00", "21:00"),
  },
  {
    slug: "square-fit-ariana",
    nom: "Square Fit — Sport & Bien-être Enfants",
    description: "Salle de sport moderne à Ariana. Programmes spéciaux enfants et adolescents : gym, sports de combat, fitness. Entraîneurs diplômés, équipements neufs. Cours collectifs et coaching individuel.",
    ville: "Ariana", quartier: "Ariana Centre", adresse: "Lot E28, Avenue El Fell, Ariana 2093",
    phone: "71815171", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8665, lng: 10.1926, plan: "free", category_slug: "loisirs",
    images: IMG.fitness,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "07:00", "21:00"),
  },

  // ══════════════════════════════════════════════════
  //  ATELIERS & SPORT
  // ══════════════════════════════════════════════════
  {
    slug: "urban-dance-menzah-5",
    nom: "Urban Dance Academy — Menzah 5",
    description: "Académie de danse référence en Tunisie, campus Menzah 5. Hip-hop, ragga, contemporary, breaking pour enfants dès 5 ans et adolescents. Spectacles de fin d'année, compétitions nationales. Fondée par Ala Zrafi.",
    ville: "Ariana", quartier: "El Menzah 5", adresse: "Menzah 5, près de Café Java, Ariana",
    phone: "29291291", email: "contact@urbandance.tn", website: "https://www.urbandance.tn", facebook: "urbandanceTN", instagram: "urbandancem5",
    lat: 36.8561, lng: 10.1986, plan: "premium", category_slug: "ateliers",
    images: IMG.danse,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "10:00", "20:00"),
  },
  {
    slug: "ikaa-tunis-danse-musique",
    nom: "Ikaa Tunis — Danse et Musique",
    description: "École Ikaa à Tunis (Avenue Bourguiba). Cours de danse classique, hip-hop, contemporaine et orientale pour enfants et adultes. Cours de piano, guitare et chant dès 4 ans. Plus de 30 ans d'expérience.",
    ville: "Tunis", quartier: "Avenue Bourguiba", adresse: "30 Avenue Habib Bourguiba, Tunis",
    phone: "29375555", email: null, website: "https://www.ikaa-ecole.com", facebook: "StudiosIkaa", instagram: null,
    lat: 36.8003, lng: 10.1795, plan: "free", category_slug: "ateliers",
    images: IMG.danse,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "10:00", "20:00"),
  },
  {
    slug: "power-academy-ariana-arts-martiaux",
    nom: "Power Academy — Arts Martiaux & Fitness",
    description: "Centre de sports de combat à Ariana. Jiu-jitsu brésilien, lutte libre, muay thaï pour enfants dès 6 ans et adultes. Cours du soir disponibles. Professeurs certifiés, ambiance conviviale.",
    ville: "Ariana", quartier: "Ariana Centre", adresse: "3 Rue Hammadi Fareh, Ariana",
    phone: "97406940", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8680, lng: 10.1915, plan: "free", category_slug: "ateliers",
    images: [
      "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&q=80",
      "https://images.unsplash.com/photo-1564419320461-6870880221ad?w=800&q=80",
    ],
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "21:00"),
  },
  {
    slug: "marsa-arts-hub-dessin-peinture",
    nom: "Marsa Art's Hub — Atelier Dessin & Peinture",
    description: "Club d'arts plastiques à La Marsa, dirigé par un diplômé de l'ENAU Sidi Bou Saïd. Cours de dessin (crayon, pastel, marqueurs), peinture (acrylique, aquarelle) et sculpture pour enfants et adolescents.",
    ville: "Tunis", quartier: "La Marsa", adresse: "La Marsa, Tunis",
    phone: null, email: null, website: null, facebook: "marsaartshub", instagram: null,
    lat: 36.8788, lng: 10.3242, plan: "free", category_slug: "ateliers",
    images: IMG.arts,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "10:00", "19:00"),
  },
  {
    slug: "karate-menzah-6-academie",
    nom: "Académie Karaté El Menzah 6",
    description: "Académie de karaté à El Menzah 6, Ariana. Cours pour enfants dès 4 ans, adolescents et adultes. Passage de grades, compétitions régionales et nationales. Professeur fédéral diplômé.",
    ville: "Ariana", quartier: "El Menzah 6", adresse: "El Menzah 6, Ariana",
    phone: "95145311", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8591, lng: 10.1949, plan: "free", category_slug: "ateliers",
    images: [
      "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&q=80",
      "https://images.unsplash.com/photo-1564419320461-6870880221ad?w=800&q=80",
    ],
    hours: defaultHours(["Lundi","Mercredi","Jeudi","Vendredi","Samedi"], "15:00", "20:00"),
  },

  // ══════════════════════════════════════════════════
  //  FÊTES & ÉVÉNEMENTS
  // ══════════════════════════════════════════════════
  {
    slug: "happyday-kits-anniversaire",
    nom: "HappyDay — Kits Anniversaire Tunisie",
    description: "Boutique en ligne de kits d'anniversaire pour enfants. Ballons, guirlandes, confettis, centres de table et accessoires photo thématiques. Livraison rapide dans tout le Grand Tunis. Personnalisation disponible.",
    ville: "Tunis", quartier: "Tunis", adresse: "Grand Tunis (livraison à domicile)",
    phone: null, email: null, website: "https://www.happyday.tn", facebook: "happyday.tn", instagram: "happyday.tn",
    lat: null, lng: null, plan: "free", category_slug: "fetes",
    images: IMG.fete,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "19:00"),
  },
  {
    slug: "bellezza-event-tunis",
    nom: "Bellezza Event — Espace Événementiel",
    description: "Salle des fêtes et espace événementiel à Tunis. Organisation de mariages, fiançailles et anniversaires enfants. Deux salles disponibles, décoration intégrée, service traiteur. Sur devis.",
    ville: "Tunis", quartier: "Tunis", adresse: "Tunis",
    phone: null, email: null, website: "https://bellezza-event.com", facebook: "BellezzaEventTunis", instagram: null,
    lat: null, lng: null, plan: "free", category_slug: "fetes",
    images: IMG.fete,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"], "09:00", "22:00"),
  },
  {
    slug: "tictac-event-tunis",
    nom: "TicTac Event — Organisation Anniversaires",
    description: "Agence événementielle spécialisée en anniversaires d'enfants à Tunis. Animation complète : DJ, magicien, maquillage, bal costumé, décoration. Prise en charge totale de A à Z.",
    ville: "Tunis", quartier: "Tunis", adresse: "Tunis",
    phone: null, email: null, website: "https://www.tictacevent.com", facebook: "TicTacEvent11", instagram: null,
    lat: null, lng: null, plan: "free", category_slug: "fetes",
    images: IMG.animation,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"], "09:00", "22:00"),
  },
  {
    slug: "arteco-animation-tunis-ariana",
    nom: "ARTECO — Animation & Spectacles Enfants",
    description: "Prestataire d'animation pour anniversaires et fêtes d'enfants à Tunis et Ariana. Spectacle visuel, magie, clown, sonorisation. Déplacement dans un rayon de 250 km. Pack complet sur devis.",
    ville: "Tunis", quartier: "Ariana", adresse: "Tunis / Ariana (déplacement Grand Tunis)",
    phone: null, email: null, website: null, facebook: "arteco.events", instagram: null,
    lat: null, lng: null, plan: "free", category_slug: "fetes",
    images: IMG.animation,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"], "09:00", "22:00"),
  },
  {
    slug: "mahou-salle-fetes-ben-arous",
    nom: "Mahou Salle des Fêtes — Ben Arous",
    description: "Salle des fêtes polyvalente à Ben Arous. Climatisée, spacieuse, personnel qualifié. Anniversaires enfants, mariages, fiançailles. Espace jeux intégré pour les petits. Devis sur demande.",
    ville: "Ben Arous", quartier: "Ben Arous Centre", adresse: "Ben Arous",
    phone: null, email: null, website: null, facebook: "mahou.events", instagram: null,
    lat: null, lng: null, plan: "free", category_slug: "fetes",
    images: IMG.fete,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"], "10:00", "23:00"),
  },

  // ══════════════════════════════════════════════════
  //  SHOPPING — Librairies & Jouets
  // ══════════════════════════════════════════════════
  {
    slug: "oxford-city-tunis",
    nom: "Oxford City — Librairie & Jouets (Tunis)",
    description: "La plus grande librairie de Tunisie depuis plus de 65 ans. Rayons jeux éducatifs, puzzles, robots, peluches et jouets pour enfants. Fournitures scolaires, livres jeunesse, papeterie et multimédia.",
    ville: "Tunis", quartier: "Tunis Centre", adresse: "Tunis",
    phone: "39159999", email: null, website: "https://oxfordcity.tn", facebook: "librairieoxfordcity", instagram: "librairieoxfordcity",
    lat: 36.8008, lng: 10.1801, plan: "free", category_slug: "shopping",
    images: IMG.librairie,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"], "09:00", "19:30"),
  },
  {
    slug: "moncef-jouets-la-marsa",
    nom: "Moncef Jouets — La Marsa",
    description: "Boutique de jouets à La Marsa. Large sélection de jouets pour enfants de 0 à 12 ans : jeux de construction, poupées, peluches, jeux de société, véhicules et jouets éducatifs. Cadeau idéal pour anniversaires.",
    ville: "Tunis", quartier: "La Marsa", adresse: "La Marsa, Tunis",
    phone: null, email: null, website: "https://moncefjouets.com", facebook: null, instagram: null,
    lat: 36.8793, lng: 10.3228, plan: "free", category_slug: "shopping",
    images: IMG.jouets,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"], "09:30", "19:30"),
  },
  {
    slug: "bebekids-jouets-tunis",
    nom: "Bebekids — Jouets & Puériculture",
    description: "Magasin spécialisé jouets et puériculture en Tunisie. Jouets éducatifs, poussettes, berceau, articles de bain bébé, vêtements. Livraison sur toute la Tunisie. Large catalogue en ligne.",
    ville: "Tunis", quartier: "Tunis", adresse: "Tunis (livraison partout en Tunisie)",
    phone: null, email: null, website: "https://www.bebekids.tn", facebook: null, instagram: null,
    lat: null, lng: null, plan: "free", category_slug: "shopping",
    images: IMG.jouets,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "18:00"),
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

      await supabase.from("listing_media").delete().eq("listing_id", lid).eq("type", "image");
      if (images.length > 0) {
        await supabase.from("listing_media").insert(
          images.map((url, i) => ({ listing_id: lid, url, type: "image", position: i }))
        );
      }

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
