import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Check, X, Crown, TrendingUp, Eye, Star, BarChart2, MessageCircle, Zap } from "lucide-react";

const FEATURES = [
  { label: "Fiche publique visible", free: true, premium: true },
  { label: "Informations de base (nom, adresse, horaires)", free: true, premium: true },
  { label: "1 photo de couverture", free: true, premium: true },
  { label: "Avis des parents", free: true, premium: true },
  { label: "Galerie de 10 photos", free: false, premium: true },
  { label: "Position prioritaire dans les recherches", free: false, premium: true },
  { label: "Badge Premium vérifié", free: false, premium: true },
  { label: "Statistiques de vues et clics", free: false, premium: true },
  { label: "Réponse aux avis", free: false, premium: true },
  { label: "Mise en avant sur la homepage", free: false, premium: true },
  { label: "Encart anniversaires", free: false, premium: true },
  { label: "Support prioritaire", free: false, premium: true },
];

const PLANS = [
  { name: "Mensuel", price: "99", period: "mois", badge: null, saving: null },
  { name: "Trimestriel", price: "79", period: "mois", badge: "Populaire", saving: "Économisez 60 TND" },
  { name: "Annuel", price: "59", period: "mois", badge: "Meilleur prix", saving: "Économisez 480 TND" },
];

const STATS = [
  { icon: <Eye size={20} />, value: "3×", label: "plus de vues", color: "text-blue-600 bg-blue-50" },
  { icon: <TrendingUp size={20} />, value: "5×", label: "plus de clics", color: "text-green-600 bg-green-50" },
  { icon: <Star size={20} />, value: "+42%", label: "de contacts WhatsApp", color: "text-amber-600 bg-amber-50" },
  { icon: <BarChart2 size={20} />, value: "#1", label: "position moyenne", color: "text-purple-600 bg-purple-50" },
];

