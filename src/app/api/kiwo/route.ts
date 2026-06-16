import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PLATFORM_KNOWLEDGE = `
Tu es Kiwo, l'assistant IA de KidsWorld Tunisia. Tu comprends le francais, l'arabe tunisien (darija), l'anglais, les fautes de frappe, abreviations et melanges de langues.

KidsWorld reference tous les services pour enfants en Tunisie : Sante (pediatres, dentistes), Education (ecoles, cours), Loisirs (parcs, piscines), Ateliers (danse, musique, robotique), Fetes (anniversaires), Shopping (vetements, jouets).

Regles :
- Reponds en max 2-3 lignes + listings en cartes
- Utilise le prenom et l'age de l'enfant quand tu les connais
- Pose UNE question si la demande est vague
- Sois chaleureux et precis
`.trim();

// Normalisation : supprime accents, minuscules, apostrophes
function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['‘’`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const CATEGORY_KEYWORDS: Record<string, RegExp> = {
  sante: /pediatr|pedaitr|medecin|docteur|doctor|doc\b|clinic|sante|sants|vaccin|vacin|fievre|fievr|temperature|maladie|malade|otite|dentist|dentsr|dent\b|orl|ophtlmo|ophtalmo|infirmi|urgenc|pharmacie|tbib|sick|ill|fever|health|nurse|consultat/,
  education: /maternell|maternele|garderie|creche|cresh|ecole|scool|school|classe|cours\b|cour\b|lesson|soutien|primair|college|lycee|montesori|montessori|bilingue|bilingu|anglais|english|francais|french|arabe|arabic|math|langu|formation|apprentisag|tuteur|tutor|prof\b/,
  loisirs: /piscine|picine|natation|nataion|swim|trampolin|trampo|karting|bowling|bowlin|parc|jeux\b|jeu\b|play|fun|loisir|indoor|sorties|balade|parcours|accrobranche|kart|manege|lazer|laser|escape|cinema|cine\b|aqua/,
  ateliers: /danse|ballet|hip.?hop|musique|music|guitar|guitare|piano|violin|chant|dessin|peintur|robotique|robot\b|scratch|coding|code\b|programm|karate|judo|taekwondo|sport\b|foot\b|football|basket|tennis|art\b|atelier|club\b|briques|lego|theatre/,
  fetes: /anniversair|anniverssair|aniversair|birthday|bday|fete\b|fetes\b|party\b|partie\b|salle|animation|animat|gateau|cake\b|decor|decoration|celebr|clown|spectacle|magicien|gonflable|3id|hafla|invitation|ballon|bapteme|communion/,
  shopping: /vetement|vetments|habit\b|habits\b|fringue|tenu\b|tenue|acheter|achat\b|magasin|boutique|shopping|shop\b|jouet|toys?|librairie|librair|puericulture|puericult|poussett|landau|bebe\b|baby\b|cadeau|cadeaux|gift\b|hwayej|souk\b|linge|sac\b|chaussur|baskets?|veste|pantalon|robe\b|pyjama|uniforme|buy\b/,
};

const CITY_MAP: Array<[RegExp, string]> = [
  [/\bla marsa\b|marsa\b/, "la marsa"],
  [/\bariana\b|ariena\b/, "ariana"],
  [/\bsousse\b|suse\b/, "sousse"],
  [/\bsfax\b|sfex\b/, "sfax"],
  [/\bnabeul\b|nabuel\b/, "nabeul"],
  [/\bhammamet\b|hamamet\b/, "hammamet"],
  [/\bbizerte\b|bizert\b/, "bizerte"],
  [/\bmonastr\b|monastir\b/, "monastir"],
  [/\bmanouba\b/, "manouba"],
  [/\btunis\b|tnis\b/, "tunis"],
];

function detectCategory(text: string): string | undefined {
  const n = norm(text);
  for (const [cat, regex] of Object.entries(CATEGORY_KEYWORDS)) {
    if (regex.test(n)) return cat;
  }
  return undefined;
}

function detectCity(text: string): string | undefined {
  const n = norm(text);
  for (const [regex, city] of CITY_MAP) {
    if (regex.test(n)) return city;
  }
  return undefined;
}

function extractSearchIntent(
  message: string,
  history: Array<{ role: string; content: string }>
): { query: string; category?: string; ville?: string } {
  // Use full conversation context for detection
  const fullContext = [...history.map((h) => h.content), message].join(" ");

  const category = detectCategory(fullContext);
  const ville = detectCity(fullContext);

  const stopWords = new Set([
    "je", "tu", "il", "nous", "vous", "ils", "on",
    "veux", "voudrai", "souhaite", "cherche", "pour", "mon", "ma", "mes",
    "un", "une", "des", "les", "en", "le", "la", "du", "au",
    "bonjour", "bonsoir", "salam", "salut", "coucou", "hello", "hi",
    "acheter", "trouver", "avoir", "voir", "connais", "sais",
    "stp", "svp", "merci", "please",
    "que", "qui", "quoi", "quel", "quelle", "comment", "est",
  ]);

  const words = norm(message)
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
  const query = words.slice(0, 5).join(" ");

  return { query, category, ville };
}

async function searchListings(
  query: string,
  category?: string,
  ville?: string,
  limit = 4
) {
  try {
    let q = supabase
      .from("listings_with_stats")
      .select("id, nom, slug, category_emoji, ville, note_moyenne, plan, category_slug")
      .eq("is_active", true);

    if (category) q = q.eq("category_slug", category);
    if (ville) q = q.ilike("ville", `%${ville}%`);
    if (query) q = q.or(`nom.ilike.%${query}%,description.ilike.%${query}%`);

    const { data } = await q
      .order("plan", { ascending: false })
      .order("note_moyenne", { ascending: false })
      .limit(limit);

    return (data || []).map((l: any) => ({
      nom: l.nom,
      slug: l.slug,
      emoji: l.category_emoji || "📍",
      ville: l.ville || "Tunis",
      note_moyenne: l.note_moyenne || 0,
    }));
  } catch {
    return [];
  }
}

// Fallback intelligent basé sur le contexte complet (message + historique)
function generateSmartReply(
  message: string,
  history: Array<{ role: string; content: string }>,
  children: any[]
): string {
  const fullContext = norm([...history.map((h) => h.content), message].join(" "));
  const n = norm(message);

  const child = children[0];
  const childName = child ? ` pour **${child.surnom}**` : "";
  const childAge = child ? ` (${child.age})` : "";
  const firstName = child ? child.surnom : "";

  const detected = detectCategory(fullContext) || detectCate