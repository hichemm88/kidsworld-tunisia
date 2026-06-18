import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Search queries per category
const CATEGORY_QUERIES: Record<string, string[]> = {
  sante: [
    "pÃ©diatre enfant",
    "mÃ©decin gÃ©nÃ©raliste enfant",
    "dentiste pÃ©diatrique",
    "clinique pÃ©diatrique",
    "ophtalmologue enfant",
  ],
  education: [
    "Ã©cole maternelle",
    "crÃ¨che garderie",
    "centre de soutien scolaire",
    "Ã©cole primaire privÃ©e",
    "cours particuliers enfant",
  ],
  loisirs: [
    "parc attractions enfant",
    "salle de jeux enfant",
    "bowling",
    "piscine enfant",
    "trampoline park",
  ],
  ateliers: [
    "atelier crÃ©atif enfant",
    "cours danse enfant",
    "acadÃ©mie arts martiaux enfant",
    "cours musique enfant",
    "acadÃ©mie natation enfant",
  ],
  fetes: [
    "salle fÃªte anniversaire enfant",
    "animateur fÃªte enfant",
    "organisateur Ã©vÃ©nement enfant",
    "location salle anniversaire",
    "traiteur fÃªte enfant",
  ],
  shopping: [
    "magasin jouets",
    "vÃªtements enfant",
    "magasin puÃ©riculture",
    "librairie jeunesse",
    "magasin bÃ©bÃ©",
  ],
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[Ì-Í¯]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 70);
}

async function searchPlaces(query: string, city: string): Promise<any[]> {
  const fullQuery = `${query} ${city} Tunisie`;
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(fullQuery)}&language=fr&key=${GOOGLE_KEY}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

async function getPlaceDetails(placeId: string): Promise<any> {
  const fields = [
    "name",
    "formatted_address",
    "formatted_phone_number",
    "international_phone_number",
    "website",
    "opening_hours",
    "photos",
    "geometry",
    "editorial_summary",
    "url",
  ].join(",");
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&language=fr&key=${GOOGLE_KEY}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    return data.result || {};
  } catch {
    return {};
  }
}

// Resolve Google photo redirect to get actual CDN URL
async function resolvePhotoUrl(photoReference: string, maxWidth = 800): Promise<string | null> {
  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_KEY}`;
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(8000) });
    return res.url || url;
  } catch {
    return url;
  }
}

function parseHours(openingHours: any): Array<{
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
}> {
  if (!openingHours?.periods) return [];

  const dayMap: Record<number, { open: string | null; close: string | null; closed: boolean }> = {};
  for (let i = 0; i < 7; i++) {
    dayMap[i] = { open: null, close: null, closed: true };
  }

  for (const period of openingHours.periods) {
    const day = period.open?.day ?? 0;
    if (period.open?.time) {
      const t = period.open.time;
      const openTime = `${t.slice(0, 2)}:${t.slice(2)}`;
      const ct = period.close?.time ?? "2359";
      const closeTime = `${ct.slice(0, 2)}:${ct.slice(2)}`;
      dayMap[day] = { open: openTime, close: closeTime, closed: false };
    }
  }

  return Array.from({ length: 7 }, (_, i) => ({
    day_of_week: i,
    open_time: dayMap[i].open,
    close_time: dayMap[i].close,
    is_closed: dayMap[i].closed,
  }));
}

export async function POST(req: NextRequest) {
  if (!GOOGLE_KEY) {
    return NextResponse.json(
      { error: "GOOGLE_PLACES_API_KEY manquant dans les variables d'environnement." },
      { status: 500 }
    );
  }

  const body = await req.json();
  const category: string = body.category || "loisirs";
  const city: string = body.city || "Tunis";
  const count: number = Math.min(Number(body.count) || 50, 50);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch category ID
  const { data: catData } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", category)
    .single();
  const categoryId = catData?.id ?? null;

  // Collect unique place IDs across all query variations
  const queries = CATEGORY_QUERIES[category] || [`activitÃ© enfant ${category}`];
  const seenIds = new Set<string>();
  const placeIds: string[] = [];

  for (const query of queries) {
    if (placeIds.length >= count * 3) break;
    const results = await searchPlaces(query, city);
    for (const r of results) {
      if (!seenIds.has(r.place_id)) {
        seenIds.add(r.place_id);
        placeIds.push(r.place_id);
      }
    }
  }

  const inserted: any[] = [];
  const errors: string[] = [];

  for (const placeId of placeIds.slice(0, count)) {
    try {
      const details = await getPlaceDetails(placeId);
      if (!details.name) continue;

      // Unique slug
      const baseSlug = slugify(`${details.name} ${city}`);
      const suffix = Math.random().toString(36).slice(2, 6);
      const slug = `${baseSlug}-${suffix}`;

      // Phone â null if not found (standing rule: never invent)
      const phone =
        details.international_phone_number ||
        details.formatted_phone_number ||
        null;

      const lat = details.geometry?.location?.lat ?? null;
      const lng = details.geometry?.location?.lng ?? null;
      const description = details.editorial_summary?.overview ?? null;

      // Insert listing
      const { data: listing, error: listingErr } = await supabase
        .from("listings")
        .insert({
          slug,
          nom: details.name,
          description,
          category_id: categoryId,
          ville: city,
          adresse: details.formatted_address ?? null,
          lat,
          lng,
          phone,
          website: details.website ?? null,
          email: null, // Google Places doesn't expose email
          plan: "free",
          is_verified: false,
          is_active: true,
        })
        .select("id")
        .single();

      if (listingErr || !listing) {
        errors.push(`${details.name}: ${listingErr?.message ?? "insertion Ã©chouÃ©e"}`);
        continue;
      }

      const listingId = listing.id;

      // Insert photos (resolve redirects to get real CDN URLs)
      const photoCount = Math.min((details.photos || []).length, 5);
      if (photoCount > 0) {
        const photoUrls = await Promise.all(
          details.photos.slice(0, photoCount).map((p: any) =>
            resolvePhotoUrl(p.photo_reference)
          )
        );
        const mediaRows = photoUrls
          .filter(Boolean)
          .map((url: any, i: number) => ({
            listing_id: listingId,
            url,
            type: "image",
            is_cover: i === 0,
            ordre: i,
          }));
        if (mediaRows.length) {
          await supabase.from("listing_media").insert(mediaRows);
        }
      }

      // Insert opening hours
      if (details.opening_hours) {
        const hours = parseHours(details.opening_hours);
        if (hours.length) {
          await supabase.from("listing_hours").insert(
            hours.map((h) => ({ listing_id: listingId, ...h }))
          );
        }
      }

      inserted.push({
        id: listingId,
        nom: details.name,
        slug,
        adresse: details.formatted_address ?? null,
        phone,
        website: details.website ?? null,
        photos: photoCount,
        hasHours: !!details.opening_hours,
      });
    } catch (e: any) {
      errors.push(`Erreur: ${e.message}`);
    }
  }

  return NextResponse.json({
    inserted,
    errors,
    total: inserted.length,
    requested: count,
  });
}
