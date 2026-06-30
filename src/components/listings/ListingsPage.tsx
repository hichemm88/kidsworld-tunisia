"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  SlidersHorizontal, List, LayoutGrid, X, Star, MapPin,
  ChevronDown, Search, Map, Loader2, Sparkles,
  Heart, BookOpen, Zap, Palette, Gift, ShoppingBag, Building2, Check,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import type { MapPin as MapPinType } from "@/components/map/MapView";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-[#E8EDF5] flex items-center justify-center">
      <div className="text-center text-gray-400">
        <Map size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">Chargement de la carte...</p>
      </div>
    </div>
  ),
});

interface Listing {
  id: string; slug: string; nom: string; description?: string; ville: string;
  quartier?: string; adresse?: string; lat?: number; lng?: number; phone?: string;
  website?: string; plan: "free" | "premium"; is_verified: boolean; is_active: boolean;
  age_min?: number; age_max?: number; prix_label?: string; category_nom?: string;
  category_slug?: string; category_emoji?: string; category_couleur?: string;
  note_moyenne: number; nb_avis: number;
}

const CATS = [
  { slug: "all",       label: "Tout",      Icon: null as React.ComponentType<any> | null, color: "#F26522", bg: "#FFF1EB" },
  { slug: "loisirs",   label: "Loisirs",   Icon: Zap as React.ComponentType<any>,         color: "#0EA5E9", bg: "#E0F2FE" },
  { slug: "sante",     label: "Santé",     Icon: Heart as React.ComponentType<any>,        color: "#10B981", bg: "#ECFDF5" },
  { slug: "education", label: "Éducation", Icon: BookOpen as React.ComponentType<any>,     color: "#7C3AED", bg: "#EDE9FE" },
  { slug: "ateliers",  label: "Ateliers",  Icon: Palette as React.ComponentType<any>,      color: "#F43F5E", bg: "#FFF1F2" },
  { slug: "fetes",     label: "Fêtes",     Icon: Gift as React.ComponentType<any>,          color: "#EC4899", bg: "#FDF2F8" },
  { slug: "shopping",  label: "Shopping",  Icon: ShoppingBag as React.ComponentType<any>,  color: "#F59E0B", bg: "#FFFBEB" },
];

const CAT_COLOR: Record<string, string> = {
  loisirs: "#0EA5E9", sante: "#10B981", education: "#7C3AED",
  ateliers: "#F43F5E", fetes: "#EC4899", shopping: "#F59E0B",
};

const CAT_ICONS: Record<string, { Icon: React.ComponentType<any>; color: string }> = {
  sante:     { Icon: Heart,        color: "#10B981" },
  education: { Icon: BookOpen,     color: "#7C3AED" },
  loisirs:   { Icon: Zap,          color: "#0EA5E9" },
  ateliers:  { Icon: Palette,      color: "#F43F5E" },
  fetes:     { Icon: Gift,         color: "#EC4899" },
  shopping:  { Icon: ShoppingBag,  color: "#F59E0B" },
};

function CategoryIcon({ slug, color, size = 22 }: { slug?: string; color?: string; size?: number }) {
  const cat = slug ? CAT_ICONS[slug] : null;
  const iconColor = cat?.color ?? color ?? "#F26522";
  const Icon = cat?.Icon ?? Building2;
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: iconColor + "18" }}>
      <Icon size={size} style={{ color: iconColor }} strokeWidth={1.75} />
    </div>
  );
}

const VILLES = ["Tunis", "La Marsa", "Ariana", "Ben Arous", "Manouba", "La Soukra", "Ennasr"];

const AGE_RANGES = [
  { label: "0–2 ans", min: 0, max: 2 },
  { label: "3–6 ans", min: 3, max: 6 },
  { label: "6–12 ans", min: 6, max: 12 },
  { label: "12–18 ans", min: 12, max: 18 },
];

