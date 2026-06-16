import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PLATFORM_KNOWLEDGE = `
Tu es Kiwo 🐧, l'assistant IA de KidsWorld Tunisia — le premier annuaire digital pour parents en Tunisie.

## La plateforme KidsWorld
KidsWorld référence tous les services et activités pour enfants en Tunisie, organisés en 6 catégories :
- 🏥 **Santé** (slug: sante) : pédiatres, médecins, cliniques, dentistes, ORL, ophtalmos
- 🎓 **Éducation** (slug: education) : écoles maternelles, primaires, bilingues, Montessori, cours de langue, soutien scolaire
- 🎪 **Loisirs** (slug: loisirs) : parcs de jeux, trampolines, karting, piscines, bowling, espaces indoor
- 🎨 **Ateliers** (slug: ateliers) : dessin, musique, danse, robotique, Scratch, programmation, sports
- 🎂 **Fêtes** (slug: fetes) : organisateurs d'anniversaires, salles de fêtes, animations, décoration, gâteaux
- 🛍️ **Shopping** (slug: shopping) : magasins jouets, vêtements enfants, puériculture, librairies jeunesse

## Villes couvertes
Tunis, La Marsa, Ariana, Ben Arous, Manouba, Sousse, Sfax, Bizerte, Nabeul, Hammamet, Monastir

## Ton rôle
Tu comprends le français, l'arabe tunisien (darija), et l'anglais. Tu comprends aussi les fautes de frappe, abréviations et mélanges de langues.

## Règles de conversation
1. **Pose des questions progressives** : si la demande est vague, pose UNE question ciblée
2. **Connais les enfants** : utilise le contexte (âge, prénom, sexe) pour personnaliser
3. **Sois précis** : propose toujours des listings concrets et adaptés
4. **Sois chaleureux** : parle comme un ami expert
5. **Langue** : réponds dans la langue du parent (français, arabe, ou les deux)
6. **Longueur** : réponses courtes et percutantes, max 3-4 lignes + listings
7. **Typos** : comprends les fautes (vetement=vêtement, pedaitre=pédiatre, anniverssaire=anniversaire)

## Format de réponse
- Texte court avec emojis pertinents
- Maximum 150 mots
- Ne liste pas les établissements — ils seront affichés en cartes
- Si besoin de plus d'info : pose UNE seule question précise
`.trim();

