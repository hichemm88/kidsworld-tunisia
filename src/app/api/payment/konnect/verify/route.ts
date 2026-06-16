import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const KONNECT_API = process.env.KONNECT_API_URL ?? "https://api.preprod.konnect.network/api/v2";
const KONNECT_API_KEY = process.env.KONNECT_API_KEY ?? "";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const paymentRef = request.nextUrl.searchParams.get("ref");
  const orderId = request.nextUrl.searchParams.get("order");

  if (!paymentRef && !orderId) {
    return NextResponse.json({ error: "Missing ref or order" }, { status: 400 });
  }

  let record;
  if (paymentRef) {
    const { data } = await supabase.from("payments").select("*").eq("payment_ref", paymentRef).single();
    record = data;
  } else {
    const { data } = await supabase.from("payments").select("*").eq("id", orderId!).single();
    record = data;
  }

  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // If pending, re-verify with Konnect
  if (record.status === "pending" && record.payment_ref) {
    const res = await fetch(`${KONNECT_API}/payments/${record.payment_ref}`, {
      headers: { "x-api-key": KONNECT_API_KEY },
    });
    if (res.ok) {
      const { payment } = await res.json();
      if (payment?.status && payment.status !== record.status) {
        await supabase.from("payments").update({ status: payment.status }).eq("id", record.id);
        record.status = payment.status;
      }
    }
  }

  return NextResponse.json({
    orderId: record.id,
    status: record.status,
    plan: record.plan,
    amount: record.amount,
    currency: record.currency,
  });
}
