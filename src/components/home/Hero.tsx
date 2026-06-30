"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Star, Heart, BookOpen, Zap, Palette, Gift, ShoppingBag, Sparkles } from "lucide-react";

const QUICK_FILTERS = [
  { label: "Parcs & Jeux", slug: "loisirs", color: "#0EA5E9", bg: "#E0F2FE" },
  { label: "Crèches",      slug: "education", color: "#7C3AED", bg: "#EDE9FE" },
  { label: "Sport & Arts", slug: "ateliers",  color: "#F43F5E", bg: "#FFF1F2" },
  { label: "Anniversaires",slug: "fetes",     color: "#EC4899", bg: "#FDF2F8" },
  { label: "Pédiatres",    slug: "sante",     color: "#10B981", bg: "#ECFDF5" },
  { label: "Shopping",     slug: "shopping",  color: "#F59E0B", bg: "#FFFBEB" },
];

const VILLES = ["Tunis", "La Marsa", "Ariana", "Sfax", "Sousse", "Nabeul", "Bizerte", "Hammamet", "Ben Arous", "Manouba"];

const FLOATING_BADGES = [
  { Icon: Star,        label: "1 200+ avis",     color: "#F59E0B", bg: "#FFFBEB",  pos: "top-[18%] right-[6%]",  delay: "0s" },
  { Icon: MapPin,      label: "48 villes",        color: "#F43F5E", bg: "#FFF1F2",  pos: "bottom-[28%] right-[4%]", delay: "0.4s" },
  { Icon: Sparkles,    label: "Vérifié & fiable", color: "#7C3AED", bg: "#EDE9FE",  pos: "top-[38%] left-[2%]",   delay: "0.8s" },
];