const DEMO_LISTINGS: Listing[] = [
  { id: "1", slug: "jumpark-trampoline", nom: "Jumpark Trampoline", ville: "La Soukra", lat: 36.8952, lng: 10.1542, plan: "premium", is_verified: true, is_active: true, category_nom: "Loisirs", category_slug: "loisirs", category_emoji: "🎪", category_couleur: "#0EA5E9", note_moyenne: 4.8, nb_avis: 124, prix_label: "Dès 15 TND", age_min: 3, age_max: 14 },
  { id: "2", slug: "fanta-park", nom: "Fanta Park", ville: "Les Berges du Lac", lat: 36.8416, lng: 10.2351, plan: "premium", is_verified: true, is_active: true, category_nom: "Loisirs", category_slug: "loisirs", category_emoji: "🎪", category_couleur: "#0EA5E9", note_moyenne: 4.6, nb_avis: 89, prix_label: "Dès 20 TND", age_min: 2, age_max: 12 },
  { id: "3", slug: "dr-ben-ali-sana", nom: "Dr. Ben Ali Sana", ville: "Les Berges du Lac", lat: 36.8410, lng: 10.2390, plan: "premium", is_verified: true, is_active: true, category_nom: "Santé", category_slug: "sante", category_emoji: "🏥", category_couleur: "#10B981", note_moyenne: 4.9, nb_avis: 148, prix_label: "60 TND" },
  { id: "4", slug: "kids-english-club", nom: "Kids English Club", ville: "Manar 2", lat: 36.8593, lng: 10.1928, plan: "free", is_verified: true, is_active: true, category_nom: "Éducation", category_slug: "education", category_emoji: "🎓", category_couleur: "#7C3AED", note_moyenne: 4.7, nb_avis: 89, age_min: 6, age_max: 16 },
  { id: "5", slug: "happy-birthday-events", nom: "Happy Birthday Events", ville: "Ariana", lat: 36.8625, lng: 10.1956, plan: "premium", is_verified: false, is_active: true, category_nom: "Fêtes", category_slug: "fetes", category_emoji: "🎂", category_couleur: "#EC4899", note_moyenne: 4.6, nb_avis: 203, prix_label: "Sur devis" },
  { id: "6", slug: "ecole-arc-en-ciel", nom: "École Arc-en-Ciel", ville: "La Marsa", lat: 36.8806, lng: 10.3250, plan: "free", is_verified: true, is_active: true, category_nom: "Éducation", category_slug: "education", category_emoji: "🎓", category_couleur: "#7C3AED", note_moyenne: 4.8, nb_avis: 62, age_min: 3, age_max: 6 },
  { id: "7", slug: "club-natation-junior", nom: "Club Natation Junior", ville: "El Menzah", lat: 36.8499, lng: 10.1770, plan: "free", is_verified: true, is_active: true, category_nom: "Ateliers", category_slug: "ateliers", category_emoji: "🎨", category_couleur: "#F43F5E", note_moyenne: 4.5, nb_avis: 114, prix_label: "Dès 80 TND/mois", age_min: 4, age_max: 14 },
  { id: "8", slug: "atelier-robotique-kids", nom: "Atelier Robotique Kids", ville: "CUN", lat: 36.8400, lng: 10.1950, plan: "premium", is_verified: true, is_active: true, category_nom: "Ateliers", category_slug: "ateliers", category_emoji: "🎨", category_couleur: "#F43F5E", note_moyenne: 4.9, nb_avis: 47, prix_label: "Dès 120 TND/mois", age_min: 8, age_max: 16 },
  { id: "9", slug: "dr-trabelsi-dentiste", nom: "Dr. Trabelsi — Dentiste", ville: "Lac 1", lat: 36.8440, lng: 10.2300, plan: "free", is_verified: true, is_active: true, category_nom: "Santé", category_slug: "sante", category_emoji: "🏥", category_couleur: "#10B981", note_moyenne: 4.7, nb_avis: 76, prix_label: "70 TND" },
  { id: "10", slug: "mini-ferme-pedagogique", nom: "Mini Ferme Pédagogique", ville: "Bir El Bey", lat: 36.7650, lng: 10.3180, plan: "free", is_verified: false, is_active: true, category_nom: "Loisirs", category_slug: "loisirs", category_emoji: "🎪", category_couleur: "#0EA5E9", note_moyenne: 4.4, nb_avis: 58, prix_label: "Dès 25 TND", age_min: 2, age_max: 10 },
  { id: "11", slug: "studio-danse-kids", nom: "Studio Danse Kids", ville: "Ennasr", lat: 36.8720, lng: 10.2080, plan: "free", is_verified: true, is_active: true, category_nom: "Ateliers", category_slug: "ateliers", category_emoji: "🎨", category_couleur: "#F43F5E", note_moyenne: 4.6, nb_avis: 91, prix_label: "Dès 90 TND/mois", age_min: 4, age_max: 16 },
  { id: "12", slug: "librairie-jeunesse-tunis", nom: "Librairie Jeunesse Tunis", ville: "Les Berges du Lac", lat: 36.8430, lng: 10.2380, plan: "free", is_verified: true, is_active: true, category_nom: "Shopping", category_slug: "shopping", category_emoji: "🛍", category_couleur: "#F59E0B", note_moyenne: 4.8, nb_avis: 134 },
];

