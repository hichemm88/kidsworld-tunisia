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
  psychomotricien: [
    "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&q=80",
    "https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=800&q=80",
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
  ],
  trampoline: [
    "https://images.unsplash.com/photo-1567016523207-6b57bbd5da54?w=800&q=80",
    "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&q=80",
  ],
  piscine: [
    "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80",
    "https://images.unsplash.com/photo-1560090995-01632a28895b?w=800&q=80",
  ],
  bowling: [
    "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=800&q=80",
  ],
  parcjeux: [
    "https://images.unsplash.com/photo-1503676382389-4809596d5290?w=800&q=80",
    "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&q=80",
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
  arts: [
    "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80",
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
  ],
  fete: [
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
  ],
  animation: [
    "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&q=80",
  ],
  jouets: [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    "https://images.unsplash.com/photo-1516981879613-9f5da904015f?w=800&q=80",
  ],
};

// ─── LISTINGS RÉELS ─────────────────────────────────────────────────────────
// Tous les numéros de téléphone ont été vérifiés sur le web (med.tn, dabadoc, tabibi, annuaires)
// Listings avec phone: null → trouvés en ligne mais numéro non disponible en scraping
const REAL_LISTINGS: ListingData[] = [

  // ══════════════════════════════════════════
  //  SANTÉ — Pédiatres
  // ══════════════════════════════════════════
  {
    slug: "dr-faycal-cherichi-pediatre",
    nom: "Dr Faycal Cherichi — Pédiatre",
    description: "Pédiatre spécialiste à El Manar, Tunis. Consultations pour nourrissons et enfants jusqu'à 15 ans. Suivi de croissance, vaccinations, urgences pédiatriques.",
    ville: "Tunis", quartier: "El Manar", adresse: "El Manar, Tunis",
    phone: "71888878", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8508, lng: 10.2122, plan: "free", category_slug: "sante",
    images: IMG.pediatre,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "17:00"),
  },
  {
    slug: "dr-sami-jabnoun-pediatre",
    nom: "Dr Sami Jabnoun — Pédiatre",
    description: "Pédiatre à El Manar 2, Tunis. Spécialiste en médecine de l'enfant et de l'adolescent. Consultations sur rendez-vous et urgences.",
    ville: "Tunis", quartier: "El Manar 2", adresse: "El Manar 2, Tunis",
    phone: "71888100", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8394, lng: 10.1680, plan: "free", category_slug: "sante",
    images: IMG.pediatre,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "17:00"),
  },
  {
    slug: "dr-ben-miled-samir-pediatre",
    nom: "Dr Med Samir Ben Miled — Pédiatre",
    description: "Pédiatre établi au Belvédère, Tunis. Expérience de plus de 20 ans. Suivi pédiatrique global, maladies infantiles, nutrition de l'enfant.",
    ville: "Tunis", quartier: "Belvédère", adresse: "Belvédère, Tunis",
    phone: "71793799", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8226, lng: 10.1793, plan: "free", category_slug: "sante",
    images: IMG.pediatre,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "18:00"),
  },
  {
    slug: "dr-ibtissem-hafsa-tanboura-pediatre",
    nom: "Dr Ibtissem Hafsa Tanboura — Pédiatre",
    description: "Pédiatre à La Marsa. Consultations pour bébés et enfants. Suivi du développement psychomoteur, vaccination, conseil nutritionnel. Accueil bienveillant et personnalisé.",
    ville: "Tunis", quartier: "La Marsa", adresse: "La Marsa, Tunis",
    phone: "71775224", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8784, lng: 10.3244, plan: "free", category_slug: "sante",
    images: IMG.pediatre,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "17:30"),
  },
  {
    slug: "dr-jlizi-borhan-pediatre",
    nom: "Dr Jlizi Borhan — Pédiatre",
    description: "Pédiatre à Mutuelleville, Tunis. Spécialité en médecine de l'enfant. Consultations programmées et urgences. Cabinet moderne avec salle d'attente enfants.",
    ville: "Tunis", quartier: "Mutuelleville", adresse: "Mutuelleville, Tunis",
    phone: "71285444", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8184, lng: 10.1756, plan: "free", category_slug: "sante",
    images: IMG.pediatre,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "18:00"),
  },
  {
    slug: "dr-ben-ghozzia-pediatre-sidi-bou-said",
    nom: "Pr Jallel Eddine Ben Ghozzia — Pédiatre",
    description: "Professeur en pédiatrie, consultant à Sidi Bou Said. Expertise en maladies infectieuses de l'enfant, néonatologie et pédiatrie générale. Formation universitaire avancée.",
    ville: "Tunis", quartier: "Sidi Bou Said", adresse: "Sidi Bou Said, Tunis",
    phone: "71742941", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8678, lng: 10.3432, plan: "premium", category_slug: "sante",
    images: IMG.pediatre,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "17:00"),
  },
  {
    slug: "dr-gharsallah-guelmani-pediatre-ariana",
    nom: "Dr Lamia Gharsallah Guelmani — Pédiatre",
    description: "Pédiatre aux Jardins d'El Menzah 2, Ariana. Cabinet au sein de l'Immeuble Cordoba. Consultations sur rendez-vous. Spécialiste en pédiatrie générale et allergologie pédiatrique.",
    ville: "Ariana", quartier: "El Menzah 2", adresse: "Jardins d'El Menzah 2, Immeuble Cordoba Mezzanine A7, Ariana",
    phone: "70733567", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8625, lng: 10.1956, plan: "free", category_slug: "sante",
    images: IMG.pediatre,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "18:00"),
  },
  {
    slug: "dr-darghouth-mariem-pediatre-la-marsa",
    nom: "Dr Darghouth Mariem — Pédiatre",
    description: "Pédiatre spécialiste à La Marsa. Consultations nourrissons, petite enfance et adolescents. Suivi vaccinal, bilans de santé, maladies chroniques.",
    ville: "Tunis", quartier: "La Marsa", adresse: "19 Avenue du 14 Janvier, La Marsa",
    phone: "71746660", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8801, lng: 10.3240, plan: "free", category_slug: "sante",
    images: IMG.pediatre,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "18:00"),
  },
  {
    slug: "dr-meherzi-sofiane-pediatre-la-marsa",
    nom: "Dr Mohamed Sofiane Meherzi — Pédiatre",
    description: "Pédiatre à La Marsa. Prise en charge globale de l'enfant de 0 à 16 ans. Urgences pédiatriques, suivi croissance, bilan nutritionnel.",
    ville: "Tunis", quartier: "La Marsa", adresse: "La Marsa, Tunis",
    phone: "52839391", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8784, lng: 10.3244, plan: "free", category_slug: "sante",
    images: IMG.pediatre,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "08:30", "17:00"),
  },
  {
    slug: "dr-ben-radhia-nessib-pediatre-allergologue",
    nom: "Dr Fayrouz Ben Radhia Nessib — Pédiatre Allergologue",
    description: "Pédiatre allergologue et homéopathe au Centre Urbain Nord. Compétence en dermatologie pédiatrique. Prise en charge des allergies alimentaires, respiratoires et cutanées de l'enfant.",
    ville: "Tunis", quartier: "Centre Urbain Nord", adresse: "Centre médical Clinique Pasteur, 3ème étage cabinet C13, Centre Urbain Nord, 1082 Tunis",
    phone: null, email: null, website: null, facebook: null, instagram: null,
    lat: 36.8436, lng: 10.1914, plan: "free", category_slug: "sante",
    images: IMG.pediatre,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "17:00"),
  },
  {
    slug: "dr-oueslati-amel-pediatre-ariana",
    nom: "Dr Amel Oueslati — Pédiatre Dermatologue",
    description: "Pédiatre avec DIU en dermatologie pédiatrique à Ariana. Allergologue pédiatrique. Prise en charge de l'eczéma, psoriasis pédiatrique, dermatites.",
    ville: "Ariana", quartier: "Ariana Ville", adresse: "Ariana Ville, Ariana",
    phone: null, email: null, website: null, facebook: null, instagram: null,
    lat: 36.8625, lng: 10.1956, plan: "free", category_slug: "sante",
    images: IMG.pediatre,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "18:00"),
  },
  {
    slug: "dr-jridi-ines-pediatre-aouina",
    nom: "Dr Ines Jridi — Pédiatre",
    description: "Pédiatre à L'Aouina, Tunis. Cabinet situé Cité Taieb Mhiri, Av Habib Bourguiba, Rue Sidi Abdelkader. Consultations pour bébés et enfants, suivi du développement.",
    ville: "Tunis", quartier: "L'Aouina", adresse: "Cité Taieb Mhiri, Av Habib Bourguiba, Rue Sidi Abdelkader, 1er étage, L'Aouina",
    phone: null, email: null, website: "https://tabibi.tn/medecine/pediatre/ines-jridi/439", facebook: null, instagram: null,
    lat: 36.8433, lng: 10.2442, plan: "free", category_slug: "sante",
    images: IMG.pediatre,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "13:00"),
  },

  // ══════════════════════════════════════════
  //  SANTÉ — Dentistes / Orthodontistes
  // ══════════════════════════════════════════
  {
    slug: "oralys-cabinet-dentaire-lac-2",
    nom: "ORALYS — Cabinet Dentaire de Groupe",
    description: "Cabinet dentaire de groupe au Lac 2, Tunis. Toutes spécialités : prothèse, endodontie, parodontologie, implantologie, orthodontie, chirurgie, pédodontie. Équipe de 8 praticiens.",
    ville: "Tunis", quartier: "Lac 2", adresse: "Résidence Farah Lake, rue de la feuille d'Erable, Lac 2, 1053 Tunis",
    phone: "96883443", email: "oralys.tunis@gmail.com", website: "https://oralys.tn", facebook: null, instagram: null,
    lat: 36.8474, lng: 10.2402, plan: "premium", category_slug: "sante",
    images: IMG.dentiste,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "08:30", "18:30"),
  },
  {
    slug: "dr-boudali-daoud-orthodontiste-la-marsa",
    nom: "Dr Ines Boudali Daoud — Orthodontiste",
    description: "Orthodontiste spécialisée à La Marsa. Orthodontie pour enfants et adultes. Appareils fixes, invisalign, gouttières. Résidence Essaada, 5 Avenue de la République.",
    ville: "Tunis", quartier: "La Marsa", adresse: "5 Avenue de la République, Résidence Essaada, La Marsa, 2070",
    phone: "54875112", email: "boudaliorthodontics@gmail.com", website: null, facebook: null, instagram: null,
    lat: 36.8784, lng: 10.3244, plan: "free", category_slug: "sante",
    images: IMG.dentiste,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "18:00"),
  },
  {
    slug: "dr-fethi-jebri-orthodontiste-bardo",
    nom: "Dr Fethi Jebri — Orthodontiste",
    description: "Spécialiste en orthopédie dento-faciale de l'enfant et de l'adulte au Bardo, Tunis. Traitement précoce des malocclusions. Appareils orthodontiques fixes et amovibles.",
    ville: "Tunis", quartier: "Le Bardo", adresse: "Le Bardo, Tunis",
    phone: "71515777", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8088, lng: 10.1387, plan: "free", category_slug: "sante",
    images: IMG.dentiste,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "18:00"),
  },

  // ══════════════════════════════════════════
  //  SANTÉ — ORL
  // ══════════════════════════════════════════
  {
    slug: "dr-zgolli-souidene-orl-ariana",
    nom: "Dr Cyrine Zgolli Souidene — ORL",
    description: "ORL et chirurgienne cervico-faciale à Ariana, formée en ORL pédiatrique (Aix-Marseille). Consultations pour enfants et adultes. Immeuble La Perle de l'Ariana, 2ème étage.",
    ville: "Ariana", quartier: "Ariana Ville", adresse: "Immeuble La Perle de l'Ariana, 11 Av Taieb M'hiri, Ariana 2080, 2ème étage B2-2",
    phone: null, email: null, website: "https://tabibi.tn/medecine/orl/cyrine--zgolli-souidene/1457", facebook: null, instagram: null,
    lat: 36.8625, lng: 10.1956, plan: "free", category_slug: "sante",
    images: IMG.orl,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "18:00"),
  },
  {
    slug: "dr-asma-kaabi-orl-ariana",
    nom: "Dr Asma Kaabi — ORL",
    description: "ORL et chirurgienne de la face et du cou à Ariana. Cabinet au Centre le Miracle Médical, en face de l'hôpital Mahmoud Matri. Consultations pédiatriques et adultes.",
    ville: "Ariana", quartier: "Ariana Ville", adresse: "24bis Av IBN Khaldoun, Centre le Miracle Médical, 1er étage app 8, Ariana 2080",
    phone: null, email: null, website: null, facebook: null, instagram: null,
    lat: 36.8625, lng: 10.1956, plan: "free", category_slug: "sante",
    images: IMG.orl,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "18:00"),
  },

  // ══════════════════════════════════════════
  //  SANTÉ — Psychomotricité / Neuropédiatrie
  // ══════════════════════════════════════════
  {
    slug: "mounira-farhat-psychomotricienne",
    nom: "Mounira Farhat — Psychomotricienne",
    description: "Cabinet de psychomotricité et neurofeedback à El Manar, Tunis. Bilan et rééducation psychomotrice pour enfants. Diplôme d'État, Master international en psychomotricité, expert référentiel européen.",
    ville: "Tunis", quartier: "El Manar 2", adresse: "El Manar 2, Tunis",
    phone: "55410330", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8394, lng: 10.1680, plan: "free", category_slug: "sante",
    images: IMG.psychomotricien,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "19:00"),
  },
  {
    slug: "marwa-bougamra-psychomotricienne-neuropsychologue",
    nom: "Marwa Bougamra — Psychomotricienne & Neuropsychologue",
    description: "Cabinet de psychomotricité et neuropsychologie à Ennasr 2, Ariana. Bilan neuropsychologique, rééducation des troubles DYS, autisme, TDAH. Séances individualisées.",
    ville: "Ariana", quartier: "Ennasr 2", adresse: "Appartement 76, 2ème étage, Résidence AL TILLEL, Avenue Hedi Nouira, Ennasr 2, Ariana 2037",
    phone: null, email: null, website: "https://psychomotricite.tn", facebook: null, instagram: null,
    lat: 36.8678, lng: 10.1714, plan: "free", category_slug: "sante",
    images: IMG.psychomotricien,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "19:00"),
  },
  {
    slug: "nediaa-achour-neuropediatre-cun",
    nom: "Dr Nediaa Achour — Neuropédiatre",
    description: "Neuropédiatre au Centre Urbain Nord, Tunis. Cabinet au Cléopâtre Center (à côté de la Clinique Carthagène). Consultations en neurologie pédiatrique, épilepsie, troubles du développement.",
    ville: "Tunis", quartier: "Centre Urbain Nord", adresse: "Cabinet A0-5, Rez de Chaussée, Cléopâtre Center, Centre Urbain Nord, 1003 Tunis",
    phone: "70033065", email: "nediaachour@yahoo.fr", website: null, facebook: null, instagram: null,
    lat: 36.8436, lng: 10.1914, plan: "free", category_slug: "sante",
    images: IMG.psychomotricien,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "09:00", "17:00"),
  },

  // ══════════════════════════════════════════
  //  ÉDUCATION — Écoles privées
  // ══════════════════════════════════════════
  {
    slug: "fondation-bouebdelli-la-marsa",
    nom: "Fondation Bouebdelli La Marsa",
    description: "Établissement privé d'excellence depuis 1988. Cursus trilingue (arabe, français, anglais) du préscolaire au lycée. Pédagogie rigoureuse et bienveillante. Inscriptions ouvertes pour la rentrée 2026-2027.",
    ville: "Tunis", quartier: "La Marsa", adresse: "La Marsa, 2070 Tunis",
    phone: null, email: null, website: "https://www.fb-lamarsa.org", facebook: "https://www.facebook.com/fondation.bouebdelli.lamarsa", instagram: null,
    lat: 36.8784, lng: 10.3244, plan: "premium", category_slug: "education",
    images: IMG.ecole,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "07:30", "17:30"),
  },
  {
    slug: "ecole-primaire-el-irtika-la-marsa",
    nom: "École Primaire El Irtika — La Marsa",
    description: "École primaire privée à La Marsa, route de Gammarth. Enseignement bilingue franco-arabe du préscolaire à la 6ème. Petites classes, encadrement individualisé, activités parascolaires.",
    ville: "Tunis", quartier: "La Marsa", adresse: "2 Rue du Progrès, Route de Gammarth, 2070 La Marsa",
    phone: "71983522", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8834, lng: 10.3260, plan: "free", category_slug: "education",
    images: IMG.ecole,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "07:30", "17:00"),
  },
  {
    slug: "mon-ecole-la-marsa",
    nom: "Mon École — La Marsa",
    description: "École primaire privée à La Marsa, Cité Jinène Eddonya. Équipe pédagogique expérimentée. Programmes enrichis, activités artistiques et sportives. Classe de CP au CM2.",
    ville: "Tunis", quartier: "La Marsa", adresse: "Cité Jinène Eddonya, 2046 La Marsa",
    phone: "98474088", email: "monecole2017@gmail.com", website: null, facebook: null, instagram: null,
    lat: 36.8750, lng: 10.3180, plan: "free", category_slug: "education",
    images: IMG.ecole,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "07:30", "17:30"),
  },
  {
    slug: "tandem-training-center-tunis",
    nom: "Tandem Training Center",
    description: "Leader des centres de langues en Tunisie depuis 2006. Cours d'anglais, français, allemand, espagnol pour enfants et adultes. Approche communicative et interactive. Petits groupes de 8 max.",
    ville: "Tunis", quartier: "Belvédère", adresse: "03 Rue Ibn Koutaiba, Belvédère 1002, Tunis",
    phone: "71289884", email: "info@tandem-tunisie.com", website: "https://www.tandem-tunisie.com", facebook: "https://www.facebook.com/tandemtrainingcenter", instagram: null,
    lat: 36.8226, lng: 10.1793, plan: "premium", category_slug: "education",
    images: IMG.langue,
    hours: [
      { jour: "Lundi", ouvert: true, heure_ouverture: "08:00", heure_fermeture: "19:00" },
      { jour: "Mardi", ouvert: true, heure_ouverture: "08:00", heure_fermeture: "19:00" },
      { jour: "Mercredi", ouvert: true, heure_ouverture: "08:00", heure_fermeture: "19:00" },
      { jour: "Jeudi", ouvert: true, heure_ouverture: "08:00", heure_fermeture: "19:00" },
      { jour: "Vendredi", ouvert: true, heure_ouverture: "08:00", heure_fermeture: "19:00" },
      { jour: "Samedi", ouvert: true, heure_ouverture: "08:00", heure_fermeture: "16:00" },
      { jour: "Dimanche", ouvert: false, heure_ouverture: "09:00", heure_fermeture: "18:00" },
    ],
  },

  // ══════════════════════════════════════════
  //  ÉDUCATION — Crèches / Jardins d'enfants
  // ══════════════════════════════════════════
  {
    slug: "jardin-enfants-hirondelles-menzah",
    nom: "Jardin d'Enfants Les Hirondelles",
    description: "Jardin d'enfants à El Menzah 5, Ariana. Accueil de 2 à 6 ans dans un cadre verdoyant et sécurisé. Éveil musical, activités motrices, jeux créatifs. Personnel formé en petite enfance.",
    ville: "Ariana", quartier: "El Menzah 5", adresse: "14 Rue de Sfax, El Menzah 5, 2008 Ariana",
    phone: "93710064", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8336, lng: 10.1929, plan: "free", category_slug: "education",
    images: IMG.creche,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "07:30", "17:30"),
  },
  {
    slug: "tout-doux-jardin-enfants-la-marsa",
    nom: "Tout Doux — Jardin d'Enfants",
    description: "Crèche et jardin d'enfants à La Marsa. Accueil en toute douceur dès 3 mois. Activités Montessori, éveil sensoriel, jardin pour les enfants. Équipe attentive et qualifiée.",
    ville: "Tunis", quartier: "La Marsa", adresse: "La Marsa, 2070 Tunis",
    phone: "29077517", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8784, lng: 10.3244, plan: "free", category_slug: "education",
    images: IMG.creche,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "07:30", "18:30"),
  },
  {
    slug: "kidzy-creche-maternelle-la-marsa",
    nom: "Kidzy — Crèche & Maternelle",
    description: "Crèche et jardin d'enfants à La Marsa (derrière Carrefour). Accueil de 2 mois à 6 ans, du lundi au vendredi de 7h30 à 18h30. Programme éducatif structuré, éveil langues, activités créatives.",
    ville: "Tunis", quartier: "La Marsa", adresse: "Cité Jinène Eddounya, derrière Carrefour, La Marsa, 2046",
    phone: "26262122", email: null, website: "https://www.kidzy.tn", facebook: null, instagram: null,
    lat: 36.8750, lng: 10.3180, plan: "premium", category_slug: "education",
    images: IMG.creche,
    hours: [
      { jour: "Lundi", ouvert: true, heure_ouverture: "07:30", heure_fermeture: "18:30" },
      { jour: "Mardi", ouvert: true, heure_ouverture: "07:30", heure_fermeture: "18:30" },
      { jour: "Mercredi", ouvert: true, heure_ouverture: "07:30", heure_fermeture: "18:30" },
      { jour: "Jeudi", ouvert: true, heure_ouverture: "07:30", heure_fermeture: "18:30" },
      { jour: "Vendredi", ouvert: true, heure_ouverture: "07:30", heure_fermeture: "18:30" },
      { jour: "Samedi", ouvert: false, heure_ouverture: "09:00", heure_fermeture: "13:00" },
      { jour: "Dimanche", ouvert: false, heure_ouverture: "09:00", heure_fermeture: "13:00" },
    ],
  },
  {
    slug: "creche-bilingue-la-marsa",
    nom: "Crèche Bilingue La Marsa",
    description: "Crèche bilingue franco-arabe à La Marsa. Accueil dès 4 mois dans un cadre chaleureux. Personnel diplômé en éducation de la petite enfance. Activités d'éveil quotidiennes.",
    ville: "Tunis", quartier: "La Marsa", adresse: "4 Rue Emir Abdelkader, 2070 La Marsa",
    phone: "52888164", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8784, lng: 10.3244, plan: "free", category_slug: "education",
    images: IMG.creche,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi"], "07:30", "18:00"),
  },

  // ══════════════════════════════════════════
  //  LOISIRS
  // ══════════════════════════════════════════
  {
    slug: "jumpark-la-soukra",
    nom: "Jumpark — Parc de Trampolines",
    description: "Le plus grand parc multi-activités de Tunisie sur 2 500 m². Trampolines, Ninja Warrior, laser room, kids parc. À partir de 15 DT/personne. Anniversaires organisés sur place.",
    ville: "Ariana", quartier: "La Soukra", adresse: "Avenue de l'UMA, La Soukra, Ariana",
    phone: "52699996", email: "contact@jumpark.tn", website: "https://jumpark.tn", facebook: "https://www.facebook.com/JumparkTunisie", instagram: null,
    lat: 36.8881, lng: 10.2286, plan: "premium", category_slug: "loisirs",
    images: IMG.trampoline,
    hours: [
      { jour: "Lundi", ouvert: true, heure_ouverture: "16:00", heure_fermeture: "22:00" },
      { jour: "Mardi", ouvert: true, heure_ouverture: "16:00", heure_fermeture: "22:00" },
      { jour: "Mercredi", ouvert: true, heure_ouverture: "14:00", heure_fermeture: "22:00" },
      { jour: "Jeudi", ouvert: true, heure_ouverture: "16:00", heure_fermeture: "22:00" },
      { jour: "Vendredi", ouvert: true, heure_ouverture: "16:00", heure_fermeture: "23:00" },
      { jour: "Samedi", ouvert: true, heure_ouverture: "10:00", heure_fermeture: "23:00" },
      { jour: "Dimanche", ouvert: true, heure_ouverture: "10:00", heure_fermeture: "22:00" },
    ],
  },
  {
    slug: "carthage-land-berges-du-lac",
    nom: "Carthage Land — Berges du Lac",
    description: "Parc d'attractions et aquatique familial au bord du lac de Tunis. 16 manèges, 5 piscines, 17 toboggans. Attractions aquatiques en été. Idéal pour les enfants de 3 à 15 ans.",
    ville: "Tunis", quartier: "Berges du Lac", adresse: "Avenue Cheikh Zayed, Berges du Lac, 1053 Tunis",
    phone: null, email: null, website: "https://tunis.carthageland.com", facebook: null, instagram: null,
    lat: 36.8450, lng: 10.2310, plan: "premium", category_slug: "loisirs",
    images: IMG.parcjeux,
    hours: [
      { jour: "Lundi", ouvert: true, heure_ouverture: "10:00", heure_fermeture: "20:00" },
      { jour: "Mardi", ouvert: true, heure_ouverture: "10:00", heure_fermeture: "20:00" },
      { jour: "Mercredi", ouvert: true, heure_ouverture: "10:00", heure_fermeture: "20:00" },
      { jour: "Jeudi", ouvert: true, heure_ouverture: "10:00", heure_fermeture: "20:00" },
      { jour: "Vendredi", ouvert: true, heure_ouverture: "10:00", heure_fermeture: "21:00" },
      { jour: "Samedi", ouvert: true, heure_ouverture: "10:00", heure_fermeture: "21:00" },
      { jour: "Dimanche", ouvert: true, heure_ouverture: "10:00", heure_fermeture: "20:00" },
    ],
  },
  {
    slug: "le-bowling-du-lac-tunis",
    nom: "Le Bowling du Lac — At Home",
    description: "Complexe de bowling et loisirs au bord du lac de Tunis. Pistes de bowling modernes, billard, jeux d'arcade. Espace anniversaires pour enfants. Bar et restauration sur place.",
    ville: "Tunis", quartier: "Berges du Lac", adresse: "Berges du Lac, Tunis",
    phone: "71960096", email: null, website: null, facebook: "https://www.facebook.com/AtHomeBowlingDuLac", instagram: "https://www.instagram.com/lebowlingdulac/",
    lat: 36.8450, lng: 10.2310, plan: "free", category_slug: "loisirs",
    images: IMG.bowling,
    hours: [
      { jour: "Lundi", ouvert: true, heure_ouverture: "14:00", heure_fermeture: "23:00" },
      { jour: "Mardi", ouvert: true, heure_ouverture: "14:00", heure_fermeture: "23:00" },
      { jour: "Mercredi", ouvert: true, heure_ouverture: "14:00", heure_fermeture: "23:00" },
      { jour: "Jeudi", ouvert: true, heure_ouverture: "14:00", heure_fermeture: "23:00" },
      { jour: "Vendredi", ouvert: true, heure_ouverture: "14:00", heure_fermeture: "00:00" },
      { jour: "Samedi", ouvert: true, heure_ouverture: "11:00", heure_fermeture: "00:00" },
      { jour: "Dimanche", ouvert: true, heure_ouverture: "11:00", heure_fermeture: "23:00" },
    ],
  },
  {
    slug: "olympica-natation-rades",
    nom: "Olympica — École de Natation",
    description: "Club de natation de référence à Radès, Ben Arous. École de natation dès 4 ans. Cours par groupes 3 fois/semaine. Nage sportive, préparation compétitions nationales. 342 enfants inscrits.",
    ville: "Ben Arous", quartier: "Radès", adresse: "Piscine Olympique Radès, Cité National Sportif, BP 18, 2034 Ezzahra, Ben Arous",
    phone: "79325067", email: null, website: "https://www.olympica.tn", facebook: null, instagram: null,
    lat: 36.7769, lng: 10.2772, plan: "premium", category_slug: "loisirs",
    images: IMG.piscine,
    hours: [
      { jour: "Lundi", ouvert: true, heure_ouverture: "17:00", heure_fermeture: "21:30" },
      { jour: "Mardi", ouvert: true, heure_ouverture: "17:00", heure_fermeture: "21:30" },
      { jour: "Mercredi", ouvert: true, heure_ouverture: "14:00", heure_fermeture: "21:30" },
      { jour: "Jeudi", ouvert: true, heure_ouverture: "17:00", heure_fermeture: "21:30" },
      { jour: "Vendredi", ouvert: true, heure_ouverture: "17:00", heure_fermeture: "21:30" },
      { jour: "Samedi", ouvert: true, heure_ouverture: "09:00", heure_fermeture: "18:00" },
      { jour: "Dimanche", ouvert: false, heure_ouverture: "09:00", heure_fermeture: "18:00" },
    ],
  },

  // ══════════════════════════════════════════
  //  ATELIERS & SPORT — Danse
  // ══════════════════════════════════════════
  {
    slug: "urban-dance-ain-zaghouan",
    nom: "Urban Dance Academy — Ain Zaghouan",
    description: "La première académie de danse en Tunisie, fondée par Ala Zrafi. Plus de 1600 étudiants. Danse moderne, breakdance, parkour, hip-hop, danse orientale, contemporaine, africaine. Cours enfants et adultes.",
    ville: "Ariana", quartier: "Ain Zaghouan", adresse: "Centre Amine, Route de la Marsa, 2045 Ain Zaghouan",
    phone: "52024024", email: "contact@urbandance.tn", website: "https://www.urbandance.tn", facebook: "https://www.facebook.com/urbandanceTN", instagram: "https://www.instagram.com/urbandanceaz/",
    lat: 36.9000, lng: 10.2100, plan: "premium", category_slug: "ateliers",
    images: IMG.danse,
    hours: [
      { jour: "Lundi", ouvert: true, heure_ouverture: "10:00", heure_fermeture: "21:00" },
      { jour: "Mardi", ouvert: true, heure_ouverture: "10:00", heure_fermeture: "21:00" },
      { jour: "Mercredi", ouvert: true, heure_ouverture: "10:00", heure_fermeture: "21:00" },
      { jour: "Jeudi", ouvert: true, heure_ouverture: "10:00", heure_fermeture: "21:00" },
      { jour: "Vendredi", ouvert: true, heure_ouverture: "10:00", heure_fermeture: "21:00" },
      { jour: "Samedi", ouvert: true, heure_ouverture: "09:00", heure_fermeture: "18:00" },
      { jour: "Dimanche", ouvert: false, heure_ouverture: "09:00", heure_fermeture: "18:00" },
    ],
  },
  {
    slug: "urban-dance-menzah-5",
    nom: "Urban Dance Academy — Menzah 5",
    description: "Succursale Menzah 5 de la première académie de danse en Tunisie. Près du café Java, La Marsa. Cours de hip-hop, danse moderne, contemporary dance pour tous niveaux dès 5 ans.",
    ville: "Ariana", quartier: "El Menzah 5", adresse: "El Menzah 5, près du café Java, 2008 Ariana",
    phone: "51040404", email: "contact@urbandance.tn", website: "https://www.urbandance.tn", facebook: "https://www.facebook.com/urbandanceTN", instagram: "https://www.instagram.com/urbandancem5/",
    lat: 36.8336, lng: 10.1929, plan: "premium", category_slug: "ateliers",
    images: IMG.danse,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "10:00", "21:00"),
  },
  {
    slug: "ikaa-danse-musique-la-marsa",
    nom: "Ikaa — École de Danse et Musique",
    description: "École fondée en 1991, 30 ans d'expérience. Danse classique, salsa, bachata, contemporain. Musique : piano, chant, théâtre, peinture. Cours enfants dès 4 ans et adultes à La Marsa et Bab Saadoun.",
    ville: "Tunis", quartier: "La Marsa", adresse: "48 Rue Mohamed Beyram El Khames, Cité Les Pins, 2078 La Marsa",
    phone: "26275555", email: null, website: "https://www.ikaa-ecole.com", facebook: "https://www.facebook.com/StudiosIkaa", instagram: null,
    lat: 36.8784, lng: 10.3244, plan: "premium", category_slug: "ateliers",
    images: [...IMG.danse, ...IMG.musique],
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "10:00", "20:00"),
  },

  // ══════════════════════════════════════════
  //  ATELIERS & SPORT — Musique
  // ══════════════════════════════════════════
  {
    slug: "algorythmes-ecole-musique-menzah",
    nom: "Algorythmes — École de Musique",
    description: "École de musique moderne fondée en 2011. Piano, batterie, chant, guitare, violon. Cours de danse : hip-hop, classique, yoga, danse orientale. Succursales El Menzah et La Marsa.",
    ville: "Tunis", quartier: "El Menzah", adresse: "10 Rue Mohamed Ben Taieb, El Menzah, Tunis",
    phone: "71238465", email: null, website: "https://www.algorythmes.art", facebook: null, instagram: null,
    lat: 36.8336, lng: 10.1929, plan: "premium", category_slug: "ateliers",
    images: IMG.musique,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "20:00"),
  },
  {
    slug: "algorythmes-la-marsa",
    nom: "Algorythmes — La Marsa",
    description: "Succursale La Marsa de l'école de musique Algorythmes. Cours de piano, chant, guitare, batterie. Danse classique, hip-hop, yoga. Professeurs diplômés, tous niveaux, enfants et adultes.",
    ville: "Tunis", quartier: "La Marsa", adresse: "28 Rue du Maroc, La Marsa, Tunis",
    phone: null, email: null, website: "https://www.algorythmes.art", facebook: null, instagram: null,
    lat: 36.8784, lng: 10.3244, plan: "free", category_slug: "ateliers",
    images: IMG.musique,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "20:00"),
  },

  // ══════════════════════════════════════════
  //  ATELIERS & SPORT — Arts martiaux
  // ══════════════════════════════════════════
  {
    slug: "karate-kids-la-marsa",
    nom: "Karaté Kids — La Marsa",
    description: "Club de karaté pour enfants et adolescents à La Marsa. Cours à la Maison des Jeunes de La Marsa. Compétitions régionales et nationales. Apprentissage de la discipline et du respect.",
    ville: "Tunis", quartier: "La Marsa", adresse: "Maison des Jeunes, La Marsa",
    phone: "41542372", email: null, website: null, facebook: "https://www.facebook.com/karatekidstunis", instagram: null,
    lat: 36.8784, lng: 10.3244, plan: "free", category_slug: "ateliers",
    images: IMG.artsmartiaux,
    hours: defaultHours(["Mardi","Jeudi","Samedi"], "15:00", "19:00"),
  },
  {
    slug: "power-academy-ariana",
    nom: "Power Academy — Ariana",
    description: "Académie d'arts martiaux à Ariana. Brazilian Jiu Jitsu, wrestling, Muay Thai, MMA. Cours pour enfants dès 6 ans. Ceintures et compétitions. Entraîneurs certifiés et expérimentés.",
    ville: "Ariana", quartier: "Ariana Ville", adresse: "3 Rue Hammadi Fareh, Ariana",
    phone: "97406940", email: null, website: null, facebook: null, instagram: null,
    lat: 36.8625, lng: 10.1956, plan: "free", category_slug: "ateliers",
    images: IMG.artsmartiaux,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "21:00"),
  },

  // ══════════════════════════════════════════
  //  ATELIERS & SPORT — Arts créatifs
  // ══════════════════════════════════════════
  {
    slug: "fann-is-cool-arts-plastiques-ennasr",
    nom: "Fann Is Cool — Arts Plastiques",
    description: "Atelier d'arts plastiques à Ennasr 2. Poterie, sculpture, peinture pour enfants, ados et adultes. Intervenants artistes professionnels. Stages vacances et cours réguliers hebdomadaires.",
    ville: "Ariana", quartier: "Ennasr 2", adresse: "Ennasr 2, Ariana",
    phone: null, email: null, website: null, facebook: null, instagram: null,
    lat: 36.8678, lng: 10.1714, plan: "free", category_slug: "ateliers",
    images: IMG.arts,
    hours: defaultHours(["Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "10:00", "19:00"),
  },

  // ══════════════════════════════════════════
  //  FÊTES & ÉVÉNEMENTS
  // ══════════════════════════════════════════
  {
    slug: "bellezza-event-la-marsa",
    nom: "Bellezza Event — Salle des Fêtes",
    description: "Espace événementiel haut de gamme à La Marsa. Salle Dorée (200 pers.), Salle Blanche (300 pers.), Rooftop avec piscine (80-100 pers.). Mariages, anniversaires, événements d'entreprise.",
    ville: "Tunis", quartier: "La Marsa", adresse: "30 Rue Jaber Ibn Hayen, La Marsa",
    phone: "26127797", email: "bellezza.s.f@gmail.com", website: "https://bellezza-event.com", facebook: "https://www.facebook.com/bellezzamolka", instagram: null,
    lat: 36.8784, lng: 10.3244, plan: "premium", category_slug: "fetes",
    images: IMG.fete,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"], "09:00", "23:00"),
  },
  {
    slug: "tictac-event-anniversaires-enfants",
    nom: "TicTac Event — Anniversaires Enfants",
    description: "Organisation professionnelle d'anniversaires pour enfants en Tunisie. Animation complète, décoration thématique, gâteau personnalisé, photographe, goodies. Thèmes variés : licorne, super-héros, sirène...",
    ville: "Tunis", quartier: "Tunis", adresse: "Grand Tunis",
    phone: null, email: null, website: "https://www.tictacevent.com", facebook: null, instagram: null,
    lat: 36.8188, lng: 10.1658, plan: "free", category_slug: "fetes",
    images: IMG.animation,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"], "09:00", "20:00"),
  },
  {
    slug: "arteco-animation-anniversaire",
    nom: "ARTECO — Animation Anniversaires",
    description: "Spécialiste de l'animation anniversaire enfants à Tunis et Ariana. Magiciens, clowns, maquillage, jeux collectifs, spectacles, marionnettes. Packages complets ou à la carte.",
    ville: "Tunis", quartier: "Tunis / Ariana", adresse: "Grand Tunis",
    phone: null, email: null, website: "https://www.acteur-fete.com/tn/p/arteco-animation-anniversaire-d-enfants-clown-tunis-ariana", facebook: null, instagram: null,
    lat: 36.8188, lng: 10.1658, plan: "free", category_slug: "fetes",
    images: IMG.animation,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"], "09:00", "22:00"),
  },

  // ══════════════════════════════════════════
  //  SHOPPING — Jouets & Puériculture
  // ══════════════════════════════════════════
  {
    slug: "petit-ange-ennasr-jouets-puericulture",
    nom: "Petit Ange Ennasr — Jouets & Puériculture",
    description: "Boutique spécialisée jouets et puériculture à Ennasr 2. Plus de 10 000 références : LEGO, Playmobil, Clementoni, Fisher-Price. Poussettes, sièges auto, lits bébé. Livraison partout en Tunisie.",
    ville: "Ariana", quartier: "Ennasr 2", adresse: "Avenue l'ère nouvelle, Résidence Riadh Ennasr II, Ariana",
    phone: "70831910", email: null, website: "https://ptitange.tn", facebook: "https://www.facebook.com/petit.ange.ennasr", instagram: "https://www.instagram.com/petit_ange_ennasr/",
    lat: 36.8678, lng: 10.1714, plan: "premium", category_slug: "shopping",
    images: IMG.jouets,
    hours: [
      { jour: "Lundi", ouvert: true, heure_ouverture: "09:00", heure_fermeture: "20:00" },
      { jour: "Mardi", ouvert: true, heure_ouverture: "09:00", heure_fermeture: "20:00" },
      { jour: "Mercredi", ouvert: true, heure_ouverture: "09:00", heure_fermeture: "20:00" },
      { jour: "Jeudi", ouvert: true, heure_ouverture: "09:00", heure_fermeture: "20:00" },
      { jour: "Vendredi", ouvert: true, heure_ouverture: "09:00", heure_fermeture: "21:00" },
      { jour: "Samedi", ouvert: true, heure_ouverture: "09:00", heure_fermeture: "21:00" },
      { jour: "Dimanche", ouvert: true, heure_ouverture: "10:00", heure_fermeture: "19:00" },
    ],
  },
  {
    slug: "oxford-city-jouets-educatifs",
    nom: "Oxford City — Jouets Éducatifs",
    description: "Boutique de jouets éducatifs et de loisirs créatifs à Tunis. Jeux de société, puzzles, jouets Montessori, matériel scolaire. Large sélection de jeux pour tous les âges.",
    ville: "Tunis", quartier: "Tunis", adresse: "Tunis",
    phone: "39159999", email: null, website: "https://oxfordcity.tn", facebook: null, instagram: null,
    lat: 36.8188, lng: 10.1658, plan: "free", category_slug: "shopping",
    images: IMG.jouets,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "19:30"),
  },
  {
    slug: "tipirate-store-jouets-bebe",
    nom: "Tipirate Store — Jouets & Articles Bébé",
    description: "Magasin de jouets et articles bébé à Tunis. Jouets 1er âge, jeux éducatifs, sièges auto, parcs, lits bébé. Marques de confiance. Conseil personnalisé pour les parents.",
    ville: "Tunis", quartier: "Tunis", adresse: "Tunis",
    phone: null, email: null, website: "https://www.tipirate-store.tn", facebook: null, instagram: null,
    lat: 36.8188, lng: 10.1658, plan: "free", category_slug: "shopping",
    images: IMG.jouets,
    hours: defaultHours(["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], "09:00", "19:00"),
  },
];

// ─── HANDLER ────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.secret !== "kidsworld-purge-2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build category map
    const { data: cats } = await supabase.from("categories").select("id, slug");
    const catMap: Record<string, string> = {};
    (cats || []).forEach((c: any) => { catMap[c.slug] = c.id; });

    let inserted = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const item of REAL_LISTINGS) {
      const { category_slug, images, hours, ...listingData } = item;
      const category_id = catMap[category_slug];

      if (!category_id) {
        errors.push(`Catégorie inconnue: ${category_slug} (pour ${item.slug})`);
        skipped++;
        continue;
      }

      // Upsert listing
      const { data: upserted, error: upsertErr } = await supabase
        .from("listings")
        .upsert({ ...listingData, category_id, is_active: true }, { onConflict: "slug" })
        .select("id")
        .single();

      if (upsertErr || !upserted) {
        errors.push(`${item.slug}: ${upsertErr?.message || "no id returned"}`);
        continue;
      }

      const lid = upserted.id;

      // Upsert listing_media (photos)
      if (images && images.length > 0) {
        await supabase.from("listing_media").delete().eq("listing_id", lid).eq("type", "image");
        const media = images.map((url, i) => ({ listing_id: lid, url, type: "image", position: i }));
        await supabase.from("listing_media").insert(media);
      }

      // Upsert listing_hours (horaires)
      if (hours && hours.length > 0) {
        await supabase.from("listing_hours").delete().eq("listing_id", lid);
        const hoursToInsert = hours.map((h) => ({ listing_id: lid, ...h }));
        await supabase.from("listing_hours").insert(hoursToInsert);
      }

      inserted++;
    }

    return NextResponse.json({
      ok: true,
      inserted,
      skipped,
      errors,
      total: REAL_LISTINGS.length,
      message: `${inserted} listings insérés/mis à jour avec photos et horaires.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
