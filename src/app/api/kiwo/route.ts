import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[‘’‛`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const CATEGORY_KEYWORDS: Record<string, RegExp> = {
  sante: /pediatr|pedaitr|medecin|docteur|doctor|doc\b|clinic|sante|sants|vaccin|vacin|fievre|fievr|temperature|maladie|malade|otite|dentist|dentsr|dent\b|orl|ophtlmo|ophtalmo|infirmi|urgenc|pharmacie|tbib|sick|ill|fever|health|nurse|consultat/,
  education: /maternell|maternele|garderie|creche|cresh|ecole|scool|school|classe|cours\b|cour\b|lesson|soutien|primair|college|lycee|montesori|montessori|bilingue|bilingu|anglais|english|francais|french|arabe|arabic|math|langu|formation|apprentisag|tuteur|tutor|prof\b/,
  loisirs: /activit|sorti|piscine|picine|natation|nataion|swim|trampolin|trampo|karting|bowling|bowlin|parc|jeux\b|jeu\b|play|fun|loisir|indoor|balade|parcours|accrobranche|kart|manege|lazer|laser|escape|cinema|cine\b|aqua|faire\b|week.?end|weekend/,
  ateliers: /danse|ballet|hip.?hop|musique|music|guitar|guitare|piano|violin|chant|dessin|peintur|robotique|robot\b|scratch|coding|code\b|programm|karate|judo|taekwondo|sport\b|foot\b|football|basket|tennis|art\b|atelier|club\b|briques|lego|theatre/,
  fetes: /anniversair|anniverssair|aniversair|birthday|bday|fete\b|fetes\b|party\b|partie\b|salle|animation|animat|gateau|cake\b|decor|decoration|celebr|clown|spectacle|magicien|gonflable|3id|hafla|invitation|ballon|bapteme|communion/,
  shopping: /vetement|vetments|habit\b|habits\b|fringue|tenu\b|tenue|acheter|achat\b|magasin|boutique|shopping|shop\b|jouet|toys?|librairie|librair|puericulture|puericult|poussett|landau|bebe\b|baby\b|cadeau|cadeaux|gift\b|hwayej|souk\b|linge|sac\b|chaussur|baskets?|veste|pantalon|robe\b|pyjama|uniforme|buy\b/,
};

const CITY_MAP: Array<[RegExp, string]> = [
  [/\bla marsa\b|marsa\b/, "La Marsa"],
  [/\bariana\b|ariena\b/, "Ariana"],
  [/\bsousse\b|suse\b/, "Sousse"],
  [/\bsfax\b|sfex\b/, "Sfax"],
  [/\bnabeul\b|nabuel\b/, "Nabeul"],
  [/\bhammamet\b|hamamet\b/, "Hammamet"],
  [/\bbizerte\b|bizert\b/, "Bizerte"],
  [/\bmonastr\b|monastir\b/, "Monastir"],
  [/\bmanouba\b/, "Manouba"],
  [/\btunis\b|tnis\b/, "Tunis"],
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
  // Only use USER messages for detection (Kiwo messages contain "médecins" etc. which pollute detection)
  const userContext = [
    ...history.filter((h) => h.role === "user").map((h) => h.content),
    message,
  ].join(" ");
  const category = detectCategory(userContext);
  const ville = detectCity(userContext);
  const stopWords = new Set([
    "je", "tu", "il", "nous", "vous", "ils", "on",
    "veux", "voudrai", "souhaite", "cherche", "pour", "mon", "ma", "mes",
    "un", "une", "des", "les", "en", "le", "la", "du", "au",
    "bonjour", "bonsoir", "salam", "salut", "coucou", "hello", "hi",
    "stp", "svp", "merci", "please", "que", "qui", "quoi", "quel", "quelle", "comment", "est",
  ]);
  const words = norm(message).split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w));
  const query = words.slice(0, 5).join(" ");
  return { query, category, ville };
}

async function searchListings(query: string, category?: string, ville?: string, limit = 4) {
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
      emoji: l.category_emoji || "\u{1F4CD}",
      ville: l.ville || "Tunis",
      note_moyenne: l.note_moyenne || 0,
    }));
  } catch {
    return [];
  }
}

function generateSmartReply(
  message: string,
  history: Array<{ role: string; content: string }>,
  children: any[]
): string {
  const fullContext = norm([
    ...history.filter((h) => h.role === "user").map((h) => h.content),
    message,
  ].join(" "));
  const n = norm(message);
  const child = children[0];
  const cn = child ? " pour **" + child.surnom + "**" : "";
  const ca = child && child.age ? " (" + child.age + ")" : "";

  if (/age|sais|connais|tu as|combien|quel age/.test(n) && child) {
    if (child.age && child.age !== "0 mois") {
      return "Oui ! **" + child.surnom + "** a **" + child.age + "** selon ton profil. Comment puis-je aider ?";
    }
    return "Je connais **" + child.surnom + "** mais son age n'est pas renseigne dans ton profil.";
  }

  const detected = detectCategory(fullContext);
  const detectedCity = detectCity(fullContext);
  const cityStr = detectedCity ? " a **" + detectedCity + "**" : " en Tunisie";

  switch (detected) {
    case "sante":
      if (/fievr|febr|temperature|3[89]|40|malade|sick/.test(fullContext))
        return "Si plus de **38.5°C**" + cn + ", donne du paracetamol (15mg/kg). Au-dessus de **40°C** ou plus de 48h : consulte vite ! Voici des pediatres :";
      if (/dent|dentist|snan/.test(fullContext))
        return "Dentiste pediatrique" + cn + ca + cityStr + " :";
      if (/vaccin|vacin/.test(fullContext))
        return "Pediatres pour vaccins" + cn + cityStr + " :";
      return "Medecin" + cn + ca + cityStr + " :";
    case "education":
      if (/creche|garderie|maternell|rouda/.test(fullContext))
        return "Maternelles et creches" + cn + ca + cityStr + " :";
      if (/anglais|english|math|soutien|cours/.test(fullContext))
        return "Cours et soutien scolaire" + cn + ca + cityStr + " :";
      return "Ecoles" + cn + ca + cityStr + " :";
    case "loisirs":
      if (/piscine|picine|natation|swim/.test(fullContext))
        return "Clubs natation" + cn + ca + cityStr + " :";
      if (/trampolin|trampo/.test(fullContext))
        return "Parcs trampoline" + cn + ca + cityStr + " :";
      return "Activites et sorties" + cn + ca + cityStr + " :";
    case "ateliers":
      if (/danse|ballet/.test(fullContext))
        return "Cours de danse" + cn + ca + cityStr + " :";
      if (/musique|piano|guitar/.test(fullContext))
        return "Ecoles de musique" + cn + ca + cityStr + " :";
      if (/robotique|robot|scratch|coding/.test(fullContext))
        return "Ateliers robotique" + cn + ca + cityStr + " :";
      return "Ateliers" + cn + ca + cityStr + " :";
    case "fetes":
      return "Organisateurs anniversaires" + cn + ca + cityStr + " :";
    case "shopping":
      return "Boutiques pour enfants" + cn + ca + cityStr + " :";
  }

  if (children.length > 0) {
    const names = children.map((c: any) => c.surnom).join(" et ");
    return "Je suis la pour **" + names + "** ! Dis-moi : activite, medecin, ecole, fete ou shopping" + (detectedCity ? " a " + detectedCity : "") + " ?";
  }
  return "Dis-moi ce que tu cherches pour ton enfant : activite, medecin, ecole, fete ou shopping ?";
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [], childrenContext = [] } = await request.json();
    if (!message?.trim()) {
      return NextResponse.json({ reply: "Dis-moi quelque chose ! \u{1F427}" });
    }

    const { query, category, ville } = extractSearchIntent(message, history);

    let systemPrompt = "Tu es Kiwo, l'assistant IA de KidsWorld Tunisia."
      + " Tu comprends le francais, l'arabe tunisien (darija), l'anglais, les fautes de frappe et abreviations.\n\n"
      + "KidsWorld reference les services pour enfants en Tunisie : Sante, Education, Loisirs, Ateliers, Fetes, Shopping.\n\n"
      + "REGLES :\n"
      + "- Reponds en max 2-3 phrases courtes\n"
      + "- N'ajoute PAS de liste d'etablissements (ils s'affichent en cartes automatiquement)\n"
      + "- Utilise le prenom et l'age de l'enfant SYSTEMATIQUEMENT si tu les connais\n"
      + "- Ne redemande JAMAIS une info deja mentionnee (ville, age, prenom)\n"
      + "- Si la ville est dans la conversation, utilise-la directement\n"
      + "- Pose UNE seule question si besoin";

    if (childrenContext.length > 0) {
      systemPrompt += "\n\nENFANTS DU PARENT :";
      for (const c of childrenContext) {
        systemPrompt += "\n- " + c.surnom + " : " + (c.age || "age non renseigne") + " (" + (c.sexe || "?") + ")";
      }
    }

    if (category || ville) {
      systemPrompt += "\n\nCONTEXTE DETECTE :";
      if (category) systemPrompt += "\n- Categorie : " + category;
      if (ville) systemPrompt += "\n- Ville : " + ville;
      systemPrompt += "\n=> Utilise ces infos directement, ne les redemande pas.";
    }

    let reply = "";
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
      const apiMessages = [
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
            max_tokens: 300,
            system: systemPrompt,
            messages: apiMessages,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          reply = data.content?.[0]?.text?.trim() || "";
        }
      } catch {
        /* fall through */
      }
    }

    if (!reply) {
      reply = generateSmartReply(message, history, childrenContext);
    }

    const listings = await searchListings(query || "", category, ville, 4);
    return NextResponse.json({ reply, listings });
  } catch (err) {
    console.error("Kiwo error:", err);
    return NextResponse.json({ reply: "Desole, une petite erreur. Reessaie !", listings: [] });
  }
}