// ─── Card Components ─────────────────────────────────────────────

function ListingCard({ l, isSelected }: { l: Listing; isSelected?: boolean }) {
  const color = CAT_COLOR[l.category_slug ?? ""] ?? l.category_couleur ?? "#F26522";
  return (
    <Link
      href={`/listing/${l.slug}`}
      className={`group block bg-white rounded-3xl border-[1.5px] p-4 flex gap-4 transition-all duration-200
        ${l.plan === "premium" ? "border-amber-300 shadow-[0_0_0_1px_rgba(251,191,36,0.2)]" : "border-black/8"}
        ${isSelected ? "ring-2 ring-[#0D2461] shadow-lg" : "hover:shadow-xl hover:-translate-y-0.5"}
      `}
    >
      {/* Category icon */}
      <div className="w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden relative shadow-sm" style={{ background: color + "15" }}>
        {l.plan === "premium" && (
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl z-10" style={{ background: `linear-gradient(90deg, ${color}, #F59E0B)` }} />
        )}
        <div className="w-full h-full flex items-center justify-center">
          {(() => { const cat = l.category_slug ? CAT_ICONS[l.category_slug] : null; const Icon = cat?.Icon ?? Building2; return <Icon size={26} style={{ color }} strokeWidth={1.75} />; })()}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide"
            style={{ background: color + "15", color }}>
            {l.category_nom}
          </span>
          {l.is_verified && (
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">✓ Vérifié</span>
          )}
          {l.plan === "premium" && (
            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">★ Premium</span>
          )}
        </div>
        <h3 className="text-[14px] font-extrabold text-[#111827] leading-snug mb-1 truncate group-hover:text-[#0D2461] transition-colors">{l.nom}</h3>
        <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-2">
          <MapPin size={10} style={{ color }} />
          <span>{l.quartier ? `${l.quartier}, ` : ""}{l.ville}</span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-1.5">
          <span className="flex items-center gap-1 text-[12px] font-extrabold text-[#F5C518]">
            <Star size={11} fill="#F5C518" />
            {Number(l.note_moyenne).toFixed(1)}
            <span className="text-[10px] text-gray-400 font-normal">({l.nb_avis})</span>
          </span>
          <div className="flex items-center gap-1.5">
            {l.age_min != null && l.age_max != null && (
              <span className="text-[10px] bg-[#F7F6F2] px-2 py-0.5 rounded-full text-gray-500 font-medium">{l.age_min}–{l.age_max} ans</span>
            )}
            {l.prix_label && (
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full" style={{ background: color + "12", color }}>{l.prix_label}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function GridCard({ l }: { l: Listing }) {
  const color = CAT_COLOR[l.category_slug ?? ""] ?? l.category_couleur ?? "#F26522";
  return (
    <Link href={`/listing/${l.slug}`}
      className={`group bg-white rounded-3xl border-[1.5px] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 ${l.plan === "premium" ? "border-amber-300" : "border-black/8"}`}>
      <div className="h-[140px] relative overflow-hidden flex items-center justify-center" style={{ background: color + "12" }}>
        {l.plan === "premium" && (
          <div className="absolute top-0 left-0 right-0 h-[3px] z-10" style={{ background: `linear-gradient(90deg, ${color}, #F59E0B)` }} />
        )}
        {(() => { const cat = l.category_slug ? CAT_ICONS[l.category_slug] : null; const Icon = cat?.Icon ?? Building2; return <Icon size={44} style={{ color, opacity: 0.7 }} strokeWidth={1.5} />; })()}
        {/* Decorative circles */}
        <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-15" style={{ background: color }} />
        <div className="absolute -left-2 -top-2 w-12 h-12 rounded-full opacity-10" style={{ background: color }} />
      </div>
      <div className="p-3.5">
        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ background: color + "15", color }}>
          {l.category_nom}
        </span>
        <p className="text-[13px] font-extrabold text-[#111827] mt-1.5 truncate group-hover:text-[#0D2461] transition-colors">{l.nom}</p>
        <p className="text-[10px] text-gray-400 mt-0.5 mb-2 flex items-center gap-1">
          <MapPin size={9} style={{ color }} />{l.ville}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-extrabold text-[#F5C518] flex items-center gap-0.5">
            <Star size={10} fill="#F5C518" />{Number(l.note_moyenne).toFixed(1)}
            <span className="text-[9px] text-gray-400 font-normal ml-0.5">({l.nb_avis})</span>
          </span>
          {l.prix_label && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: color + "12", color }}>{l.prix_label}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Page principale ─────────────────────────────────────────────
export default function ListingsPage() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>(DEMO_LISTINGS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [activeCat, setActiveCat] = useState(searchParams.get("cat") ?? "all");
  const [activeVille, setActiveVille] = useState(searchParams.get("ville") ?? "all");
  const [view, setView] = useState<"list" | "grid" | "map">("list");
  const [sort, setSort] = useState("pertinence");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const [activeAgeRange, setActiveAgeRange] = useState<{ min: number; max: number } | null>(null);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyPremium, setOnlyPremium] = useState(false);

  const filterCount = [activeAgeRange !== null, activeVille !== "all", onlyVerified, onlyPremium].filter(Boolean).length;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (activeCat !== "all") params.set("cat", activeCat);
      if (activeVille !== "all") params.set("ville", activeVille);
      params.set("limit", "50");
      const res = await fetch(`/api/search?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (data.listings && data.listings.length > 0) {
          setListings(data.listings);
        } else if (data.listings && data.listings.length === 0 && debouncedQuery) {
          setListings([]);
          setSuggestions(data.suggestions ?? []);
        }
      }
    } catch { /* Keep demo data */ } finally { setLoading(false); }
  }, [debouncedQuery, activeCat, activeVille]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const sorted = useMemo(() => {
    let d = [...listings];
    if (activeAgeRange) d = d.filter(l => l.age_min == null || l.age_max == null || (l.age_min <= activeAgeRange.max && l.age_max >= activeAgeRange.min));
    if (onlyVerified) d = d.filter(l => l.is_verified);
    if (onlyPremium) d = d.filter(l => l.plan === "premium");
    const premiumFirst = (a: Listing, b: Listing) => (b.plan === "premium" ? 1 : 0) - (a.plan === "premium" ? 1 : 0);
    if (sort === "note") d.sort((a, b) => premiumFirst(a, b) || b.note_moyenne - a.note_moyenne);
    else if (sort === "avis") d.sort((a, b) => premiumFirst(a, b) || b.nb_avis - a.nb_avis);
    else d.sort(premiumFirst);
    return d;
  }, [listings, sort, activeAgeRange, onlyVerified, onlyPremium]);

  const mapPins: MapPinType[] = useMemo(() =>
    sorted.filter(l => l.lat != null && l.lng != null).map(l => ({
      id: l.id, lat: l.lat!, lng: l.lng!, name: l.nom,
      category: l.category_slug ?? Object.keys(CAT_COLOR).find(k => l.category_nom?.toLowerCase().includes(k)),
      premium: l.plan === "premium", rating: l.note_moyenne, slug: l.slug,
    })), [sorted]);

  const selectedListing = selectedId ? sorted.find(l => l.id === selectedId) : null;

  const resetFilters = () => {
    setActiveCat("all"); setActiveVille("all"); setSearchQuery(""); setActiveAgeRange(null);
    setOnlyVerified(false); setOnlyPremium(false); setFilterOpen(false);
  };

  const activeCatObj = CATS.find(c => c.slug === activeCat);

  return (
    <div className="flex flex-col h-[calc(100vh-57px)] bg-[#F8F9FF]">

      {/* ── Search bar ── */}
      <div className="bg-white border-b border-black/8 px-4 py-2.5 flex-shrink-0">
        <div className="max-w-[1200px] mx-auto flex items-center gap-2">
          <div className="flex-1 relative">
            <div className="flex items-center bg-gray-50 rounded-2xl px-3.5 gap-2 border border-black/8 focus-within:border-[#F26522] focus-within:bg-white transition-all">
              <Search size={15} className="text-gray-400 flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Pédiatre, activité, anniversaire..."
                className="flex-1 bg-transparent border-none outline-none text-[14px] py-2.5 text-[#111827] placeholder-gray-400"
              />
              {loading && <Loader2 size={13} className="animate-spin text-[#F26522] flex-shrink-0" />}
              {searchQuery && !loading && (
                <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-black/8 z-50 overflow-hidden">
                <div className="px-3.5 py-2 border-b border-black/5 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-[#F26522]" />
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Suggestions</span>
                </div>
                {suggestions.map(s => (
                  <button key={s} onMouseDown={() => { setSearchQuery(s); setShowSuggestions(false); }}
                    className="w-full text-left px-3.5 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <Search size={12} className="text-gray-300 flex-shrink-0" />{s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <select value={activeVille} onChange={e => setActiveVille(e.target.value)}
              className="appearance-none text-[12px] font-bold text-gray-600 bg-gray-50 border border-black/8 rounded-2xl pl-3 pr-7 py-2.5 outline-none cursor-pointer hover:border-[#F26522] transition-all">
              <option value="all">Tout Tunis</option>
              {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <MapPin size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Category pills ── */}
      <div className="bg-white border-b border-black/8 px-4 py-2.5 overflow-x-auto no-scrollbar flex-shrink-0">
        <div className="flex items-center gap-2 max-w-[1200px] mx-auto">
          {CATS.map(c => {
            const isActive = activeCat === c.slug;
            return (
              <button key={c.slug} onClick={() => setActiveCat(c.slug)}
                className={`inline-flex items-center gap-1.5 text-[12px] font-bold px-3.5 py-1.5 rounded-full border whitespace-nowrap transition-all ${
                  isActive ? "text-white shadow-sm border-transparent" : "bg-white border-black/12 text-gray-600 hover:border-black/25"
                }`}
                style={isActive ? { background: c.color, borderColor: c.color } : {}}>
                {c.Icon && <c.Icon size={11} style={isActive ? { color: "white" } : { color: c.color }} />}
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white border-b border-black/8 px-4 py-2 flex items-center gap-3 flex-shrink-0">
        <div className="max-w-[1200px] mx-auto w-full flex items-center gap-3">
          <span className="text-[13px] font-bold text-[#111827]">
            {sorted.length} résultat{sorted.length !== 1 ? "s" : ""}
            {activeCatObj && activeCat !== "all" && (
              <span className="ml-1.5 text-[11px] font-semibold" style={{ color: activeCatObj.color }}>· {activeCatObj.label}</span>
            )}
          </span>
          {loading && <Loader2 size={12} className="animate-spin text-gray-400" />}
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setFilterOpen(true)}
              className={`relative flex items-center gap-1.5 text-[12px] font-bold rounded-xl px-2.5 py-1.5 transition-all border ${
                filterCount > 0 ? "bg-[#0D2461] text-white border-[#0D2461]" : "text-gray-600 bg-white border-black/15 hover:border-[#F26522] hover:text-[#F26522]"
              }`}>
              <SlidersHorizontal size={12} />
              <span className="hidden sm:inline">Filtres</span>
              {filterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#F26522] rounded-full text-[9px] font-black text-white flex items-center justify-center">
                  {filterCount}
                </span>
              )}
            </button>
            <div className="relative">
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="appearance-none text-[12px] font-bold text-gray-600 bg-white border border-black/15 rounded-xl pl-2.5 pr-6 py-1.5 outline-none cursor-pointer hover:border-[#F26522]">
                <option value="pertinence">Pertinence</option>
                <option value="note">Mieux notés</option>
                <option value="avis">Plus d&apos;avis</option>
              </select>
              <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="flex border border-black/15 rounded-xl overflow-hidden">
              {(["list", "grid", "map"] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`p-1.5 transition-colors ${view === v ? "bg-[#0D2461] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                  title={v === "list" ? "Liste" : v === "grid" ? "Grille" : "Carte"}>
                  {v === "list" ? <List size={14} /> : v === "grid" ? <LayoutGrid size={14} /> : <Map size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Active filter chips ── */}
      {filterCount > 0 && (
        <div className="bg-white border-b border-black/8 px-4 py-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
          <div className="flex items-center gap-2 max-w-[1200px] mx-auto">
            {activeAgeRange && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#0D2461]/8 text-[#0D2461] px-2.5 py-1 rounded-full">
                {AGE_RANGES.find(r => r.min === activeAgeRange.min)?.label}
                <button onClick={() => setActiveAgeRange(null)} className="ml-0.5 hover:text-[#F26522]"><X size={10} /></button>
              </span>
            )}
            {activeVille !== "all" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#0D2461]/8 text-[#0D2461] px-2.5 py-1 rounded-full">
                {activeVille}<button onClick={() => setActiveVille("all")} className="ml-0.5 hover:text-[#F26522]"><X size={10} /></button>
              </span>
            )}
            {onlyVerified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                Vérifié ✓<button onClick={() => setOnlyVerified(false)} className="ml-0.5 hover:text-red-400"><X size={10} /></button>
              </span>
            )}
            {onlyPremium && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
                Premium ★<button onClick={() => setOnlyPremium(false)} className="ml-0.5 hover:text-red-400"><X size={10} /></button>
              </span>
            )}
            <button onClick={resetFilters} className="text-[11px] text-gray-400 hover:text-[#F26522] font-bold ml-1 transition-colors">
              Tout effacer
            </button>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex flex-1 overflow-hidden">
        {view !== "map" && (
          <div className={`${view === "grid" ? "w-full" : "w-full lg:w-[440px] xl:w-[500px]"} flex-shrink-0 overflow-y-auto p-4 flex flex-col gap-3`}>
            {sorted.length === 0 && !loading ? (
              <div className="text-center py-16 text-gray-400">
                <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Search size={28} className="opacity-30" />
                </div>
                <p className="font-extrabold text-[#111827] mb-1">Aucun résultat trouvé</p>
                <p className="text-sm mb-4 text-gray-400">Essayez avec d&apos;autres mots-clés ou filtres</p>
                <button onClick={resetFilters} className="text-[#F26522] font-bold text-sm hover:underline">
                  Effacer les filtres
                </button>
              </div>
            ) : view === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {sorted.map(l => <GridCard key={l.id} l={l} />)}
              </div>
            ) : (
              sorted.map(l => <ListingCard key={l.id} l={l} isSelected={selectedId === l.id} />)
            )}
          </div>
        )}

        <div className={`${view === "map" ? "flex-1" : "hidden lg:flex flex-1"} flex-col overflow-hidden relative`}>
          <div className="flex-1 p-3" style={{ minHeight: 0 }}>
            <MapView
              pins={mapPins}
              height={view === "map" ? "calc(100vh - 185px)" : "calc(100vh - 200px)"}
              selectedId={selectedId}
              onPinClick={pin => setSelectedId(pin.id as string)}
            />
          </div>

          {selectedListing && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[300px] bg-white rounded-3xl shadow-2xl border border-black/10 p-4 z-[1000]">
              <button onClick={() => setSelectedId(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
              <div className="flex gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0"
                  style={{ background: (CAT_COLOR[selectedListing.category_slug ?? ""] ?? "#F26522") + "15" }}>
                  {(() => { const cat = selectedListing.category_slug ? CAT_ICONS[selectedListing.category_slug] : null; const Icon = cat?.Icon ?? Building2; const c = cat?.color ?? "#F26522"; return <div className="w-full h-full flex items-center justify-center"><Icon size={22} style={{ color: c }} strokeWidth={1.75} /></div>; })()}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-extrabold text-[#111827] leading-tight truncate">{selectedListing.nom}</p>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={9} />{selectedListing.ville}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-extrabold text-[#F5C518] flex items-center gap-1">
                  <Star size={11} fill="#F5C518" />{Number(selectedListing.note_moyenne).toFixed(1)}
                  <span className="text-gray-400 font-normal">({selectedListing.nb_avis})</span>
                </span>
                {selectedListing.prix_label && (
                  <span className="text-[12px] font-bold text-[#F26522]">{selectedListing.prix_label}</span>
                )}
              </div>
              <Link href={`/listing/${selectedListing.slug}`}
                className="block w-full text-center bg-[#0D2461] text-white text-[12px] font-bold py-2.5 rounded-2xl hover:bg-[#1A3A8F] transition-colors">
                Voir la fiche complète
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
          onClick={e => { if (e.target === e.currentTarget) setFilterOpen(false); }}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 md:hidden" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[17px] font-extrabold text-[#111827]">Filtrer les résultats</h3>
              <button onClick={() => setFilterOpen(false)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Tranche d'âge */}
              <div>
                <p className="text-[12px] font-extrabold text-[#111827] uppercase tracking-wide mb-3">Tranche d&apos;âge</p>
                <div className="flex flex-wrap gap-2">
                  {AGE_RANGES.map(r => {
                    const active = activeAgeRange?.min === r.min && activeAgeRange?.max === r.max;
                    return (
                      <button key={r.label}
                        onClick={() => setActiveAgeRange(active ? null : r)}
                        className={`text-[12px] font-bold px-3.5 py-1.5 rounded-full border transition-all ${
                          active ? "bg-[#0D2461] text-white border-[#0D2461]" : "border-black/15 text-gray-600 hover:border-[#0D2461] hover:text-[#0D2461]"
                        }`}>
                        {active && <Check size={10} className="inline mr-1" />}{r.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Options */}
              <div>
                <p className="text-[12px] font-extrabold text-[#111827] uppercase tracking-wide mb-3">Options</p>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Établissements vérifiés uniquement", value: onlyVerified, set: setOnlyVerified, color: "#10B981" },
                    { label: "Premium uniquement", value: onlyPremium, set: setOnlyPremium, color: "#F59E0B" },
                  ].map(opt => (
                    <button key={opt.label} onClick={() => opt.set(!opt.value)}
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${
                        opt.value ? "border-transparent text-white" : "border-black/10 text-gray-700 bg-gray-50"
                      }`}
                      style={opt.value ? { background: opt.color } : {}}>
                      <span className="text-[13px] font-semibold">{opt.label}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        opt.value ? "border-white bg-white/30" : "border-black/20"
                      }`}>
                        {opt.value && <Check size={11} className="text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={resetFilters}
                className="flex-1 border-2 border-black/12 text-[13px] font-bold py-3 rounded-2xl hover:border-[#F26522] hover:text-[#F26522] transition-all">
                Réinitialiser
              </button>
              <button onClick={() => setFilterOpen(false)}
                className="flex-1 bg-[#F26522] text-white text-[13px] font-bold py-3 rounded-2xl hover:bg-[#e05a1a] transition-all shadow-[0_4px_14px_rgba(242,101,34,0.3)]">
                Voir {sorted.length} résultats
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
