import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (body.secret !== "kidsworld-purge-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = body.slug || "urban-dance-menzah-5";

  // Get listing
  const { data: listing, error: le } = await supabase
    .from("listings")
    .select("id, nom, slug")
    .eq("slug", slug)
    .single();

  if (!listing) return NextResponse.json({ error: "listing not found", le });

  const lid = listing.id;

  // Get media
  const { data: media, error: me } = await supabase
    .from("listing_media")
    .select("*")
    .eq("listing_id", lid);

  // Get hours
  const { data: hours, error: he } = await supabase
    .from("listing_hours")
    .select("*")
    .eq("listing_id", lid);

  // Try inserting a test media row
  const { error: insertErr } = await supabase
    .from("listing_media")
    .upsert({
      listing_id: lid,
      url: "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=800&q=80",
      type: "image",
      position: 0
    }, { onConflict: "listing_id,position" });

  return NextResponse.json({
    listing: { id: lid, nom: listing.nom },
    mediaCount: media?.length ?? 0,
    mediaError: me?.message ?? null,
    hoursCount: hours?.length ?? 0,
    hoursError: he?.message ?? null,
    insertTestError: insertErr?.message ?? null,
    mediaSample: media?.[0] ?? null,
    hoursSample: hours?.[0] ?? null,
    usingKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "service_role" : "anon",
  });
}
