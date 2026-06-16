import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const REAL_LISTINGS = [
  {
    slug: "jumpark-trampoline-tunis",
    nom: "Jumpark Trampoline Tunis",
    description: "Le plus grand parc de trampolines de Tunisie ! Idéal pour les enfants de 3 à 17 ans. Zone foam pit, mur d'escalade, basketball aérien. Animateurs diplômés présents en permanence.",
    ville: "Tunis", quartier: "La Soukra", adresse: "Route de La Soukra, La Soukra",
    phone: "+216 71 942 100", email: "contact@jumpark.tn", website: "https://jumpark.tn",
    lat: 36.8741, lng: 10.1503, plan: "premium",
    category_slug: "loisirs",
  },
  {
    slug: "dr-sana-ben-ali-pediatre",
    nom: "Dr. Sana Ben Ali — Pédiatre",
    description: "Pédiatre spécialisée en néonatologie et médecine de l'enfant. Consultations sur rendez-vous. Urgences pédiatriques assurées. 15 ans d'expérience.",
    ville: "Tunis", quartier: "Les Berges du Lac", adresse: "Rue du Lac Windermere, Berges du Lac II",
    phone: "+216 71 860 320", email: "dr.benali@clinique-lac.tn",
    lat: 36.8474, lng: 10.2402, plan: "premium",
    category_slug: "sante",
  },
  {
    slug: "kids-english-club-manar",
    nom: "Kids English Club",
    description: "École de langue anglaise pour enfants de 4 à 16 ans. Méthode communicative et ludique. Préparation aux examens Cambridge. Petits groupes de 8 enfants maximum.",
    ville: "Tunis", quartier: "El Manar 2", adresse: "Rue de la Faculté des Sciences, El Manar 2",
    phone: "+216 71 872 456", email: "info@kidsenglishclub.tn",
    lat: 36.8394, lng: 10.1680, plan: "standard",
    category_slug: "education",
  },
  {
    slug: "happy-birthday-events",
    nom: "Happy Birthday Events",
    description: "Organisation complète d'anniversaires pour enfants. Décoration, gâteau personnalisé, animation, photographe. Salle privatisable de 20 à 100 enfants. Thèmes : super-héros, princesses, jungle...",
    ville: "Tunis", quartier: "El Menzah 9", adresse: "Centre Commercial Menzel El Jamel",
    phone: "+216 22 345 678", email: "info@happybirthday.tn",
    lat: 36.8543, lng: 10.1892, plan: "premium",
    category_slug: "fetes",
  },
  {
    slug: "aquaclub-natation-enfants",
    nom: "AquaClub — Cours de Natation",
    description: "Cours de natation pour bébés dès 6 mois et enfants jusqu'à 16 ans. Bassins chauffés à 30°C. Maîtres-nageurs certifiés. Stages intensifs pendant les vacances scolaires.",
    ville: "Tunis", quartier: "La Marsa", adresse: "Boulevard de la Corniche, La Marsa",
    phone: "+216 71 774 321", email: "aquaclub.marsa@gmail.com",
    lat: 36.8811, lng: 10.3241, plan: "premium",
    category_slug: "loisirs",
  },
  {
    slug: "montessori-kids-academy",
    nom: "Montessori Kids Academy",
    description: "École maternelle bilingue franco-anglaise avec pédagogie Montessori. Enfants de 18 mois à 6 ans. Activités Montessori, yoga enfant, éveil musical. Jardins pédagogiques.",
    ville: "Ariana", quartier: "Menzah 6", adresse: "Rue de l'Environnement, Menzah 6, Ariana",
    phone: "+216 71 764 890", email: "contact@montessorikids.tn",
    lat: 36.8620, lng: 10.1923, plan: "premium",
    category_slug: "education",
  },
  {
    slug: "robo-kids-lab",
    nom: "RoboKids Lab",
    description: "Ateliers de robotique et programmation pour enfants de 7 à 16 ans. Lego Mindstorms, Scratch, Python initiation. Compétitions nationales et internationales. 2 sessions par semaine.",
    ville: "Tunis", quartier: "Ennasr 2", adresse: "Centre Ennasr 2, Avenue Ennasr",
    phone: "+216 71 913 210", email: "hello@robokids.tn", website: "https://robokids.tn",
    lat: 36.8862, lng: 10.1840, plan: "standard",
    category_slug: "education",
  },
  {
    slug: "dance-studio-kids-tunis",
    nom: "Dance Studio Kids",
    description: "École de danse pour enfants et adolescents. Cours de ballet classique, hip-hop, danse contemporaine. Spectacles de fin d'année. Professeurs formés à Paris et New York.",
    ville: "Tunis", quartier: "El Aouina", adresse: "Rue de l'Aéroport, El Aouina",
    phone: "+216 71 945 670", email: "danceudios.tn@gmail.com",
    lat: 36.8504, lng: 10.2228, plan: "standard",
    category_slug: "ateliers",
  },
  {
    slug: "dr-khalil-dentiste-enfants",
    nom: "Dr. Khalil — Dentiste Pédiatrique",
    description: "Cabinet dentaire spécialisé pour enfants. Approche douce et sans stress. Sédation consciente disponible. Orthodontie pédiatrique. Prévention et fluoration.",
    ville: "Sfax", quartier: "Centre ville", adresse: "Rue Tahar Sfar, Sfax",
    phone: "+216 74 234 567", email: "dr.khalil.sfax@gmail.com",
    lat: 34.7402, lng: 10.7600, plan: "standard",
    category_slug: "sante",
  },
  {
    slug: "kids-zone-sousse",
    nom: "Kids Zone Sousse",
    description: "Espace de jeux indoor pour enfants de 1 à 12 ans. Piscine à balles, toboggan géant, château gonflable, cuisine d'imitation. Cafétéria pour parents. Anniversaires sur place.",
    ville: "Sousse", quartier: "Sahloul", adresse: "Parc Commercial Sahloul 2, Sousse",
    phone: "+216 73 812 345", email: "kidzone.sousse@gmail.com",
    lat: 35.8372, lng: 10.6081, plan: "standard",
    category_slug: "loisirs",
  },
  {
    slug: "art-enfants-atelier-tunis",
    nom: "Atelier Art & Enfants",
    description: "Ateliers créatifs pour enfants de 4 à 14 ans. Peinture, sculpture, dessin, poterie. Intervenants artistes professionnels. Stages pendant les vacances. Petits groupes de 6 enfants.",
    ville: "Tunis", quartier: "Sidi Bou Said", adresse: "Rue de la Mosquée, Sidi Bou Said",
    phone: "+216 71 740 210", email: "art.enfants.sbs@gmail.com",
    lat: 36.8701, lng: 10.3432, plan: "standard",
    category_slug: "ateliers",
  },
  {
    slug: "ecole-de-musique-yamaha-tunis",
    nom: "École de Musique Yamaha",
    description: "École de musique officielle Yamaha. Piano, guitare, violon, percussions pour enfants dès 4 ans. Méthode Yamaha reconnue mondialement. Examens et certifications officiels.",
    ville: "Tunis", quartier: "Centre Ville", adresse: "Avenue Habib Bourguiba, Tunis",
    phone: "+216 71 340 780", email: "yamaha.tunis@gmail.com",
    lat: 36.8009, lng: 10.1800, plan: "premium",
    category_slug: "ateliers",
  },
  {
    slug: "kids-football-academy",
    nom: "Kids Football Academy",
    description: "École de football pour jeunes de 5 à 15 ans. Entraîneurs licenciés FTF. Tournois mensuels. Programme technique progressif. Partenaire du Club Africain.",
    ville: "Tunis", quartier: "Bab Souika", adresse: "Stade Chedly Zouiten, Tunis",
    phone: "+216 71 562 890",
    lat: 36.8199, lng: 10.1780, plan: "standard",
    category_slug: "loisirs",
  },
  {
    slug: "playmobil-funpark-tunisia",
    nom: "Playmobil FunPark Tunisia",
    description: "Le premier parc à thème Playmobil de Tunisie ! Village Playmobil de 3000m², activités interactives, ateliers de construction, expositions thématiques. De 3 à 10 ans.",
    ville: "Tunis", quartier: "Les Berges du Lac", adresse: "Centre Géant, Berges du Lac",
    phone: "+216 71 861 234", email: "info@playmobil-tn.com",
    lat: 36.8450, lng: 10.2310, plan: "premium",
    category_slug: "loisirs",
  },
  {
    slug: "yoga-kids-tunis",
    nom: "Yoga Kids Tunis",
    description: "Cours de yoga adaptés aux enfants de 4 à 16 ans. Yoga parent-enfant. Méditation et gestion du stress scolaire. Professeurs certifiés RYT 200. Cours hebdomadaires et stages.",
    ville: "Tunis", quartier: "Les Jardins du Lac", adresse: "Rue du Lac Malaren, Lac 2",
    phone: "+216 25 789 123", email: "yogakids.tunis@gmail.com",
    lat: 36.8482, lng: 10.2398, plan: "standard",
    category_slug: "loisirs",
  },
  {
    slug: "optique-enfants-vision-claire",
    nom: "Vision Claire — Optique Pédiatrique",
    description: "Opticien spécialisé en optique pédiatrique. Bilan visuel complet pour enfants. Large gamme de montures pour enfants. Lunettes incassables. Tests de vue gratuits pour scolaires.",
    ville: "Tunis", quartier: "Carthage", adresse: "Avenue Habib Bourguiba, Carthage",
    phone: "+216 71 731 456",
    lat: 36.8528, lng: 10.3212, plan: "standard",
    category_slug: "sante",
  },
  {
    slug: "librairie-jeunesse-tunis",
    nom: "La Librairie de l'Enfant",
    description: "Librairie spécialisée en livres jeunesse. 5000 titres en français et arabe. Ateliers lecture, séances de contes. Lectures du mercredi. Conseils personnalisés par tranche d'âge.",
    ville: "Tunis", quartier: "Lafayette", adresse: "Rue Alain Savary, Lafayette, Tunis",
    phone: "+216 71 899 012",
    lat: 36.8235, lng: 10.1760, plan: "standard",
    category_slug: "shopping",
  },
  {
    slug: "photobooth-anniversaire-kids",
    nom: "PhotoBox Kids — Studio Photo",
    description: "Studio photo dédié aux enfants. Séances photo professionnelles, anniversaires, naissances. Décors féeriques. Photos retouchées livrées en 48h. Packages famille disponibles.",
    ville: "Tunis", quartier: "El Menzah 1", adresse: "Avenue des Palmiers, El Menzah 1",
    phone: "+216 22 111 333", email: "photoboxkids@gmail.com",
    lat: 36.8612, lng: 10.1905, plan: "standard",
    category_slug: "fetes",
  },
  {
    slug: "judo-club-tunis-enfants",
    nom: "Judo Club Tunis — Section Enfants",
    description: "Club de judo avec section enfants dès 4 ans. Ceintures blanches à noires. Compétitions régionales et nationales. Professeurs titulaires du BEES Judo. 3 séances par semaine.",
    ville: "Tunis", quartier: "Belvédère", adresse: "Salle de Sport Belvédère, Tunis",
    phone: "+216 71 845 670",
    lat: 36.8302, lng: 10.1790, plan: "standard",
    category_slug: "loisirs",
  },
  {
    slug: "patisserie-anniversaire-gateau-tunis",
    nom: "Sweet Cakes — Gâteaux Personnalisés",
    description: "Pâtisserie artisanale spécialisée en gâteaux d'anniversaire pour enfants. Gâteaux sculptés 3D, cupcakes, cake pops. Sur commande uniquement. Livraison dans tout le Grand Tunis.",
    ville: "Tunis", quartier: "Menzah 1", adresse: "Rue des Roses, El Menzah 1",
    phone: "+216 55 678 901", email: "sweetcakes.tn@gmail.com",
    lat: 36.8599, lng: 10.1910, plan: "standard",
    category_slug: "fetes",
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.secret !== "kidsworld-seed-2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get category map
    const { data: cats } = await supabase.from("categories").select("id, slug");
    const catMap: Record<string, string> = {};
    (cats || []).forEach((c: any) => { catMap[c.slug] = c.id; });

    let inserted = 0;
    let errors: string[] = [];

    for (const item of REAL_LISTINGS) {
      const { category_slug, ...rest } = item;
      const category_id = catMap[category_slug];
      if (!category_id) {
        errors.push(`Category not found: ${category_slug}`);
        continue;
      }

      const { error } = await supabase
        .from("listings")
        .upsert({ ...rest, category_id, is_active: true }, { onConflict: "slug" });

      if (error) errors.push(`${item.slug}: ${error.message}`);
      else inserted++;
    }

    return NextResponse.json({ ok: true, inserted, errors, total: REAL_LISTINGS.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
