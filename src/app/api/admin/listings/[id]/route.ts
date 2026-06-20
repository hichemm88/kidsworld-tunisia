import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Params = { params: { id: string } };

/** GET /api/admin/listings/[id] */
export async function GET(_req: NextRequest, { params }: Params) {
  const { data, error } = await supabase
    .from("listings_with_stats")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Listing introuvable" }, { status: 404 });

  const [hoursRes, mediaRes, pricesRes] = await Promise.all([
    supabase.from("listing_hours").select("*").eq("listing_id", params.id).order("day_of_week"),
    supabase.from("listing_media").select("*").eq("listing_id", params.id).order("ordre"),
    supabase.from("listing_prices").select("*").eq("listing_id", params.id),
  ]);

  return NextResponse.json({
    listing: data,
    hours: hoursRes.data ?? [],
    media: mediaRes.data ?? [],
    prices: pricesRes.data ?? [],
  });
}

/** PATCH /api/admin/listings/[id] — mise à jour partielle */
export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json();

  // Validate plan if provided
  if (body.plan && !["free", "premium"].includes(body.plan)) {
    return NextResponse.json({ error: "plan doit être 'free' ou 'premium'" }, { status: 400 });
  }

  // Allowed fields to update
  const allowed = [
    "nom", "description", "category_id", "ville", "quartier", "adresse",
    "lat", "lng", "phone", "email", "website", "plan",
    "is_verified", "is_active", "age_min", "age_max", "prix_label", "slug",
  ];
  const updates: Record<string, any> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("listings")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ listing: data });
}

/** DELETE /api/admin/listings/[id] */
export async function DELETE(_req: NextRequest, { params }: Params) {
  // Cascade deletes media, hours, reviews via FK
  const { error } = await supabase.from("listings").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
