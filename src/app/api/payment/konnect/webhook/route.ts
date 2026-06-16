import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const KONNECT_API = process.env.KONNECT_API_URL ?? "https://api.preprod.konnect.network/api/v2";
const KONNECT_API_KEY = process.env.KONNECT_API_KEY ?? "";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { payment_ref } = await request.json();
    if (!payment_ref) return NextResponse.json({ error: "Missing payment_ref" }, { status: 400 });

    // Verify payment status with Konnect
    const res = await fetch(`${KONNECT_API}/payments/${payment_ref}`, {
      headers: { "x-api-key": KONNECT_API_KEY },
    });

    if (!res.ok) return NextResponse.json({ error: "Konnect verify failed" }, { status: 502 });

    const { payment } = await res.json();
    const status = payment?.status ?? "unknown";

    // Find our payment record
    const { data: payRecord } = await supabase
      .from("payments")
      .select("*")
      .eq("payment_ref", payment_ref)
      .single();

    if (!payRecord) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    // Update payment status
    await supabase.from("payments").update({ status, raw: payment }).eq("payment_ref", payment_ref);

    if (status === "completed") {
      const PLAN_MONTHS: Record<string, number> = {
        premium_monthly: 1,
        premium_annual: 12,
      };
      const months = PLAN_MONTHS[payRecord.plan] ?? 1;
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + months);

      // Activate premium on listing
      if (payRecord.listing_id) {
        await supabase
          .from("listings")
          .update({ plan: "premium", premium_expires_at: expiresAt.toISOString() })
          .eq("id", payRecord.listing_id);
      }

      // Mark user as premium
      await supabase
        .from("profiles")
        .update({ plan: "premium", premium_expires_at: expiresAt.toISOString() })
        .eq("id", payRecord.user_id);
    }

    return NextResponse.json({ ok: true, status });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// Konnect also sends GET for verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: "webhook active" });
}
