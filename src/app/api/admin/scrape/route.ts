import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ─── Overpass API (OpenStreetMap) — aucune clé requise ───────────────────────

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const CITY_COORDS: Record<string, { lat: number; lng: number; radius: number }> = {
  "Tunis":      { lat: 36.8190, lng: 10.1658, radius: 12000 },
  "Ariana":     { lat: 36.8625, lng: 10.1956, radius: 8000  },
  "Ben Arous":  { lat: 36.7533, lng: 10.2283, radius: 8000  },
  "La Marsa":   { lat: 36.8782, lng: 10.3250, radius: 6000  },
  "La Soukra":  { lat: 36.8990, lng: 10.1930, radius: 5000  },
  "Manouba":    { lat: 36.8095, lng: 10.0975, radius: 7000  },
  "Sfax":       { lat: 34.7400, lng: 10.7600, radius: 10000 },
  "Sousse":     { lat: 35.8256, lng: 10.6369, radius: 10000 },
  "Nabeul":     { lat: 36.4514, lng: 10.7356, radius: 8000  },
  "Monastir":   { lat: 35.7783, lng: 10.8262, radius: 8000  },
  "Bizerte":    { lat: 37.2746, lng:  9.8739, radius: 8000  },
  "Hammamet":   { lat: 36.4074, lng: 10.6186, radius: 6000  },
  "Gabès":      { lat: 33.8814, lng: 10.0982, radius: 8000  },
  "Kairouan":   { lat: 35.6781, lng: 10.0960, radius: 8000  },
};

// OSM tags per KidsWorld category
const CATEGORY_OSM: Record<string, Array<[string, string]>> = {
  sante: [
    ["amenity", "clinic"],
    ["amenity", "hospital"],
    ["amenity", "doctors"],
    ["amenity", "dentist"],
    ["amenity", "pharmacy"],
    ["amenity", "physiotherapist"],
    ["healthcare", "centre"],
  ],
  education: [
    ["amenity", "school"],
    ["amenity", "kindergarten"],
    ["amenity", "language_school"],
    ["amenity", "music_school"],
    ["amenity", "driving_school"],
    ["amenity", "college"],
  ],
  loisirs: [
    ["leisure", "playground"],
    ["leisure", "sports_centre"],
    ["leisure", "swimming_pool"],
    ["leisure", "fitness_centre"],
    ["leisure", "amusement_arcade"],
    ["amenity", "cinema"],
    ["amenity", "theatre"],
    ["leisure", "water_park"],
    ["leisure", "stadium"],
  ],
  ateliers: [
    ["leisure", "arts_centre"],
    ["amenity", "arts_centre"],
    ["leisure", "dance_studio"],
    ["leisure", "martial_arts"],
    ["amenity", "community_centre"],
  ],
  fetes: [
    ["amenity", "events_venue"],
    ["amenity", "banquet_hall"],
    ["leisure", "resort"],
    ["amenity", "restaurant"],
    ["amenity", "cafe"],
  ],
  shopping: [
    ["shop", "toys"],
    ["shop", "baby_goods"],
    ["shop", "children"],
    ["shop", "clothes"],
    ["shop", "books"],
    ["shop", "sports"],
    ["amenity", "marketplace"],
  ],
};

function buildOverpassQuery(
  tags: Array<[string, string]>,
  lat: number,
  lng: number,
  radius: number,
  limit: number
): string {
  const parts = tags
    .map(
      ([k, v]) =>
        `  node["${k}"="${v}"](around:${radius},${lat},${lng});\n` +
        `  way["${k}"="${v}"](around:${radius},${lat},${lng});\n`
    )
    .join("");

  return `[out:json][timeout:30];\n(\n${parts});\nout center ${limit};`;
}