export default function PremiumPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F7F6F2]">

        {/* Hero */}
        <div className="bg-[#0D2461] py-16 px-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1A3A8F] rounded-full opacity-40 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F26522] rounded-full opacity-10 translate-y-1/2 -translate-x-1/2" />
          <div className="max-w-[700px] mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#F5C518]/15 border border-[#F5C518]/30 rounded-full px-4 py-1.5 mb-5">
              <Crown size={14} className="text-[#F5C518]" />
              <span className="text-[12px] font-extrabold text-[#F5C518] uppercase tracking-wider">KidsWorld Premium</span>
            </div>
            <h1 className="font-bebas text-[clamp(36px,5vw,60px)] text-white tracking-wide leading-tight mb-4">
              Boostez votre visibilité<br />
              <span className="text-[#F5C518]">auprès des parents</span>
            </h1>
            <p className="text-[15px] text-white/60 leading-relaxed max-w-[520px] mx-auto mb-8">
              Les établissements Premium reçoivent en moyenne 3× plus de visites et 5× plus de contacts que les fiches gratuites.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {STATS.map((s, i) => (
                <div key={i} className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
                  <p className="font-bebas text-[32px] text-white tracking-wide leading-none">{s.value}</p>
                  <p className="text-[11px] text-white/60 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-[700px] mx-auto px-5 py-10">

          {/* Plans */}
          <h2 className="font-bebas text-[28px] text-[#0D2461] tracking-wide text-center mb-2">Choisissez votre formule</h2>
          <p className="text-[14px] text-gray-400 text-center mb-6">Sans engagement · Annulable à tout moment</p>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {PLANS.map((plan, i) => (
              <div key={i} className={`rounded-2xl border-[2px] p-5 relative ${i === 1 ? "border-[#F26522] bg-white shadow-lg shadow-orange-100" : "border-black/8 bg-white"}`}>
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap ${i === 1 ? "bg-[#F26522] text-white" : "bg-[#F5C518] text-[#071640]"}`}>
                    {plan.badge}
                  </div>
                )}
                <p className="text-[13px] font-bold text-gray-400 mb-3">{plan.name}</p>
                <div className="mb-1">
                  <span className="font-bebas text-[42px] text-[#0D2461] tracking-wide leading-none">{plan.price}</span>
                  <span className="text-[13px] text-gray-400"> TND / {plan.period}</span>
                </div>
                {plan.saving && <p className="text-[12px] font-bold text-green-600 mb-4">{plan.saving}</p>}
                {!plan.saving && <div className="mb-4 h-[20px]" />}
                <Link href="/auth/signup?role=pro"
                  className={`block w-full text-center text-[13px] font-extrabold py-3 rounded-xl transition-all ${i === 1 ? "bg-[#F26522] text-white hover:bg-[#FF8C4B]" : "bg-[#0D2461] text-white hover:bg-[#1A3A8F]"}`}>
                  Commencer →
                </Link>
              </div>
            ))}
          </div>

          {/* Comparatif */}
          <h2 className="font-bebas text-[24px] text-[#0D2461] tracking-wide mb-4">Gratuit vs Premium</h2>
          <div className="bg-white rounded-2xl border border-black/8 overflow-hidden mb-8">
            {/* En-têtes */}
            <div className="grid grid-cols-3 bg-[#F7F6F2] border-b border-black/8 px-5 py-3">
              <div className="col-span-1" />
              <div className="text-center">
                <p className="text-[12px] font-extrabold text-gray-400 uppercase tracking-wide">Gratuit</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center gap-1">
                  <Crown size={12} className="text-[#F26522]" />
                  <p className="text-[12px] font-extrabold text-[#F26522] uppercase tracking-wide">Premium</p>
                </div>
              </div>
            </div>

            {FEATURES.map((f, i) => (
              <div key={i} className={`grid grid-cols-3 items-center px-5 py-3 ${i < FEATURES.length - 1 ? "border-b border-black/8" : ""}`}>
                <p className="text-[13px] text-gray-600 col-span-1 pr-2">{f.label}</p>
                <div className="flex justify-center">
                  {f.free
                    ? <Check size={16} className="text-green-500" />
                    : <X size={16} className="text-gray-200" />}
                </div>
                <div className="flex justify-center">
                  {f.premium
                    ? <Check size={16} className="text-[#F26522]" />
                    : <X size={16} className="text-gray-200" />}
                </div>
              </div>
            ))}
          </div>

          {/* Témoignages pros */}
          <h2 className="font-bebas text-[24px] text-[#0D2461] tracking-wide mb-4">Ce que disent nos pros</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {[
              { emoji: "🤸", name: "Jumpark Tunis", cat: "Loisirs", quote: "Depuis qu'on est passés Premium, nos réservations ont augmenté de 40%. Le badge vérifié rassure vraiment les parents.", note: 5 },
              { emoji: "🎓", name: "Kids English Club", cat: "Éducation", quote: "Les stats de vues nous ont permis de mieux comprendre notre audience. On a ajusté nos horaires et gagné 15 nouveaux élèves.", note: 5 },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl border border-black/8 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F7F6F2] flex items-center justify-center text-xl">{t.emoji}</div>
                  <div>
                    <p className="text-[13px] font-extrabold text-[#111827]">{t.name}</p>
                    <p className="text-[11px] text-gray-400">{t.cat}</p>
                  </div>
                  <span className="ml-auto text-[#F5C518] text-[13px]">{"★".repeat(t.note)}</span>
                </div>
                <p className="text-[13px] text-gray-500 italic leading-relaxed">"{t.quote}"</p>
              </div>
            ))}
          </div>

          {/* CTA final */}
          <div className="bg-[#0D2461] rounded-2xl p-6 text-center">
            <Crown size={28} className="text-[#F5C518] mx-auto mb-3" />
            <h3 className="font-bebas text-[28px] text-white tracking-wide mb-2">Prêt à booster votre établissement ?</h3>
            <p className="text-[14px] text-white/60 mb-5">Rejoignez plus de 150 professionnels qui font confiance à KidsWorld Premium.</p>
            <Link href="/auth/signup?role=pro"
              className="inline-block bg-[#F26522] text-white text-[15px] font-extrabold px-8 py-4 rounded-xl hover:bg-[#FF8C4B] transition-colors">
              Commencer gratuitement → passer Premium
            </Link>
            <p className="text-[11px] text-white/40 mt-3">1 mois d'essai offert · Sans engagement</p>
          </div>

          <div className="h-8" />
        </div>
      </div>
    </>
  );
}
