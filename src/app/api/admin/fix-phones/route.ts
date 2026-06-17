import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Listings with fake phones (+216 71 000 0XX) — verified: no real number found online
const FAKE_PHONE_DELETE = [
  "fanta-park",            // No "Fanta Park" exists as identifiable venue
  "dr-ben-ali-sana",       // No Dr Ben Ali Sana found at Lac with verifiable contact
  "kids-english-club",     // kidsenglishclub.tn not reachable, no phone found
  "atelier-robotique-kids", // No real listing found at CUN
  "happy-birthday-events", // Generic name, no verifiable business
  "librairie-jeunesse-tunis", // No bookstore at Mall du Lac with this name found
];

// Listings with fake phones where real phone was found
const REAL_PHONE_UPDATES: Array<{ slug: string; phone: string }> = [
  { slug: "jumpark-trampoline", phone: "52699996" }, // jumpark.tn real phone
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.secret !== "kidsworld-purge-2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Delete listings with unverifiable fake phones
    const { data: deleted, error: delError } = await supabase
      .from("listings")
      .delete()
      .in("slug", FAKE_PHONE_DELETE)
      .select("slug");

    if (delError) {
      return NextResponse.json({ error: delError.message }, { status: 500 });
    }

    // 2. Update Jumpark with real phone
    const updates = [];
    for (const { slug, phone } of REAL_PHONE_UPDATES) {
      const { error: updError } = await supabase
        .from("listings")
        .update({ phone })
        .eq("slug", slug);
      updates.push({ slug, phone, ok: !updError, error: updError?.message });
    }

    return NextResponse.json({
      ok: true,
      deleted_count: (deleted || []).length,
      deleted: (deleted || []).map((r: any) => r.slug),
      updated: updates,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