// ─── Normalisation universelle ───────────────────────────────────────────────
function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")   // remove accents
    .toLowerCase()
    .replace(/[''`]/g, "")             // remove apostrophes
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Dictionnaire multi-langue par catégorie ─────────────────────────────────
// Couvre : français (avec/sans accents, fautes fréquentes), arabe tunisien (darija),
// translittération arabe, anglais, abréviations
const CATEGORY_KEYWORDS: Record<string, RegExp> = {
  sante: /pediatr|pedaitr|medecin|docteur|doctor|doc\b|clinic|sante|sants|vaccin|vacin|fievre|fievr|maladie|malade|otite|dentisr|dentiste|dent\b|orl|ophtlmo|ophtalmo|infirmi|urgenc|pharmacie|tbib|طبيب|دكتور|عيادة|مريض|حمى|مرض|سنان|sick|ill|fever|health|nurse|consultat/,

  education: /maternell|maternele|garderie|creche|cresh|ecole|scool|school|classe|cours\b|cour\b|lesson|soutien|primair|college|lycee|montesori|montessori|bilingue|bilingu|anglais|english|francais|french|arabe|arabic|math|langu|formation|apprentissag|aprentisag|مدرسة|روضة|دروس|تعليم|تدريس|تعلم|مدرس|معلم|فرنسية|انجليزية|رياضيات|tuteur|tutor|prof\b/,

  loisirs: /piscine|picine|natation|nataion|swim|trampolin|trampo|karting|bowling|bowlin|parc|jeux\b|jeu\b|play|fun|loisir|indoor|sorties|balade|parcours|accrobranche|kart|manege|mlahi|ملاهي|بحر|مسبح|سباحة|parc|manège|lazer|laser|escape|cinema|cine\b|aqua/,

  ateliers: /danse|danse|ballet|hip.?hop|musique|music|guitar|guitare|piano|violin|chant|dessins?|peintur|peinture|robotique|robot\b|scratch|coding|code\b|programm|karate|judo|taekwondo|sport\b|foot\b|football|basket|tennis|art\b|atelier|club\b|رياضة|موسيقى|رسم|كاراتي|جودو|رقص|فن|briques|lego|theatre|theatre/,

  fetes: /anniversair|anniverssair|aniversair|birthday|bday|fete\b|fetes\b|party\b|partie\b|salle|animation|animat|gateau|cake\b|decor|decoration|celebr|clown|spectacle|magicien|gonflable|عيد ميلاد|حفلة|عيد|مناسبة|تخرج|3id|hafla|invitation|ballon|bapteme|communion/,

  shopping: /vetement|vetments|habit\b|habits\b|fringue|tenu\b|tenue|acheter|achat\b|magasin|boutique|shopping|shop\b|jouet|toys?|librairie|librair|puericulture|puericult|poussett|landau|bebe\b|baby\b|cadeau|cadeaux|gift\b|هواية|ملابس|hwayej|حوايج|بازار|souk\b|سوق|خيوط|linge|habit|sac\b|chaussur|chausures|baskets?|veste|pantalon|robe\b|pyjama|uniforme|uniforn|acheter|buy\b|achet/,
};

// ─── Villes avec variantes ───────────────────────────────────────────────────
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

// ─── Extraction de l'intention ───────────────────────────────────────────────
function extractSearchIntent(message: string, history: Array<{ role: string; content: string }>): {
  query: string;
  category?: string;
  ville?: string;
} {
  const fullContext = [...history.map(h => h.content), message].join(" ");

  const category = detectCategory(fullContext);
  const ville = detectCity(fullContext);

  // Build clean search query (remove noise words)
  const stopWords = new Set([
    "je", "tu", "il", "nous", "vous", "ils", "on",
    "veux", "voudrai", "souhaite", "cherche", "pour", "mon", "ma", "mes",
    "un", "une", "des", "les", "en", "le", "la", "du", "au",
    "bonjour", "bonsoir", "salam", "salut", "coucou", "hello", "hi",
    "acheter", "trouver", "avoir", "voir", "connais", "sais",
    "stp", "svp", "merci", "please", "thnx",
    "que", "qui", "quoi", "quel", "quelle", "comment", "ou", "est",
  ]);

  const words = norm(message)
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
  const query = words.slice(0, 5).join(" ");

  return { query, category, ville };
}

// ─── Recherche listings ───────────────────────────────────────────────────────
async function searchListings(query: string, category?: string, ville?: string, limit = 5) {
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

// ─── Réponse intelligente fallback ───────────────────────────────────────────
function generateSmartReply(message: string, children: any[]): string {
  const n = norm(message);
  const childName = children.length > 0 ? ` pour **${children[0].surnom}**` : "";
  const childAge = children.length > 0 ? ` (${children[0].age})` : "";
  const firstName = children.length > 0 ? children[0].surnom : "";

  // Santé
  if (/fievr|febr|temperature|chaud|39|40|malade|sick|مريض|حمى|tbib/.test(n)) {
    return `🌡️ Si la fièvre${childName}${childAge} dépasse **38.5°C**, donne du paracétamol (15mg/kg) toutes les 6h. Au-dessus de **40°C** ou si ça dure plus de 48h : consultation urgente ! Voici les pédiatres disponibles :`;
  }
  if (/dent|dentis|snan/.test(n)) {
    return `🦷 Pour un dentiste pédiatrique${childName}, voici les meilleurs en Tunisie :`;
  }
  if (/pediatr|tbib|medecin|docteur|doctor|طبيب|دكتور/.test(n)) {
    return `🏥 Je te trouve un pédiatre${childName}${childAge}. Voici les disponibles :`;
  }
  if (/vaccin|vacin/.test(n)) {
    return `💉 Pour le calendrier vaccinal${childName}${childAge}, voici les pédiatres spécialisés :`;
  }

  // Education
  if (/maternell|creche|garderie|rouda|روضة/.test(n)) {
    return `🏫 Pour une maternelle${childName}${childAge}, les critères clés : ratio élèves/encadrant, pédagogie, proximité. Voici ce qu'on a :`;
  }
  if (/ecole|school|scool|primair|مدرسة/.test(n)) {
    return `📖 Pour une école${childName}${childAge}, voici les meilleures options :`;
  }
  if (/anglais|english|francais|french|arabe|arabic|cours|lesson|soutien|math/.test(n)) {
    return `📚 Super${firstName ? ` pour ${firstName}` : ""} ! Dans quelle ville et à quel niveau ? Voici les centres de cours disponibles :`;
  }

  // Fêtes
  if (/anniversair|birthday|bday|3id milad|عيد ميلاد|party|hafla/.test(n)) {
    return `🎂 Super projet${childName} ! Voici les meilleurs organisateurs d'anniversaires en Tunisie :`;
  }

  // Loisirs
  if (/piscine|picine|natation|swim|bhar|مسبح/.test(n)) {
    return `🏊 La natation${childName ? ` pour ${firstName}` : ""} c'est excellent pour le développement ! Voici les clubs et piscines :`;
  }
  if (/trampolin|trampo|saut|jump/.test(n)) {
    return `🤸 Le trampoline${childName ? ` pour ${firstName}` : ""}, parfait pour dépenser l'énergie ! Voici les parcs :`;
  }
  if (/karting|kart/.test(n)) {
    return `🏎️ Pour le karting${childName}, voici les pistes disponibles :`;
  }
  if (/bowling/.test(n)) {
    return `🎳 Pour le bowling${childName}, voici les salles :`;
  }

  // Ateliers
  if (/danse|ballet|dance|رقص/.test(n)) {
    return `💃 La danse développe la coordination et la confiance en soi${childName} ! Voici les cours :`;
  }
  if (/musique|music|piano|guitar|violin|موسيقى/.test(n)) {
    return `🎵 La musique, un super choix${childName} ! Voici les écoles de musique :`;
  }
  if (/robotique|robot|scratch|coding|programm/.test(n)) {
    return `🤖 Excellent pour préparer l'avenir${childName} ! Voici les ateliers robotique et coding :`;
  }
  if (/karate|judo|sport de combat|arts martiaux|كاراتي/.test(n)) {
    return `🥋 Les arts martiaux, discipline et respect garantis${childName} ! Voici les clubs :`;
  }
  if (/foot|football|basket|tennis/.test(n)) {
    return `⚽ Pour le sport${childName}, voici les clubs disponibles :`;
  }
  if (/dessin|peintur|art|رسم/.test(n)) {
    return `🎨 Les ateliers créatifs, super pour l'éveil${childName} ! Voici les options :`;
  }

  // Shopping
  if (/vetement|habit|fringue|tenue|malbas|ملابس|hwayej|حوايج|clothes|buy|achat|acheter|magasin|boutique|jouet|toy/.test(n)) {
    return `🛍️ Pour faire du shopping${childName}${childAge}, voici les meilleures boutiques pour enfants :`;
  }

  // Activités génériques
  if (/activit|sortie|week.?end|loisir|quoi faire|كيفاش/.test(n)) {
    return `🎨 Plein de belles activités${childName} en Tunisie ! Dis-moi l'âge et la ville pour affiner. En attendant :`;
  }

  // Generic with child context
  if (children.length > 0) {
    return `🐧 Bonjour ! Je suis là pour aider avec **${children.map(c => c.surnom).join(" et ")}** ! Dis-moi ce que tu cherches : activité, médecin, école, shopping... Je propose les meilleures options en Tunisie !`;
  }

  return `🐧 Je suis là pour t'aider ! Dis-moi ce que tu cherches pour ton enfant — activité, médecin, école, fête, shopping... Je propose les meilleures options en Tunisie.`;
}

