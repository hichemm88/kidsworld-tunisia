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

  // Test inserting a hours row
  const { error: hoursInsertErr } = await supabase
    .from("listing_hours")
    .insert({ listing_id: lid, jour: "Lundi", ouvert: true, heure_ouverture: "09:00", heure_fermeture: "18:00" });

  // Check listing_hours table columns
  const { data: hoursSchema } = await supabase
    .from("listing_hours")
    .select("*")
    .limit(1);

  // Also check anon read access to media
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: anonMedia, error: anonMediaErr } = await anonClient
    .from("listing_media")
    .select("*")
    .eq("listing_id", lid);
  const { data: anonHours, error: anonHoursErr } = await anonClient
    .from("listing_hours")
    .select("*")
    .eq("listing_id", lid);

  return NextResponse.json({
    listing: { id: lid, nom: listing.nom },
    serviceRole: {
      mediaCount: media?.length ?? 0,
      hoursCount: hours?.length ?? 0,
      hoursAll: hours,
      hoursInsertError: hoursInsertErr?.message ?? null,
      hoursInsertCode: hoursInsertErr?.code ?? null,
    },
    anonRole: {
      mediaCount: anonMedia?.length ?? 0,
      mediaError: anonMediaErr?.message ?? null,
      hoursCount: anonHours?.length ?? 0,
      hoursError: anonHoursErr?.message ?? null,
    },
    usingKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "service_role" : "anon",
  });
}