export default function Hero() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [ville, setVille] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSug, setShowSug] = useState(false);
  const sugRef = useRef<HTMLDivElement>(null);

  const handleSearch = (q?: string, v?: string) => {
    const finalQ = q ?? search;
    const finalV = v ?? ville;
    const params = new URLSearchParams();
    if (finalQ.trim()) params.set("q", finalQ.trim());
    if (finalV.trim()) params.set("ville", finalV.trim());
    router.push(`/listings?${params.toString()}`);
  };

  const POPULAR = ["Crèche", "Cours de natation", "Pédiatre", "Anniversaire", "Parc indoor", "Soutien scolaire"];
  const getSmartSuggestions = (q: string) => {
    if (!q.trim()) return [];
    return POPULAR.filter(s => s.toLowerCase().includes(q.toLowerCase())).slice(0, 4);
  };

  useEffect(() => {
    setSuggestions(getSmartSuggestions(search));
    setShowSug(search.length > 1);
  }, [search]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (sugRef.current && !sugRef.current.contains(e.target as Node)) setShowSug(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <section className="relative overflow-hidden" style={{ background: "linear-gradient(150deg, #071640 0%, #0D2461 55%, #16306E 100%)" }}>

      {/* Decorative color blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[420px] h-[420px] rounded-full opacity-[0.12] blur-3xl"
          style={{ background: "#F26522", top: "-100px", right: "-60px" }} />
        <div className="absolute w-[300px] h-[300px] rounded-full opacity-[0.1] blur-3xl"
          style={{ background: "#06B6D4", bottom: "-60px", left: "5%" }} />
        <div className="absolute w-[200px] h-[200px] rounded-full opacity-[0.08] blur-2xl"
          style={{ background: "#7C3AED", top: "30%", left: "25%" }} />
        {/* Colorful dots */}
        {[
          { color: "#F26522", size: 10, top: "15%", left: "12%" },
          { color: "#0EA5E9", size: 7, top: "65%", left: "42%" },
          { color: "#10B981", size: 12, top: "75%", right: "18%" },
          { color: "#EC4899", size: 8, top: "20%", right: "30%" },
          { color: "#F59E0B", size: 6, top: "50%", left: "8%" },
        ].map((d, i) => (
          <div key={i} className="absolute rounded-full opacity-40"
            style={{ width: d.size, height: d.size, background: d.color, top: d.top, left: (d as any).left, right: (d as any).right }} />
        ))}
      </div>

      {/* Floating badges */}
      {FLOATING_BADGES.map((b, i) => (
        <div key={i}
          className="absolute hidden lg:flex items-center gap-2 px-3 py-2 rounded-2xl shadow-lg"
          style={{
            background: b.bg, color: b.color,
            ...(b.pos.includes("top-[18%] right") ? { top: "18%", right: "6%" } :
                b.pos.includes("bottom-[28%] right") ? { bottom: "28%", right: "4%" } :
                { top: "38%", left: "2%" }),
            animation: `float 3s ease-in-out ${b.delay} infinite alternate`,
          }}>
          <b.Icon size={13} />
          <span className="text-[11px] font-bold whitespace-nowrap">{b.label}</span>
        </div>
      ))}

      <style>{`
        @keyframes float { from { transform: translateY(0px); } to { transform: translateY(-8px); } }
      `}</style>

      <div className="max-w-[1140px] mx-auto px-5 py-[80px] md:py-[100px] relative z-10">
        <div className="max-w-[680px] mx-auto text-center">

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/80 text-[11.5px] font-semibold px-4 py-1.5 rounded-full mb-7 backdrop-blur-sm">
            <Sparkles size={12} className="text-[#F59E0B]" />
            Le guide des familles en Tunisie
          </div>

          {/* Heading */}
          <h1 className="text-[clamp(32px,5.5vw,60px)] font-extrabold text-white leading-[1.1] tracking-tight mb-4">
            Tout pour vos{" "}
            <span className="relative inline-block">
              <span style={{ color: "#F26522" }}>enfants</span>
              <span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full opacity-50" style={{ background: "#F26522" }} />
            </span>
            {" "}près de chez vous
          </h1>

          <p className="text-[15px] text-white/60 leading-relaxed mb-10 max-w-[500px] mx-auto">
            Crèches, loisirs, santé, ateliers — trouvez les meilleurs établissements pour vos enfants en quelques secondes.
          </p>

          {/* Search box */}
          <div className="bg-white rounded-2xl p-2 shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative" ref={sugRef}>
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => search.length > 1 && setShowSug(true)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Que cherchez-vous ? (crèche, sport, pédiatre...)"
                className="w-full pl-10 pr-4 py-3 text-[14px] text-gray-800 placeholder-gray-400 outline-none rounded-xl bg-gray-50 focus:bg-white transition-colors"
              />
              {showSug && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-black/8 z-50 overflow-hidden">
                  {suggestions.map(s => (
                    <button key={s} onClick={() => { setSearch(s); setShowSug(false); handleSearch(s); }}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                      <Search size={12} className="text-gray-400" /> {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px bg-gray-200 hidden md:block self-stretch" />

            <div className="flex-shrink-0 md:w-44">
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select value={ville} onChange={e => setVille(e.target.value)}
                  className="w-full pl-8 pr-3 py-3 text-[13px] text-gray-700 outline-none rounded-xl bg-gray-50 focus:bg-white transition-colors appearance-none cursor-pointer">
                  <option value="">Toute la Tunisie</option>
                  {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <button onClick={() => handleSearch()}
              className="flex items-center justify-center gap-2 bg-[#F26522] hover:bg-[#e05a1a] text-white font-bold text-[14px] px-6 py-3 rounded-xl transition-all shadow-[0_4px_16px_rgba(242,101,34,0.4)] whitespace-nowrap">
              <Search size={15} /> Rechercher
            </button>
          </div>

          {/* Quick filters */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {QUICK_FILTERS.map(f => (
              <button key={f.slug} onClick={() => router.push(`/listings?cat=${f.slug}`)}
                className="flex items-center gap-1.5 text-[12px] font-bold px-3.5 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95"
                style={{ background: f.bg, color: f.color }}>
                {f.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Bottom wave */}
      <div className="relative -mb-1">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="w-full block" style={{ height: 48 }}>
          <path d="M0,48 C360,0 1080,0 1440,48 L1440,48 L0,48 Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