// ─── Route principale ─────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { message, history = [], childrenContext = [] } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ reply: "Dis-moi quelque chose, je t'écoute ! 🐧" });
    }

    // Build children context string
    let childrenStr = "";
    if (childrenContext.length > 0) {
      childrenStr = "\n\n## Enfants du parent\n" + childrenContext.map((c: any) =>
        `- ${c.surnom} : ${c.age} (${c.sexe})`
      ).join("\n");
    }

    const systemPrompt = PLATFORM_KNOWLEDGE + childrenStr;

    let reply = "";

    // Try Claude API first
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
      const messages = [
        ...history.slice(-8).map((h: any) => ({
          role: h.role === "kiwo" ? "assistant" : "user",
          content: h.content,
        })),
        { role: "user", content: message },
      ];

      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 400,
            system: systemPrompt,
            messages,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          reply = data.content?.[0]?.text || "";
        }
      } catch { /* fallback below */ }
    }

    // Fallback smart keyword reply
    if (!reply) {
      reply = generateSmartReply(message, childrenContext);
    }

    // Search listings with smart intent detection
    const { query, category, ville } = extractSearchIntent(message, history);
    const listings = await searchListings(query || "", category, ville, 4);

    return NextResponse.json({ reply, listings });
  } catch (err) {
    console.error("Kiwo error:", err);
    return NextResponse.json({
      reply: "Désolé, une petite erreur. Réessaie ! 🐧",
      listings: [],
    });
  }
}
