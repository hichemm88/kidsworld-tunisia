import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  // Verify admin role
  const cookieStore = await cookies();
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(list) {
          list.forEach(({ name, value, options }) => {
            try { cookieStore.set(name, value, options as any); } catch {} // eslint-disable-line
          });
        },
      },
    }
  );

  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabaseAuth.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Admin Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const [
      { count: totalListings },
      { count: premiumListings },
      { count: totalUsers },
      { count: totalReviews },
      { data: recentListings },
      { data: topListings },
      { data: catStats },
    ] = await Promise.all([
      supabase.from("listings").select("*", { count: "exact", head: true }),
      supabase.from("listings").select("*", { count: "exact", head: true }).eq("plan", "premium"),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("reviews").select("*", { count: "exact", head: true }),
      supabase.from("listings").select("id, nom, plan, is_active, created_at, ville").order("created_at", { ascending: false }).limit(5),
      supabase.from("listings_with_stats").select("nom, note_moyenne, nb_avis, slug, plan").order("note_moyenne", { ascending: false }).limit(5),
      supabase.from("listings").select("category_id, categories(slug, nom, emoji)").eq("is_active", true),
    ]);

    // Count per category
    const catCounts: Record<string, { nom: string; emoji: string; count: number }> = {};
    (catStats ?? []).forEach((l: any) => {
      if (l.categories) {
        const key = l.categories.slug;
        if (!catCounts[key]) catCounts[key] = { nom: l.categories.nom, emoji: l.categories.emoji, count: 0 };
        catCounts[key].count++;
      }
    });

    return NextResponse.json({
      stats: {
        totalListings: totalListings ?? 0,
        premiumListings: premiumListings ?? 0,
        freeListings: (totalListings ?? 0) - (premiumListings ?? 0),
        totalUsers: totalUsers ?? 0,
        totalReviews: totalReviews ?? 0,
        premiumRate: totalListings ? Math.round(((premiumListings ?? 0) / totalListings) * 100) : 0,
      },
      recentListings: recentListings ?? [],
      topListings: topListings ?? [],
      categoryStats: Object.values(catCounts).sort((a, b) => b.count - a.count),
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
