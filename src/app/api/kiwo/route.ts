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
Tu es un assistant bienveillant et expert qui aide les parents à trouver les meilleurs services pour leurs enfants en Tunisie.

## Règles de conversation
1. **Pose des questions progressives** : si la demande est vague, pose UNE question ciblée pour mieux comprendre
2. **Connais les enfants** : utilise le contexte des enfants du parent (âge, prénom, sexe) pour personnaliser les réponses
3. **Sois précis** : propose toujours des listings concrets et adaptés
4. **Sois chaleureux** : parle comme un ami expert, pas comme un robot
5. **Langue** : réponds en français (ou en arabe si le parent écrit en arabe)
6. **Longueur** : réponses courtes et percutantes, max 3-4 lignes de texte + listings

## Format de réponse
- Texte court et sympathique avec emojis pertinents
- Maximum 150 mots de texte pur
- Ne liste pas les établissements dans le texte — ils seront affichés comme cartes séparées
- Si tu as besoin de plus d'info : pose UNE seule question précise
- N'invente jamais de listings — dis seulement que tu vas chercher

## Questions types à poser selon le contexte
- Âge de l'enfant (si non fourni et pertinent)
- Ville / quartier préféré
- Budget approximatif (pour les fêtes/activités premium)
- Disponibilités (soir/weekend pour ateliers)
- Niveau (débutant/intermédiaire pour sports/arts)
`.trim();

async function searchListings(query: string, category?: string, ville?: string, limit = 5) {
  try {
    let q = supabase
      .from("listings_with_stats")
      .select("id, nom, slug, category_emoji, ville, note_moyenne, plan, category_slug")
      .eq("is_active", true);

    if (category) {
      q = q.eq("category_slug", category);
    }

    if (ville) {
      q = q.ilike("ville", `%${ville}%`);
    }

    if (query) {
      q = q.or(`nom.ilike.%${query}%,description.ilike.%${query}%`);
    }

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

function extractSearchIntent(message: string, history: Array<{ role: string; content: string }>): {
  query: string;
  category?: string;
  ville?: string;
} {
  const lower = message.toLowerCase();
  const fullContext = history.map(h => h.content).join(" ").toLowerCase() + " " + lower;

  // Normalize accents for matching
  const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const normContext = normalize(fullContext);

  // Category detection (accent-insensitive)
  let category: string | undefined;
  if (/pediatre|medecin|docteur|clinique|sante|vaccin|fievre|otite|dentiste|orl/.test(normContext)) category = "sante";
  else if (/maternelle|ecole|cours|anglais|langue|soutien|primaire|montessori|garderie|creche/.test(normContext)) category = "education";
  else if (/piscine|trampoline|karting|bowling|indoor|parc|jeux|natation|loisir/.test(normContext)) category = "loisirs";
  else if (/danse|musique|dessin|robotique|scratch|karate|judo|sport|atelier/.test(normContext)) category = "ateliers";
  else if (/anniversaire|fete|salle|animation|gateau|decoration/.test(normContext)) category = "fetes";
  else if (/jouet|vetement|habit|acheter|shopping|magasin|boutique|librairie|puericulture|fringue|tenue/.test(normContext)) category = "shopping";

  // City detection
  let ville: string | undefined;
  const cities = ["tunis", "la marsa", "ariana", "sousse", "sfax", "nabeul", "hammamet", "bizerte", "monastir", "manouba"];
  for (const city of cities) {
    if (fullContext.includes(city)) { ville = city; break; }
  }

  // Build search query
  const stopWords = ["je", "veux", "pour", "mon", "ma", "mes", "un", "une", "des", "les", "en", "le", "la", "bonjour", "salut", "cherche", "acheter", "trouver", "avoir"];
  const words = normalize(lower).split(/\s+/).filter(w => w.length > 2 && !stopWords.includes(w));
  const query = words.slice(0, 4).join(" ");

  return { query, category, ville };
}

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

    // Try Claude API
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    let reply = "";

    if (anthropicKey) {
      // Build messages for Claude
      const messages = [
        ...history.slice(-8).map((h: any) => ({
          role: h.role === "kiwo" ? "assistant" : "user",
          content: h.content,
        })),
        { role: "user", content: message },
      ];

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
    }

    // Fallback to smart keyword-based if no API key or failed
    if (!reply) {
      reply = generateSmartReply(message, childrenContext);
    }

    // Search for relevant listings
    const { query, category, ville } = extractSearchIntent(message, history);
    const listings = await searchListings(query || category || "enfant", category, ville, 4);

    return NextResponse.json({ reply, listings });
  } catch (err) {
    console.error("Kiwo error:", err);
    return NextResponse.json({
      reply: "Désolé, une petite erreur s'est produite. Réessaie ! 🐧",
      listings: [],
    });
  }
}

function generateSmartReply(message: string, children: any[]): string {
  const lower = message.toLowerCase();
  const childName = children.length > 0 ? ` pour ${children[0].surnom}` : "";
  const childAge = children.length > 0 ? ` (${children[0].age})` : "";

  // Health
  if (/fièvre|temperature|chaud/.test(lower)) {
    return `🌡️ Pour une fièvre${childName}${childAge}, si elle dépasse 38.5°C, donne du paracétamol (15mg/kg) et surveille de près. Au-dessus de 40°C : consultation urgente ! Voici les pédiatres disponibles :`;
  }
  if (/pédiatre|médecin|docteur/.test(lower)) {
    return `🏥 Je te trouve un pédiatre${childName}. Tu es dans quelle ville ? Voici les disponibles :`;
  }
  if (/vaccin|vaccination/.test(lower)) {
    return `💉 Pour le calendrier vaccinal${childName}${childAge}, voici les pédiatres qui font le suivi vaccinal :`;
  }

  // Education
  if (/maternelle|école|garderie|crèche/.test(lower)) {
    return `🏫 Pour choisir une école${childName}${childAge}, les critères clés sont : ratio élèves/encadrant, pédagogie et proximité. Voici ce qu'on a dans ta zone :`;
  }
  if (/anglais|langue|cours/.test(lower)) {
    return `📚 L'apprentissage précoce des langues est excellent${childName ? ` ${childName}` : ""} ! Dans quelle ville et à quel âge ? Voici les options :`;
  }

  // Leisure & activities
  if (/anniversaire|fête|birthday/.test(lower)) {
    return `🎂 Super projet${childName} ! Quel âge fêter et combien d'enfants environ ? En attendant, voici les meilleurs organisateurs :`;
  }
  if (/natation|piscine|nager/.test(lower)) {
    return `🏊 La natation${childName ? ` pour ${children[0]?.surnom}` : ""} c'est excellent ! Voici les clubs et piscines disponibles :`;
  }
  if (/danse|ballet|hip.?hop/.test(lower)) {
    return `💃 La danse développe la coordination et la confiance en soi${childName} ! Voici les cours disponibles :`;
  }
  if (/robotique|robot|scratch|programmation/.test(lower)) {
    return `🤖 Excellent choix pour préparer l'avenir${childName} ! Voici les ateliers robotique et coding :`;
  }
  if (/trampoline|saut|jump/.test(lower)) {
    return `🤸 Le trampoline${childName ? ` pour ${children[0]?.surnom}` : ""} c'est parfait pour dépenser l'énergie ! Voici les parcs :`;
  }
  if (/karaté|judo|sport de combat|arts martiaux/.test(lower)) {
    return `🥋 Les arts martiaux apprennent la discipline et le respect${childName} ! Voici les clubs :`;
  }
  if (/activit|sortie|week.?end|loisir/.test(lower)) {
    return `🎨 Plein de belles activités${childName} en Tunisie ! Pour affiner, dis-moi l'âge et la ville. En attendant :`;
  }

  // Shopping
  if (/vetement|habit|acheter|shopping|magasin|boutique|jouet|librairie|fringue|tenue|puericulture/.test(lower.normalize("NFD").replace(/[̀-ͯ]/g, ""))) {
    return `🛍️ Pour trouver des vêtements${childName}${childAge}, voici les meilleures boutiques pour enfants en Tunisie :`;
  }

  // Generic with child context
  if (children.length > 0) {
    return `🐧 Je suis là pour aider avec ${children.map(c => c.surnom).join(" et ")} ! Dis-moi ce que tu cherches (activité, médecin, école...) et je te propose les meilleures options.`;
  }

  return `🐧 Je suis là pour t'aider ! Dis-moi ce que tu cherches pour ton enfant — activité, médecin, école, fête... Je te propose les meilleures options en Tunisie.`;
}
