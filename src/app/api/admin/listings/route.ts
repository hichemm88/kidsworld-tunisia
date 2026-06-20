import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** GET /api/admin/listings — liste paginée avec filtres */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);
  const search = searchParams.get("q") ?? "";
  const plan = searchParams.get("plan") ?? "";
  const status = searchParams.get("status") ?? "";
  const cat = searchParams.get("cat") ?? "";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("listings_with_stats")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`nom.ilike.%${search}%,ville.ilike.%${search}%`);
  }
  if (plan === "premium" || plan === "free") {
    query = query.eq("plan", plan);
  }
  if (status === "active") query = query.eq("is_active", true);
  if (status === "inactive") query = query.eq("is_active", false);
  if (cat) query = query.eq("category_slug", cat);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ listings: data ?? [], total: count ?? 0, page, limit });
}

/** POST /api/admin/listings — créer un listing */
export async function POST(req: NextRequest) {
  const body = await req.json();

  const required = ["nom", "ville", "plan"];
  for (const f of required) {
    if (!body[f]) return NextResponse.json({ error: `Champ requis: ${f}` }, { status: 400 });
  }

  if (!["free", "premium"].includes(body.plan)) {
    return NextResponse.json({ error: "plan doit être 'free' ou 'premium'" }, { status: 400 });
  }

  // Slug auto-generation
  function slugify(t: string) {
    return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim().substring(0, 70);
  }
  const suffix = Math.random().toString(36).slice(2, 5);
  const slug = body.slug || `${slugify(body.nom + " " + body.ville)}-${suffix}`;

  const { data, error } = await supabase
    .from("listings")
    .insert({
      slug,
      nom: body.nom,
      description: body.description ?? null,
      category_id: body.category_id ?? null,
      ville: body.ville,
      quartier: body.quartier ?? null,
      adresse: body.adresse ?? null,
      lat: body.lat ?? null,
      lng: body.lng ?? null,
      phone: body.phone ?? null,
      email: body.email ?? null,
      website: body.website ?? null,
      plan: body.plan,
      is_verified: body.is_verified ?? false,
      is_active: body.is_active ?? true,
      age_min: body.age_min ?? null,
      age_max: body.age_max ?? null,
      prix_label: body.prix_label ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ listing: data }, { status: 201 });
}
