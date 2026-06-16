"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Crown, Zap, Shield, Star, ArrowRight, Loader2 } from "lucide-react";

const FEATURES_FREE = [
  "Fiche listing de base",
  "1 photo",
  "Apparition dans les résultats",
  "Avis clients",
];

const FEATURES_PREMIUM = [
  "Position prioritaire dans les résultats",
  "Jusqu'à 20 photos + vidéo",
  "Badge Premium visible",
  "Statistiques de vues & appels",
  "Réponse aux avis",
  "Carte interactive avec localisation",
  "Support prioritaire",
  "Lien vers votre site web",
  "Bouton d'appel direct",
];

export default function PricingPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: string) => {
    setLoading(plan);
    try {
      const res = await fetch("/api/payment/konnect/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (res.status === 401) {
        // Not logged in — redirect to auth
        router.push(`/auth?redirect=/tarifs`);
        return;
      }

      const data = await res.json();
      if (data.payUrl) {
        window.location.href = data.payUrl;
      } else {
        alert("Erreur lors de l'initialisation du paiement. Réessayez.");
      }
    } catch {
      alert("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      {/* Header */}
      <div className="bg-[#0D2461] text-white py-16 px-5 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 bg-[#F5C518]/15 border border-[#F5C518]/30 rounded-full px-3 py-1 mb-4">
            <Crown size={13} className="text-[#F5C518]" />
            <span className="text-[11px] font-extrabold text-[#F5C518] uppercase tracking-wider">KidsWorld Premium</span>
          </div>
          <h1 className="font-bebas text-[clamp(36px,5vw,60px)] tracking-wide mb-3">
            Boostez votre visibilité
          </h1>
          <p className="text-white/60 text-[15px] max-w-xl mx-auto leading-relaxed">
            Apparaissez en tête des résultats et attirez plus de familles grâce au plan Premium.
          </p>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-5 py-12">
        {/* Billing toggle */}
        <div className="flex items-center justify-center mb-10">
          <div className="bg-white rounded-xl border border-black/10 p-1 flex gap-1 shadow-sm">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
                billing === "monthly" ? "bg-[#0D2461] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all flex items-center gap-1.5 ${
                billing === "annual" ? "bg-[#0D2461] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Annuel
              <span className="text-[10px] font-extrabold bg-green-500 text-white px-1.5 py-0.5 rounded-full">-32%</span>
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Free plan */}
          <div className="bg-white rounded-2xl border-[1.5px] border-black/10 p-6 flex flex-col">
            <div className="mb-5">
              <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Starter</p>
              <p className="text-[36px] font-extrabold text-[#111827] leading-none mb-1">
                Gratuit
              </p>
              <p className="text-[13px] text-gray-400">Pour commencer</p>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {FEATURES_FREE.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[13px] text-gray-600">
                  <CheckCircle size={15} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push("/auth")}
              className="w-full border-2 border-[#0D2461] text-[#0D2461] text-[14px] font-extrabold py-3.5 rounded-xl hover:bg-[#0D2461]/5 transition-all"
            >
              Créer un compte gratuit
            </button>
          </div>

          {/* Premium plan */}
          <div className="bg-[#0D2461] rounded-2xl border-[1.5px] border-[#F5C518]/30 p-6 flex flex-col relative overflow-hidden shadow-xl">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#F5C518] rounded-full opacity-[0.06] blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#F26522] rounded-full opacity-[0.08] blur-xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-extrabold text-[#F5C518]/80 uppercase tracking-wider">Premium</p>
                <div className="flex items-center gap-1 bg-[#F5C518]/10 border border-[#F5C518]/20 rounded-full px-2.5 py-0.5">
                  <Star size={10} fill="#F5C518" className="text-[#F5C518]" />
                  <span className="text-[10px] font-extrabold text-[#F5C518]">Recommandé</span>
                </div>
              </div>

              <div className="mb-5">
                {billing === "annual" ? (
                  <>
                    <p className="text-[36px] font-extrabold text-white leading-none">
                      33 TND<span className="text-[16px] font-bold text-white/50">/mois</span>
                    </p>
                    <p className="text-[13px] text-white/40 mt-1">Facturé 399 TND/an · économisez 189 TND</p>
                  </>
                ) : (
                  <>
                    <p className="text-[36px] font-extrabold text-white leading-none">
                      49 TND<span className="text-[16px] font-bold text-white/50">/mois</span>
                    </p>
                    <p className="text-[13px] text-white/40 mt-1">Facturé mensuellement</p>
                  </>
                )}
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {FEATURES_PREMIUM.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-white/80">
                    <CheckCircle size={15} className="text-[#F5C518] flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(billing === "annual" ? "premium_annual" : "premium_monthly")}
                disabled={!!loading}
                className="w-full bg-[#F5C518] text-[#0D2461] text-[14px] font-extrabold py-4 rounded-xl hover:bg-[#F9D94B] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Passer à Premium
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p className="text-[11px] text-white/30 text-center mt-3">
                Paiement sécurisé · Konnect · Visa · eDinar
              </p>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { icon: Shield, title: "Paiement sécurisé", text: "SSL 256-bit · certifié Konnect" },
            { icon: Zap, title: "Activation immédiate", text: "Votre listing passe Premium en quelques secondes" },
            { icon: Crown, title: "Sans engagement", text: "Résiliez à tout moment depuis votre espace" },
          ].map((b) => (
            <div key={b.title} className="bg-white rounded-2xl p-4 text-center border border-black/8 shadow-sm">
              <div className="w-10 h-10 bg-[#0D2461]/5 rounded-xl flex items-center justify-center mx-auto mb-2">
                <b.icon size={18} className="text-[#0D2461]" />
              </div>
              <p className="text-[13px] font-extrabold text-[#111827] mb-0.5">{b.title}</p>
              <p className="text-[11px] text-gray-400">{b.text}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-black/8 p-6 shadow-sm">
          <h3 className="font-bebas text-[22px] text-[#0D2461] tracking-wide mb-5">Questions fréquentes</h3>
          <div className="space-y-4">
            {[
              { q: "Comment fonctionne le paiement ?", a: "Via Konnect, la plateforme de paiement tunisienne de référence. Vous pouvez payer par carte bancaire Visa/Mastercard, eDinar ou Flouci." },
              { q: "Mon listing apparaît-il immédiatement ?", a: "Oui, dès que le paiement est confirmé par Konnect (généralement en quelques secondes), votre listing passe automatiquement en mode Premium." },
              { q: "Puis-je annuler mon abonnement ?", a: "Oui, vous pouvez résilier à tout moment depuis votre espace client. L'abonnement reste actif jusqu'à la fin de la période payée." },
              { q: "Y a-t-il un engagement ?", a: "Non, aucun engagement. Le plan mensuel peut être annulé n'importe quand. Le plan annuel est facturé en une fois pour 12 mois." },
            ].map((item) => (
              <div key={item.q} className="pb-4 border-b border-black/5 last:border-0 last:pb-0">
                <p className="text-[14px] font-extrabold text-[#111827] mb-1.5">{item.q}</p>
                <p className="text-[13px] text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
