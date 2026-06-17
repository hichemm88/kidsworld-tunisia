"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search, MapPin, ChevronDown, ArrowRight,
  Heart, BookOpen, Zap, Palette, Gift, ShoppingBag,
} from "lucide-react";

const QUICK_FILTERS = [
  { label: "Pédiatres", cat: "sante", Icon: Heart },
  { label: "Parcs de jeu", cat: "loisirs", Icon: Zap },
  { label: "Cours de langue", cat: "education", Icon: BookOpen },
  { label: "Anniversaires", cat: "fetes", Icon: Gift },
  { label: "Sport & Ateliers", cat: "ateliers", Icon: Palette },
  { label: "Shopping enfant", cat: "shopping", Icon: ShoppingBag },
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

  useEffect(() => {
    const t = setTimeout(() => setSuggestions(getSmartSuggestions(query)), 200);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (villeRef.current && !villeRef.current.contains(e.target as Node)) setShowVilles(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (q?: string) => {
    const finalQuery = q ?? query;
    if (!finalQuery.trim() && ville === "Tunis") { router.push("/listings"); return; }
    const params = new URLSearchParams();
    if (finalQuery.trim()) params.set("q", finalQuery.trim());
    if (ville !== "Tunis") params.set("ville", ville);
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <section className="bg-white border-b border-black/6">
      <div className="max-w-[1140px] mx-auto px-5 pt-16 pb-14 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left */}
        <div>
          <p className="text-[12px] font-semibold text-[#F26522] tracking-widest uppercase mb-4">
            L&apos;annuaire N°1 des parents tunisiens
          </p>

          <h1 className="text-[clamp(34px,4.2vw,54px)] font-extrabold text-[#0D2461] leading-[1.1] tracking-tight mb-4">
            Tout ce qu&apos;il faut<br />
            pour votre enfant,{" "}
            <span className="text-[#F26522]">près de vous.</span>
          </h1>

          <p className="text-[16px] text-gray-500 leading-relaxed mb-8 max-w-[460px]">
            Pédiatres, écoles, activités, fêtes d&apos;anniversaire… Trouvez et comparez les meilleurs services pour vos enfants.
          </p>

          {/* Search */}
          <div className="relative mb-5">
            <div className={`bg-white rounded-2xl flex items-center border transition-all duration-200 ${
              focused ? "border-[#F26522] shadow-[0_0_0_3px_rgba(242,101,34,0.1)]" : "border-black/12 shadow-sm"
            }`}>
              <div className="pl-4 pr-1">
                <Search size={17} className={`transition-colors ${focused ? "text-[#F26522]" : "text-gray-400"}`} />
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
                className="flex-1 border-none outline-none text-[15px] text-[#111827] bg-transparent py-3.5 px-2.5 min-w-0"
              />
              <div ref={villeRef} className="relative flex-shrink-0">
                <div className="w-px h-7 bg-black/10 mr-2" />
                <button type="button" onClick={() => setShowVilles(!showVilles)}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 pr-2 hover:text-[#0D2461] transition-colors">
                  <MapPin size={13} className="text-[#F26522]" />
                  <span>{ville}</span>
                  <ChevronDown size={11} className={`transition-transform ${showVilles ? "rotate-180" : ""}`} />
                </button>
                {showVilles && (
                  <div className="absolute top-full right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-black/10 py-1 z-50">
                    {VILLES.map((v) => (
                      <button key={v} onClick={() => { setVille(v); setShowVilles(false); }}
                        className={`w-full text-left px-3 py-2 text-[13px] font-semibold transition-colors ${
                          ville === v ? "text-[#F26522] bg-orange-50" : "text-gray-600 hover:bg-gray-50"
                        }`}>
                        {ville === v && "✓ "}{v}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" onClick={() => handleSearch()}
                className="bg-[#F26522] hover:bg-[#e05a1a] active:scale-95 text-white rounded-[13px] m-1.5 px-5 py-2.5 text-[14px] font-bold transition-all whitespace-nowrap">
                Rechercher
              </button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-black/10 overflow-hidden z-50">
                {suggestions.map((s) => (
                  <button key={s} onMouseDown={() => { setQuery(s); handleSearch(s); }}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-orange-50 hover:text-[#F26522] transition-colors flex items-center gap-2">
                    <Search size={12} className="text-gray-300" />
                    {s}
                    <ArrowRight size={11} className="ml-auto text-gray-300" />
                  </button>
                ))}
              </div>
            )}
            {showSuggestions && !query && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-black/10 overflow-hidden z-50">
                <div className="px-4 py-2 border-b border-black/5">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Recherches populaires</span>
                </div>
                {POPULAR_SEARCHES.map((s) => (
                  <button key={s} onMouseDown={() => { setQuery(s); handleSearch(s); }}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-gray-600 hover:bg-orange-50 hover:text-[#F26522] transition-colors flex items-center gap-2">
                    <Search size={12} className="text-gray-300" />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick filter pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {QUICK_FILTERS.map(({ label, cat, Icon }) => (
              <button key={cat} onClick={() => router.push(`/listings?cat=${cat}`)}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full border border-black/10 bg-white text-gray-600 hover:border-[#F26522]/40 hover:text-[#F26522] hover:bg-orange-50 transition-all">
                <Icon size={11} />
                {label}
              </button>
            ))}
          </div>

          {/* Trust signals */}
          <div className="flex items-center gap-6 flex-wrap pt-4 border-t border-black/6">
            {[
              { value: "2 400+", label: "établissements" },
              { value: "18 000+", label: "familles" },
              { value: "4.8 ★", label: "note moyenne" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[#0D2461] font-extrabold text-[18px] leading-none">{s.value}</p>
                <p className="text-gray-400 text-[11px] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — phone mockup */}
        <div className="hidden lg:flex justify-center items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-[#0D2461] rounded-[40px] blur-3xl opacity-8 scale-90" />
            <div className="relative w-[260px] bg-[#1a1a2e] rounded-[36px] p-3 shadow-[0_24px_60px_rgba(13,36,97,0.15)] border border-white/10">
              <div className="w-20 h-5 bg-[#111] rounded-b-xl mx-auto mb-1" />
              <div className="rounded-[26px] overflow-hidden bg-[#F7F6F2]">
                <div className="bg-[#0D2461] px-3 py-2.5 flex items-center gap-2">
                  <span className="text-[12px] font-extrabold tracking-widest text-white">KIDSWORLD</span>
                  <div className="flex-1 bg-white/15 rounded-lg px-2 py-1 text-[10px] text-white/50 flex items-center gap-1">
                    <Search size={8} className="text-white/50" />
                    Rechercher...
                  </div>
                </div>
                <div className="p-2.5 flex flex-col gap-2">
                  {[
                    { name: "Dr. Ben Ali Sana", loc: "Les Berges du Lac", stars: "4.9", status: "Ouvert", ok: true, prem: true },
                    { name: "JumPark Tunis", loc: "La Marsa", stars: "4.8", status: "Ouvert", ok: true, prem: true },
                    { name: "Kids English Club", loc: "Manar 2", stars: "4.7", status: "Fermé", ok: false, prem: false },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-xl border border-black/8 flex overflow-hidden">
                      <div className={`w-12 flex-shrink-0 flex items-center justify-center ${item.prem ? "bg-amber-50" : "bg-gray-50"}`}>
                        <div className="w-5 h-5 rounded-full bg-[#0D2461]/10 flex items-center justify-center">
                          <Search size={9} className="text-[#0D2461]/40" />
                        </div>
                      </div>
                      <div className="p-2 flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-[#111827] truncate">{item.name}</p>
                        <p className="text-[8px] text-gray-400 mb-1 truncate">{item.loc}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-amber-500 font-bold">★ {item.stars}</span>
                          <span className={`text-[8px] font-semibold ${item.ok ? "text-green-600" : "text-red-500"}`}>{item.status}</span>
                          {item.prem && <span className="text-[7px] font-bold bg-amber-100 text-amber-700 px-1 rounded-full">Premium</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mx-2.5 mb-2.5 h-[60px] rounded-xl bg-[#E8EDF5] flex items-center justify-center border border-[#cde] relative overflow-hidden">
                  <span className="text-[9px] text-gray-400">Carte interactive</span>
                  {[{ x: 30, y: 35, c: "#F26522" }, { x: 62, y: 55, c: "#0D2461" }, { x: 78, y: 22, c: "#F5C518" }].map((p, i) => (
                    <div key={i} className="absolute w-2.5 h-2.5 rounded-full border-2 border-white shadow" style={{ left: `${p.x}%`, top: `${p.y}%`, background: p.c }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
