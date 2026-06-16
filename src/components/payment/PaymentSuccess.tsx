"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Crown, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order");
  const [status, setStatus] = useState<"checking" | "confirmed" | "pending" | "failed">("checking");
  const [plan, setPlan] = useState<string>("");

  useEffect(() => {
    if (!orderId) { router.push("/"); return; }

    let attempts = 0;
    const check = async () => {
      attempts++;
      try {
        const res = await fetch(`/api/payment/konnect/verify?order=${orderId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPlan(data.plan ?? "");
        if (data.status === "completed") {
          setStatus("confirmed");
        } else if (data.status === "failed" || attempts > 8) {
          setStatus(data.status === "failed" ? "failed" : "pending");
        } else {
          setTimeout(check, 2500);
        }
      } catch {
        if (attempts > 3) setStatus("pending");
        else setTimeout(check, 2500);
      }
    };
    check();
  }, [orderId, router]);

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-[#0D2461] border-t-transparent animate-spin mx-auto mb-5" />
          <p className="font-extrabold text-[#111827] text-[18px]">Vérification du paiement...</p>
          <p className="text-gray-400 text-sm mt-1">Veuillez patienter quelques secondes</p>
        </div>
      </div>
    );
  }

  if (status === "confirmed") {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-green-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-amber-100 border border-amber-200 rounded-full px-3 py-1 mb-4">
            <Crown size={12} className="text-amber-700" />
            <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider">Premium activé !</span>
          </div>
          <h1 className="font-bebas text-[36px] text-[#0D2461] tracking-wide mb-2">Félicitations !</h1>
          <p className="text-gray-500 text-[14px] leading-relaxed mb-6">
            Votre paiement a été validé avec succès. Votre listing est maintenant en mode{" "}
            <strong>{plan === "premium_annual" ? "Premium Annuel" : "Premium Mensuel"}</strong>.
          </p>
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 w-full bg-[#0D2461] text-white font-extrabold text-[14px] py-4 rounded-xl hover:bg-[#1A3A8F] transition-colors"
            >
              Voir mon espace <ArrowRight size={16} />
            </Link>
            <Link
              href="/listings"
              className="block w-full border-2 border-black/10 text-gray-600 font-bold text-[14px] py-3.5 rounded-xl hover:border-[#0D2461]/20 transition-colors"
            >
              Explorer les listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <Loader2 size={40} className="text-[#F26522] mx-auto mb-4 animate-spin" />
          <h2 className="font-bebas text-[28px] text-[#0D2461] mb-2">Paiement en cours de traitement</h2>
          <p className="text-gray-400 text-[13px] mb-6">
            Votre paiement est en cours de validation. Cela peut prendre quelques minutes.
            Vous recevrez une notification dès la confirmation.
          </p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-[#0D2461] text-white font-extrabold text-[14px] py-3 px-6 rounded-xl hover:bg-[#1A3A8F] transition-colors">
            Aller à mon espace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-red-100">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="font-bebas text-[28px] text-[#111827] mb-2">Paiement non confirmé</h2>
        <p className="text-gray-400 text-[13px] mb-6">
          Votre paiement n&apos;a pas pu être confirmé. Si vous avez été débité, contactez notre support.
        </p>
        <div className="space-y-3">
          <Link href="/tarifs" className="block w-full bg-[#F26522] text-white font-extrabold text-[14px] py-3.5 rounded-xl hover:bg-[#FF8C4B] transition-colors">
            Réessayer
          </Link>
          <a href="mailto:support@kidsworld.tn" className="block text-[13px] text-gray-400 hover:text-gray-600">
            support@kidsworld.tn
          </a>
        </div>
      </div>
    </div>
  );
}