/** Parse OSM opening_hours string e.g. "Mo-Fr 09:00-18:00; Sa 09:00-13:00" */
function parseOsmHours(
  ohString: string
): Array<{ day_of_week: number; open_time: string | null; close_time: string | null; is_closed: boolean }> | null {
  if (!ohString) return null;

  if (ohString === "24/7") {
    return Array.from({ length: 7 }, (_, i) => ({
      day_of_week: i,
      open_time: "00:00",
      close_time: "23:59",
      is_closed: false,
    }));
  }

  const DAY_MAP: Record<string, number[]> = {
    Mo: [1], Tu: [2], We: [3], Th: [4], Fr: [5], Sa: [6], Su: [0],
    "Mo-Fr": [1, 2, 3, 4, 5],
    "Mo-Sa": [1, 2, 3, 4, 5, 6],
    "Mo-Su": [0, 1, 2, 3, 4, 5, 6],
    "Tu-Fr": [2, 3, 4, 5],
    "Tu-Sa": [2, 3, 4, 5, 6],
    "Sa-Su": [6, 0],
    "We-Su": [3, 4, 5, 6, 0],
  };

  const result: Record<number, { open: string | null; close: string | null; closed: boolean }> = {};
  for (let i = 0; i < 7; i++) result[i] = { open: null, close: null, closed: true };

  const segments = ohString.split(";").map((s) => s.trim());
  for (const seg of segments) {
    const match = seg.match(/^([A-Za-z,-]+)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
    if (!match) continue;
    const [, dayPart, openTime, closeTime] = match;
    const days = DAY_MAP[dayPart.trim()] ?? [];
    for (const d of days) {
      result[d] = { open: openTime, close: closeTime, closed: false };
    }
  }

  return Object.entries(result).map(([d, v]) => ({
    day_of_week: Number(d),
    open_time: v.open,
    close_time: v.close,
    is_closed: v.closed,
  }));
}

function cleanPhone(raw: string | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d+\s()-]/g, "").trim();
  return cleaned.replace(/\s+/g, " ").length >= 8 ? cleaned : null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 70);
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    source: "OpenStreetMap / Overpass API",
    note: "Aucune clé API requise. POST {category, city, count} pour lancer.",
    cities: Object.keys(CITY_COORDS),
    categories: Object.keys(CATEGORY_OSM),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const category: string = body.category || "loisirs";
  const city: string = body.city || "Tunis";
  const count: number = Math.min(Number(body.count) || 20, 100);

  const coords = CITY_COORDS[city];
  if (!coords) {
    return NextResponse.json({ error: `Ville "${city}" non supportée.` }, { status: 400 });
  }

  const osmTags = CATEGORY_OSM[category];
  if (!osmTags) {
    return NextResponse.json({ error: `Catégorie "${category}" inconnue.` }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Category ID
  const { data: catData } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", category)
    .single();
  const categoryId = catData?.id ?? null;

  // Build & execute Overpass query
  const query = buildOverpassQuery(osmTags, coords.lat, coords.lng, coords.radius, count * 4);

  let elements: any[] = [];
  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(35000),
    });
    if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
    const data = await res.json();
    elements = data.elements || [];
  } catch (e: any) {
    return NextResponse.json({ error: `Erreur Overpass API: ${e.message}` }, { status: 500 });
  }

  // Deduplicate by name
  const seenNames = new Set<string>();
  const unique = elements.filter((el) => {
    const name = el.tags?.name || el.tags?.["name:fr"] || el.tags?.["name:ar"];
    if (!name) return false;
    const key = name.toLowerCase().trim();
    if (seenNames.has(key)) return false;
    seenNames.add(key);
    return true;
  });

  // Skip already-inserted listings
  const { data: existingData } = await supabase.from("listings").select("nom");
  const existingNoms = new Set((existingData || []).map((l: any) => l.nom.toLowerCase().trim()));

  const inserted: any[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  for (const el of unique.slice(0, count)) {
    try {
      const tags = el.tags || {};
      const name: string = tags.name || tags["name:fr"] || tags["name:ar"] || "";
      if (!name) continue;

      if (existingNoms.has(name.toLowerCase().trim())) {
        skipped.push(name);
        continue;
      }

      const lat: number | null = el.lat ?? el.center?.lat ?? null;
      const lng: number | null = el.lon ?? el.center?.lon ?? null;

      // Phone — null si introuvable (règle absolue)
      const phone = cleanPhone(
        tags.phone || tags["contact:phone"] || tags["contact:mobile"] || tags["phone:mobile"]
      );

      const website = tags.website || tags["contact:website"] || null;

      const adresse =
        [tags["addr:housenumber"], tags["addr:street"], tags["addr:suburb"]]
          .filter(Boolean)
          .join(" ") ||
        tags["addr:full"] ||
        null;

      const description = tags.description || tags["description:fr"] || null;

      const baseSlug = slugify(`${name} ${city}`);
      const suffix = Math.random().toString(36).slice(2, 5);
      const slug = `${baseSlug}-${suffix}`;

      const { data: listing, error: listingErr } = await supabase
        .from("listings")
        .insert({
          slug,
          nom: name,
          description,
          category_id: categoryId,
          ville: city,
          adresse,
          lat,
          lng,
          phone,
          website,
          email: null,
          plan: "free",
          is_verified: false,
          is_active: true,
        })
        .select("id")
        .single();

      if (listingErr || !listing) {
        errors.push(`${name}: ${listingErr?.message ?? "insertion échouée"}`);
        continue;
      }

      existingNoms.add(name.toLowerCase().trim());

      // Opening hours
      let hasHours = false;
      if (tags.opening_hours) {
        const hours = parseOsmHours(tags.opening_hours);
        if (hours && hours.length > 0) {
          await supabase
            .from("listing_hours")
            .insert(hours.map((h) => ({ listing_id: listing.id, ...h })));
          hasHours = true;
        }
      }

      inserted.push({
        id: listing.id,
        nom: name,
        slug,
        adresse,
        phone,
        website,
        hasHours,
        lat,
        lng,
      });
    } catch (e: any) {
      errors.push(`Erreur: ${e.message}`);
    }
  }

  return NextResponse.json({
    inserted,
    skipped,
    errors,
    total: inserted.length,
    total_found: unique.length,
    skipped_count: skipped.length,
    requested: count,
    source: "OpenStreetMap / Overpass",
  });
}
