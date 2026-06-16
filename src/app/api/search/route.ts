import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Synonymes et expansions sémantiques pour la Tunisie
const SEMANTIC_MAP: Record<string, string[]> = {
  bebe: ["neonatologie", "maternite", "pediatre", "0-3"],
  medecin: ["sante", "pediatre", "docteur", "clinique"],
  docteur: ["sante", "pediatre", "medecin", "clinique"],
  anniversaire: ["fetes", "animation", "gateau", "decoration"],
  fete: ["fetes", "anniversaire", "evenement"],
  ecole: ["education", "maternelle", "primaire", "scolarite"],
  piscine: ["loisirs", "natation", "aquatique"],
  sport: ["ateliers", "foot", "basket", "natation", "judo"],
  danse: ["ateliers", "ballet", "hiphop"],
  anglais: ["education", "langue", "cours"],
  robot: ["ateliers", "robotique", "programmation", "scratch"],
  jeux: ["loisirs", "trampoline", "indoor"],
  shopping: ["shopping", "jouets", "vetements"],
};

function expandQuery(q: string): string[] {
  const words = q.toLowerCase().split(/\s+/);
  const expanded = new Set<string>(words);
  words.forEach((w) => {
    const synonyms = SEMANTIC_MAP[w] ?? [];
    synonyms.forEach((s) => expanded.add(s));
  });
  return Array.from(expanded);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const cat = searchParams.get("cat") ?? "";
  const ville = searchParams.get("ville") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "12"), 50);
  const offset = (page - 1) * limit;

  try {
    let query = supabase
      .from("listings_with_stats")
      .select("*", { count: "exact" })
      .eq("is_active", true);

    // Category filter
    if (cat && cat !== "all") {
      const { data: catData } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", cat)
        .single();
      if (catData) query = query.eq("category_id", catData.id);
    }

    // Ville filter
    if (ville && ville !== "all") {
      query = query.ilike("ville", `%${ville}%`);
    }

    // Text search with semantic expansion
    if (q) {
      const terms = expandQuery(q);
      const searchStr = terms.join(" | ");
      // Use Supabase full-text search
      query = query.or(
        `nom.ilike.%${q}%,description.ilike.%${q}%,quartier.ilike.%${q}%`
      );
    }

    // Sort: premium first, then by rating
    query = query
      .order("plan", { ascending: false })
      .order("note_moyenne", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    // Generate AI suggestions based on query
    const suggestions = generateSuggestions(q, data ?? []);

    return NextResponse.json({
      listings: data ?? [],
      total: count ?? 0,
      page,
      limit,
      suggestions,
      query: q,
    });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

function generateSuggestions(q: string, results: any[]): string[] {
  if (!q || results.length > 0) return [];
  // Suggest related categories based on partial matches
  const suggestions: string[] = [];
  const lower = q.toLowerCase();
  if (lower.includes("med") || lower.includes("doc")) suggestions.push("Pédiatres");
  if (lower.includes("jeu") || lower.includes("play")) suggestions.push("Espaces de jeux");
  if (lower.includes("sport") || lower.includes("nat")) suggestions.push("Clubs de natation");
  if (lower.includes("ang") || lower.includes("lang")) suggestions.push("Cours de langue");
  if (lower.includes("dan")) suggestions.push("Cours de danse");
  if (lower.includes("rob") || lower.includes("prog")) suggestions.push("Ateliers robotique");
  return suggestions.slice(0, 3);
}
