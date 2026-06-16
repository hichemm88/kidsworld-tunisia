import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { Heart, Shield, Star, Users, Search, MapPin, MessageCircle, CheckCircle } from "lucide-react";

export const metadata = {
  title: "À propos — KidsWorld Tunisia",
  description: "Découvrez KidsWorld Tunisia, la plateforme N°1 des parents tunisiens pour trouver les meilleurs services pour leurs enfants.",
};

const STATS = [
  { value: "1 200+", label: "Établissements référencés" },
  { value: "50+", label: "Villes couvertes" },
  { value: "8 500+", label: "Parents actifs" },
  { value: "4.8/5", label: "Note moyenne" },
];

const VALUES = [
  { icon: <Heart size={22} className="text-[#F26522]" />, title: "Confiance", desc: "Chaque listing est vérifié et validé par notre équipe avant publication." },
  { icon: <Shield size={22} className="text-[#0D2461]" />, title: "Sécurité", desc: "Vos données et celles de vos enfants sont protégées et jamais revendues." },
  { icon: <Star size={22} className="text-[#F5C518]" />, title: "Qualité", desc: "Seuls les établissements avec des avis positifs restent mis en avant." },
  { icon: <Users size={22} className="text-green-600" />, title: "Communauté", desc: "Une communauté de parents tunisiens qui s'entraident et partagent leurs expériences." },
];

const STEPS = [
  { icon: <Search size={20} />, title: "Cherchez", desc: "Utilisez notre moteur de recherche ou demandez à Kiwo, notre IA, de vous guider." },
  { icon: <MapPin size={20} />, title: "Trouvez", desc: "Comparez les établissements, lisez les avis, consultez les horaires et les tarifs." },
  { icon: <MessageCircle size={20} />, title: "Contactez", desc: "Appelez directement ou laissez un avis pour aider les autres parents." },
];

export default function AProposPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="bg-[#0D2461] py-20 px-5 text-center">
        <div className="max-w-[640px] mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-[12px] font-bold text-white/70 mb-6">
            🐧 Propulsé par Kiwo IA
          </div>
          <h1 className="font-bebas text-[52px] md:text-[68px] tracking-wide text-white leading-none mb-4">
            L&apos;annuaire<br />
            <span className="text-[#F26522]">des parents</span><br />
            tunisiens
          </h1>
          <p className="text-[15px] text-white/60 leading-relaxed mb-8">
            KidsWorld Tunisia réunit en un seul endroit tous les services dont votre enfant a besoin :
            médecins, écoles, activités, fêtes et bien plus encore.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/listings"
              className="bg-[#F26522] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#FF8C4B] transition-all">
              Explorer les listings
            </Link>
            <Link href="/auth/signup"
              className="border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition-all">
              Rejoindre la communauté
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-10 px-5">
        <div className="max-w-[900px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.value} className="text-center">
              <p className="font-bebas text-[40px] text-[#0D2461] tracking-wide leading-none">{s.value}</p>
              <p className="text-[12px] text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="bg-[#F7F6F2] py-16 px-5">
        <div className="max-w-[760px] mx-auto text-center">
          <h2 className="font-bebas text-[36px] md:text-[44px] text-[#0D2461] tracking-wide mb-6">Notre mission</h2>
          <p className="text-[15px] text-gray-600 leading-relaxed mb-4">
            Être parents en Tunisie, c&apos;est chercher constamment les meilleures ressources pour ses enfants.
            KidsWorld Tunisia est né de ce constat : <strong>il manquait un annuaire fiable, complet et facile à utiliser</strong>
            pour les familles tunisiennes.
          </p>
          <p className="text-[15px] text-gray-600 leading-relaxed">
            Notre IA Kiwo va encore plus loin : elle comprend vos besoins, répond à vos questions parentales,
            et vous guide vers les meilleurs établissements autour de vous.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-16 px-5">
        <div className="max-w-[900px] mx-auto">
          <h2 className="font-bebas text-[36px] md:text-[44px] text-[#0D2461] tracking-wide text-center mb-10">
            Nos valeurs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="flex items-start gap-4 p-5 rounded-2xl border border-black/8 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-[#F7F6F2] flex items-center justify-center flex-shrink-0">
                  {v.icon}
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-[#0D2461] mb-1">{v.title}</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="bg-[#F7F6F2] py-16 px-5">
        <div className="max-w-[760px] mx-auto text-center">
          <h2 className="font-bebas text-[36px] md:text-[44px] text-[#0D2461] tracking-wide mb-10">
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-black/8">
                <div className="absolute -top-3 -left-3 w-7 h-7 bg-[#F26522] text-white rounded-full text-[13px] font-extrabold flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#0D2461]/8 text-[#0D2461] flex items-center justify-center mb-4">
                  {s.icon}
                </div>
                <h3 className="font-bold text-[15px] text-[#0D2461] mb-2">{s.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0D2461] py-16 px-5 text-center">
        <div className="max-w-[540px] mx-auto">
          <h2 className="font-bebas text-[40px] md:text-[52px] text-white tracking-wide leading-none mb-4">
            Prêt à rejoindre<br />
            <span className="text-[#F5C518]">la communauté ?</span>
          </h2>
          <p className="text-[14px] text-white/50 mb-8">
            Rejoignez des milliers de parents qui font confiance à KidsWorld Tunisia.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/signup"
              className="bg-[#F26522] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#FF8C4B] transition-all w-full sm:w-auto">
              Créer un compte gratuit
            </Link>
            <Link href="/listings"
              className="border border-white/30 text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition-all w-full sm:w-auto">
              Explorer sans s&apos;inscrire
            </Link>
          </div>
          <div className="flex items-center justify-center gap-4 mt-8">
            {["100% gratuit pour les parents", "Sans engagement", "Données sécurisées"].map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-[11px] text-white/40">
                <CheckCircle size={12} className="text-green-400" /> {t}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
