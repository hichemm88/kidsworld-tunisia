import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const KONNECT_API = process.env.KONNECT_API_URL ?? "https://api.preprod.konnect.network/api/v2";
const KONNECT_API_KEY = process.env.KONNECT_API_KEY ?? "";
const KONNECT_WALLET_ID = process.env.KONNECT_WALLET_ID ?? "";

const PLANS = {
  premium_monthly: { label: "Premium Mensuel", amount: 4900, currency: "TND", months: 1 },
  premium_annual:  { label: "Premium Annuel",   amount: 39900, currency: "TND", months: 12 },
} as const;

export async function POST(request: NextRequest) {
  try {
    const { plan, listing_id } = await request.json();
    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(list) { list.forEach(({ name, value, options }) => { try { cookieStore.set(name, value, options as any); } catch {} }); },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("email, full_name").eq("id", user.id).single();

    const selectedPlan = PLANS[plan as keyof typeof PLANS];
    const orderId = `KW-${Date.now()}-${user.id.slice(0, 8)}`;

    // Save pending payment in Supabase
    await supabase.from("payments").insert({
      id: orderId,
      user_id: user.id,
      listing_id: listing_id ?? null,
      plan,
      amount: selectedPlan.amount,
      currency: selectedPlan.currency,
      status: "pending",
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kidsworld-tunisia.vercel.app";

    // Call Konnect API
    const body = {
      receiverWalletId: KONNECT_WALLET_ID,
      token: selectedPlan.currency,
      amount: selectedPlan.amount,
      type: "immediate",
      description: `KidsWorld — ${selectedPlan.label} (${listing_id ?? "utilisateur"})`,
      acceptedPaymentMethods: ["bank_card", "e-DINAR", "flouci"],
      lifespan: 30, // minutes
      checkoutForm: true,
      addPaymentFeesToAmount: false,
      firstName: profile?.full_name?.split(" ")[0] ?? "",
      lastName: profile?.full_name?.split(" ").slice(1).join(" ") ?? "",
      email: profile?.email ?? user.email ?? "",
      orderId,
      webhook: `${baseUrl}/api/payment/konnect/webhook`,
      successUrl: `${baseUrl}/paiement/succes?order=${orderId}`,
      failUrl: `${baseUrl}/paiement/echec?order=${orderId}`,
      theme: "light",
    };

    const res = await fetch(`${KONNECT_API}/payments/init-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": KONNECT_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Konnect init error:", err);
      return NextResponse.json({ error: "Erreur initialisation paiement" }, { status: 502 });
    }

    const { payUrl, paymentRef } = await res.json();

    // Save paymentRef
    await supabase.from("payments").update({ payment_ref: paymentRef }).eq("id", orderId);

    return NextResponse.json({ payUrl, orderId, paymentRef });
  } catch (err) {
    console.error("Payment initiate error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
