"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Sparkles, ArrowRight, ChevronDown } from "lucide-react";

const QUICK_FILTERS = [
  { label: "🏥 Pédiatres", cat: "sante" },
  { label: "🎪 Parcs de jeu", cat: "loisirs" },
  { label: "🎓 Cours de langue", cat: "education" },
  { label: "🎂 Anniversaires", cat: "fetes" },
  { label: "⚽ Sport", cat: "ateliers" },
  { label: "🛍 Shopping enfant", cat: "shopping" },
];

const VILLES = ["Tunis", "La Marsa", "Ariana", "Ben Arous", "La Soukra", "Ennasr", "El Menzah"];

const POPULAR_SEARCHES = [
  "Pédiatre les berges du lac",
  "Cours de natation enfants",
  "Anniversaire trampoline",
  "École maternelle bilingue",
  "Orthophoniste Tunis",
  "Activités été enfants",
];

// Semantic suggestions based on what the user types
function getSmartSuggestions(q: string): string[] {
  if (!q || q.length < 2) return [];
  const lower = q.toLowerCase();
  const all = [
    "Pédiatre", "Dentiste enfant", "Orthophoniste", "Psychologue enfant",
    "Cours de natation", "Cours d'anglais", "Cours de musique", "Arts plastiques",
    "Trampoline", "Accrobranche", "Mini golf", "Bowling",
    "Anniversaire décor", "Salle des fêtes", "Animation anniversaire",
    "École maternelle", "École primaire", "Jardin d'enfant",
    "Baby gym", "Yoga kids", "Judo enfant", "Football enfant",
    "Puériculture", "Poussettes", "Jouets éducatifs", "Livres enfant",
  ];
  return all.filter((s) => s.toLowerCase().startsWith(lower) || s.toLowerCase().includes(lower)).slice(0, 5);
}

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [ville, setVille] = useState("Tunis");
  const [showVilles, setShowVilles] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const villeRef = useRef<HTMLDivElement>(null);

  // Debounced suggestions
  useEffect(() => {
    const t = setTimeout(() => {
      setSuggestions(getSmartSuggestions(query));
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (villeRef.current && !villeRef.current.contains(e.target as Node)) {
        setShowVilles(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (q?: string) => {
    const finalQuery = q ?? query;
    if (!finalQuery.trim() && ville === "Tunis") {
      router.push("/listings");
      return;
    }
    const params = new URLSearchParams();
    if (finalQuery.trim()) params.set("q", finalQuery.trim());
    if (ville !== "Tunis") params.set("ville", ville);
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <section className="bg-[#0D2461] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-[#1A3A8F] rounded-full opacity-40" />
        <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] bg-[#F26522] rounded-full opacity-[0.06]" />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-[#F5C518] rounded-full opacity-[0.04] blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1140px] mx-auto px-5 py-[80px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left column */}
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[#F5C518]/10 border border-[#F5C518]/25 rounded-full px-3.5 py-1 mb-6">
            <Sparkles size={12} className="text-[#F5C518]" />
            <span className="text-[11px] font-extrabold text-[#F5C518] uppercase tracking-wider">
              N°1 en Tunisie · +2400 établissements
            </span>
          </div>

          <h1 className="font-bebas text-[clamp(48px,5.5vw,74px)] leading-[0.92] text-white tracking-wide mb-3">
            Tout l&apos;univers{" "}
            <span className="text-[#F5C518]">de votre enfant</span>
            <br />
            <span className="text-[#F26522]">en un seul endroit</span>
          </h1>

          <p className="text-white/55 text-[15px] leading-relaxed mb-8 max-w-[480px]">
            Médecins, écoles, activités, fêtes d&apos;anniversaire…
            Trouvez les meilleurs services pour vos enfants près de chez vous.
          </p>

          {/* Search form */}
          <div className="relative mb-5">
            <div
              className={`bg-white rounded-2xl flex items-center shadow-[0_16px_50px_rgba(0,0,0,0.3)] transition-all duration-200 ${
                focused ? "shadow-[0_16px_50px_rgba(242,101,34,0.25),0_0_0_3px_rgba(242,101,34,0.2)]" : ""
              }`}
            >
              <div className="pl-4 pr-1">
                <Search size={18} className={`transition-colors ${focused ? "text-[#F26522]" : "text-gray-400"}`} />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => { setFocused(true); setShowSuggestions(true); }}
                onBlur={() => { setFocused(false); setTimeout(() => setShowSuggestions(false), 200); }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Pédiatre, cours de natation, anniversaire..."
                className="flex-1 border-none outline-none text-[15px] text-[#111827] bg-transparent py-4 px-2.5 min-w-0"
              />
              {/* Ville selector */}
              <div ref={villeRef} className="relative flex-shrink-0">
                <div className="w-px h-8 bg-black/10 mr-2" />
                <button
                  type="button"
                  onClick={() => setShowVilles(!showVilles)}
                  className="flex items-center gap-1.5 text-[13px] font-bold text-gray-500 pr-2 hover:text-[#0D2461] transition-colors"
                >
                  <MapPin size={13} className="text-[#F26522]" />
                  <span>{ville}</span>
                  <ChevronDown size={12} className={`transition-transform ${showVilles ? "rotate-180" : ""}`} />
                </button>
                {showVilles && (
                  <div className="absolute top-full right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-black/10 py-1 z-50">
                    {VILLES.map((v) => (
                      <button
                        key={v}
                        onClick={() => { setVille(v); setShowVilles(false); }}
                        className={`w-full text-left px-3 py-2 text-[13px] font-bold transition-colors ${
                          ville === v ? "text-[#F26522] bg-orange-50" : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {ville === v && "✓ "}{v}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleSearch()}
                className="bg-[#F26522] hover:bg-[#FF8C4B] active:scale-95 text-white rounded-[14px] m-1.5 px-5 py-3 text-[14px] font-extrabold transition-all whitespace-nowrap"
              >
                Rechercher
              </button>
            </div>

            {/* AI suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-black/10 overflow-hidden z-50">
                <div className="px-4 py-2 border-b border-black/5 flex items-center gap-2">
                  <Sparkles size={12} className="text-[#F26522]" />
                  <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wide">Suggestions intelligentes</span>
                </div>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onMouseDown={() => { setQuery(s); handleSearch(s); }}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-[#FFF5EE] hover:text-[#F26522] transition-colors flex items-center gap-2"
                  >
                    <Search size={12} className="text-gray-300" />
                    {s}
                    <ArrowRight size={12} className="ml-auto text-gray-300" />
                  </button>
                ))}
              </div>
            )}

            {/* Popular searches (when input empty + focused) */}
            {showSuggestions && !query && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-black/10 overflow-hidden z-50">
                <div className="px-4 py-2 border-b border-black/5">
                  <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wide">Recherches populaires</span>
                </div>
                {POPULAR_SEARCHES.map((s) => (
                  <button
                    key={s}
                    onMouseDown={() => { setQuery(s); handleSearch(s); }}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-gray-600 hover:bg-[#FFF5EE] hover:text-[#F26522] transition-colors flex items-center gap-2"
                  >
                    <span className="text-gray-300">🔥</span>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick filter pills */}
          <div className="flex flex-wrap gap-2">
            {QUICK_FILTERS.map((f) => (
              <button
                key={f.cat}
                onClick={() => router.push(`/listings?cat=${f.cat}`)}
                className="text-[12px] font-bold px-3 py-1.5 rounded-full border border-white/15 bg-white/8 text-white/75 hover:bg-white/15 hover:text-white hover:border-white/30 transition-all whitespace-nowrap"
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Trust signals */}
          <div className="flex items-center gap-5 mt-8 flex-wrap">
            {[
              { value: "2 400+", label: "établissements" },
              { value: "18 000+", label: "familles" },
              { value: "4.8 ⭐", label: "note moyenne" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-white font-extrabold text-[20px] leading-none">{s.value}</p>
                <p className="text-white/45 text-[11px] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — phone mockup */}
        <div className="hidden lg:flex justify-center items-center">
          <div className="relative">
            {/* Glow */}
            <div className="absolute inset-0 bg-[#F26522] rounded-[40px] blur-3xl opacity-20 scale-90" />
            <div className="relative w-[270px] bg-[#1a1a2e] rounded-[36px] p-3 shadow-[0_30px_80px_rgba(0,0,0,0.5)] border-[1px] border-white/10">
              {/* Notch */}
              <div className="w-20 h-5 bg-[#111] rounded-b-xl mx-auto mb-1" />
              <div className="rounded-[26px] overflow-hidden bg-[#F7F6F2]">
                {/* App bar */}
                <div className="bg-[#0D2461] px-3 py-2.5 flex items-center gap-2">
                  <span className="font-bebas text-[14px] tracking-[2px] text-white">KidsWorld</span>
                  <div className="flex-1 bg-white/15 rounded-lg px-2 py-1 text-[10px] text-white/50 flex items-center gap-1">
                    <Search size={8} className="text-white/50" />
                    Rechercher...
                  </div>
                </div>
                {/* Cards */}
                <div className="p-2.5 flex flex-col gap-2">
                  {[
                    { emoji: "🏥", name: "Dr. Ben Ali Sana", loc: "Les Berges du Lac", stars: "4.9", badge: "Ouvert", badgeColor: "bg-green-100 text-green-700", prem: true },
                    { emoji: "🎪", name: "JumPark Tunis", loc: "La Marsa", stars: "4.8", badge: "Ouvert", badgeColor: "bg-green-100 text-green-700", prem: true },
                    { emoji: "🎓", name: "Kids English Club", loc: "Manar 2", stars: "4.7", badge: "Fermé", badgeColor: "bg-red-100 text-red-600", prem: false },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-xl border border-black/8 flex overflow-hidden shadow-sm">
                      <div className="w-[58px] h-[58px] flex items-center justify-center text-2xl flex-shrink-0 bg-[#F7F6F2]">
                        {item.emoji}
                      </div>
                      <div className="p-2 flex-1 min-w-0">
                        <p className="text-[11px] font-extrabold text-[#111827] mb-0.5 truncate">{item.name}</p>
                        <p className="text-[9px] text-gray-400 mb-1 truncate">{item.loc}</p>
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[10px] text-[#F5C518] font-extrabold">⭐ {item.stars}</span>
                          <span className={`text-[8px] font-bold ${item.badgeColor} px-1.5 py-0.5 rounded-full`}>{item.badge}</span>
                          {item.prem && <span className="text-[8px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">Premium</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Map preview */}
                <div className="mx-2.5 mb-2.5 h-[70px] rounded-xl overflow-hidden bg-[#E8F4F8] flex items-center justify-center border border-[#cde] relative">
                  <div className="text-[9px] text-gray-400 z-10">🗺️ Carte interactive</div>
                  {/* Fake map pins */}
                  {[{ x: 30, y: 30, c: "#F26522" }, { x: 65, y: 50, c: "#0D2461" }, { x: 80, y: 20, c: "#F5C518" }].map((p, i) => (
                    <div key={i} className="absolute w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ left: `${p.x}%`, top: `${p.y}%`, background: p.c }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="relative h-10 overflow-hidden -mt-1">
        <svg viewBox="0 0 1200 48" preserveAspectRatio="none" className="absolute bottom-0 w-full h-10" fill="#F7F6F2">
          <path d="M0,48 C300,0 900,0 1200,48 L1200,48 L0,48 Z" />
        </svg>
      </div>
    </section>
  );
}
