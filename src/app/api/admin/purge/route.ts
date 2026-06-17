import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Listings to purge: no contact info, vague/fake address, or clearly fictitious
const SLUGS_TO_DELETE = [
  // Fake sequential phones (+216 71 000 0XX) → no real address either
  // Generic listings with NO phone, NO website, NO email, address = just city name
  "lego-store-tunis",           // No official Lego Store in Tunisia
  "bebe-monde-nabeul",          // Generic, no contact
  "traiteur-kids-menu",         // Generic, no contact
  "sergent-major-tunis",        // Real brand, empty shell listing
  "hand-ball-jeunes-tunis",     // Generic, no contact
  "gateau-anniversaire-personnalise", // Generic, no contact
  "cadeaux-bebe-personnalises", // Generic, no contact
  "ecole-primaire-mnihla",      // Public school, no contact
  "ecole-les-etoiles-lac",      // Generic, no contact
  "speedboat-enfants-lac",      // Fantasy service, doesn't exist
  "paintball-famille-tunis",    // Generic, no contact
  "ecole-cirque-enfants",       // Generic, no contact
  "kids-mode-sousse",           // Generic, no contact
  "casquette-kids-montres-jouets", // Generic, no contact
  "poney-party-anniversaire",   // Niche fantasy service, no contact
  "clown-animateur-anniversaire", // Generic, no contact
  "party-time-tunis",           // Generic, no contact
  "dr-khalifa-leila-orl-sfax",  // No phone, address = "Sfax" only
  "bebe-confort-tunis",         // Generic, no contact
  "candy-bar-events-tunis",     // Generic, no contact
  "salle-privatisable-kids-rades", // No contact
  "centre-equestre-family",     // Generic, no contact
  "bonne-graine-bebe",          // Generic, no contact
  "h-and-m-kids-tunis",         // Real brand, empty shell listing
  "ecole-les-rossignols-ariana", // Generic, no contact
  "halte-garderie-ariana",      // Generic, no contact
  "creche-petit-prince-ariana", // Generic, no contact
  "maternelle-el-yasmine-sfax", // Generic, no contact
  "club-elyssa-sidi-bou-said",  // Generic, no contact
  "la-perle-du-lac",            // Generic, no contact
  "climbin-escalade-la-marsa",  // No contact
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.secret !== "kidsworld-purge-2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("listings")
      .delete()
      .in("slug", SLUGS_TO_DELETE)
      .select("slug");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const deleted = (data || []).map((r: any) => r.slug);
    const notFound = SLUGS_TO_DELETE.filter(s => !deleted.includes(s));

    return NextResponse.json({
      ok: true,
      deleted_count: deleted.length,
      deleted,
      not_found: notFound,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
