import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Réponses rapides pour questions communes
const QUICK_RESPONSES: Array<{ keywords: string[]; reply: string; searchQuery?: string }> = [
  {
    keywords: ["fièvre", "fievre", "température", "temperature", "chaud"],
    reply: "🌡️ Pour une fièvre chez l'enfant :\n\n**Moins de 38.5°C** : hydratation, déshabiller légèrement, surveiller.\n**Entre 38.5° et 39.5°C** : paracétamol selon le poids (15mg/kg), toutes les 6h.\n**Au-dessus de 40°C ou convulsions** : **consultez un pédiatre immédiatement** !\n\nJe peux te trouver un pédiatre près de chez toi :",
    searchQuery: "pédiatre",
  },
  {
    keywords: ["otite", "oreille", "mal oreille"],
    reply: "👂 L'otite est fréquente chez les enfants (surtout 6 mois - 3 ans).\n\n**Signes** : pleurs, fièvre, tire l'oreille, troubles du sommeil.\n**À faire** : consultez rapidement un pédiatre ORL — les antibiotiques sont souvent nécessaires.\n\nVoici des pédiatres disponibles :",
    searchQuery: "pédiatre",
  },
  {
    keywords: ["vaccin", "vaccination", "vaccinations", "calendrier vaccinal"],
    reply: "💉 **Calendrier vaccinal Tunisie (résumé)** :\n\n• **Naissance** : BCG, Hépatite B\n• **2 mois** : Penta, Pneumo, Polio\n• **4 mois** : Penta, Pneumo, Polio\n• **6 mois** : Penta, Polio\n• **12 mois** : ROR, Pneumo, Méningocoque\n• **18 mois** : Rappels Penta, Polio\n\nPour le suivi vaccinal, consultez votre pédiatre :",
    searchQuery: "pédiatre",
  },
  {
    keywords: ["anniversaire", "fête", "fete", "birthday", "gâteau"],
    reply: "🎂 Super ! Pour un anniversaire réussi en Tunisie, voici mes meilleures recommandations :",
    searchQuery: "anniversaire",
  },
  {
    keywords: ["natation", "piscine", "nager", "swimming"],
    reply: "🏊 La natation est excellente pour les enfants dès 4 ans ! Voici les clubs et piscines disponibles :",
    searchQuery: "natation",
  },
  {
    keywords: ["anglais", "langue", "english", "cours anglais", "linguistique"],
    reply: "📚 Très bon choix ! L'apprentissage de l'anglais dès le jeune âge est un vrai atout. Voici les meilleures écoles de langue :",
    searchQuery: "anglais",
  },
  {
    keywords: ["maternelle", "école maternelle", "ecole", "garderie", "crèche", "creche"],
    reply: "🏫 Pour choisir une maternelle, regardez : la proximité, le ratio élèves/encadrant, la pédagogie (Montessori, classique...) et les horaires. Voici les établissements disponibles :",
    searchQuery: "maternelle",
  },
  {
    keywords: ["activité", "activite", "activités", "week-end", "weekend", "loisir", "sortie"],
    reply: "🎨 Beaucoup de belles activités pour les enfants en Tunisie ! Voici ce que je te recommande :",
    searchQuery: "activités",
  },
  {
    keywords: ["trampoline", "saut", "jump"],
    reply: "🤸 Le trampoline c'est génial pour dépenser l'énergie ! Voici les parcs disponibles :",
    searchQuery: "trampoline",
  },
  {
    keywords: ["robotique", "robot", "programmation", "coding", "scratch"],
    reply: "🤖 Excellent choix pour préparer les enfants au monde de demain ! Voici les ateliers disponibles :",
    searchQuery: "robotique",
  },
  {
    keywords: ["danse", "ballet", "hip hop", "hiphop"],
    reply: "💃 La danse développe la coordination, la créativité et la confiance en soi. Voici les cours disponibles :",
    searchQuery: "danse",
  },
  {
    keywords: ["karaté", "judo", "sport de combat", "arts martiaux"],
    reply: "🥋 Les arts martiaux apprennent la discipline et le respect. Voici les clubs disponibles :",
    searchQuery: "judo karaté",
  },
];

async function searchListings(query: string, limit = 4) {
  try {
    const { data } = await supabase
      .from("listings_with_stats")
      .select("id, nom, slug, category_emoji, ville, note_moyenne, plan")
      .eq("is_active", true)
      .or(`nom.ilike.%${query}%,description.ilike.%${query}%`)
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

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    if (!message?.trim()) {
      return NextResponse.json({ reply: "Dis-moi quelque chose, je t'écoute ! 🐧" });
    }

    const lower = message.toLowerCase();

    // Check quick responses
    for (const item of QUICK_RESPONSES) {
      if (item.keywords.some((kw) => lower.includes(kw))) {
        const listings = item.searchQuery
          ? await searchListings(item.searchQuery)
          : [];
        return NextResponse.json({ reply: item.reply, listings });
      }
    }

    // Generic search
    const listings = await searchListings(message, 5);

    let reply = "";
    if (listings.length > 0) {
      reply = `🔍 J'ai trouvé **${listings.length} résultat${listings.length > 1 ? "s" : ""}** pour "${message}" :\n\nClique sur un établissement pour voir les détails !`;
    } else {
      reply = `Je n'ai pas trouvé de résultats précis pour "${message}", mais je peux t'aider avec :\n\n• 🏥 **Santé** : pédiatres, dentistes\n• 🎓 **Éducation** : écoles, cours\n• 🎨 **Activités** : sports, arts, loisirs\n• 🎂 **Fêtes** : anniversaires, événements\n\nQue cherches-tu exactement ?`;
    }

    return NextResponse.json({ reply, listings });
  } catch (err) {
    console.error("Kiwo error:", err);
    return NextResponse.json({ reply: "Désolé, une erreur s'est produite. Réessaie ! 🙈" });
  }
}
