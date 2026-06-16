import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cat = searchParams.get("cat") ?? "";
  const featured = searchParams.get("featured") === "true";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "12"), 50);

  try {
    let query = supabase
      .from("listings_with_stats")
      .select("*")
      .eq("is_active", true);

    if (cat && cat !== "all") {
      const { data: catData } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", cat)
        .single();
      if (catData) query = query.eq("category_id", catData.id);
    }

    if (featured) {
      query = query.eq("plan", "premium");
    }

    query = query
      .order("plan", { ascending: false })
      .order("note_moyenne", { ascending: false })
      .limit(limit);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ listings: data ?? [] });
  } catch (err) {
    console.error("Listings error:", err);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}
