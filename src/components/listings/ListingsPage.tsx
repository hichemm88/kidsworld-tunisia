"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  SlidersHorizontal, List, LayoutGrid, X, Star, MapPin,
  ChevronDown, Search, Map, Loader2, Sparkles,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import type { MapPin as MapPinType } from "@/components/map/MapView";

// Lazy load map (Leaflet can't run SSR)
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

// ─── Types ──────────────────────────────────────────────────────
interface Listing {
  id: string;
  slug: string;
  nom: string;
  description?: string;
  ville: string;
  quartier?: string;
  adresse?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  website?: string;
  plan: "free" | "premium";
  is_verified: boolean;
  is_active: boolean;
  age_min?: number;
  age_max?: number;
  prix_label?: string;
  category_nom?: string;
  category_emoji?: string;
  category_couleur?: string;
  note_moyenne: number;
  nb_avis: number;
}

const CATS = [
  { slug: "all", label: "Tout" },
  { slug: "loisirs", label: "🎪 Loisirs" },
  { slug: "sante", label: "🏥 Santé" },
  { slug: "education", label: "🎓 Éducation" },
  { slug: "ateliers", label: "🎨 Ateliers" },
  { slug: "fetes", label: "🎂 Fêtes" },
  { slug: "shopping", label: "🛍 Shopping" },
];

const CAT_COLOR: Record<string, string> = {
  loisirs: "#2563EB", sante: "#16a34a", education: "#7C3AED",
  ateliers: "#DC2626", fetes: "#DB2777", shopping: "#0891B2",
};

const VILLES = ["Tunis", "La Marsa", "Ariana", "Ben Arous", "Manouba", "La Soukra", "Ennasr"];

// Fallback demo listings with real Tunis coordinates
const DEMO_LISTINGS: Listing[] = [
  { id: "1", slug: "jumpark-trampoline", nom: "Jumpark Trampoline", ville: "La Soukra", lat: 36.8952, lng: 10.1542, plan: "premium", is_verified: true, is_active: true, category_nom: "Loisirs", category_emoji: "🎪", category_couleur: "#2563EB", note_moyenne: 4.8, nb_avis: 124, prix_label: "Dès 15 TND", age_min: 3, age_max: 14 },
  { id: "2", slug: "fanta-park", nom: "Fanta Park", ville: "Les Berges du Lac", lat: 36.8416, lng: 10.2351, plan: "premium", is_verified: true, is_active: true, category_nom: "Loisirs", category_emoji: "🎪", category_couleur: "#2563EB", note_moyenne: 4.6, nb_avis: 89, prix_label: "Dès 20 TND", age_min: 2, age_max: 12 },
  { id: "3", slug: "dr-ben-ali-sana", nom: "Dr. Ben Ali Sana", ville: "Les Berges du Lac", lat: 36.8410, lng: 10.2390, plan: "premium", is_verified: true, is_active: true, category_nom: "Santé", category_emoji: "🏥", category_couleur: "#16a34a", note_moyenne: 4.9, nb_avis: 148, prix_label: "60 TND" },
  { id: "4", slug: "kids-english-club", nom: "Kids English Club", ville: "Manar 2", lat: 36.8593, lng: 10.1928, plan: "free", is_verified: true, is_active: true, category_nom: "Éducation", category_emoji: "🎓", category_couleur: "#7C3AED", note_moyenne: 4.7, nb_avis: 89, age_min: 6, age_max: 16 },
  { id: "5", slug: "happy-birthday-events", nom: "Happy Birthday Events", ville: "Ariana", lat: 36.8625, lng: 10.1956, plan: "premium", is_verified: false, is_active: true, category_nom: "Fêtes", category_emoji: "🎂", category_couleur: "#DB2777", note_moyenne: 4.6, nb_avis: 203, prix_label: "Sur devis" },
  { id: "6", slug: "ecole-arc-en-ciel", nom: "École Arc-en-Ciel", ville: "La Marsa", lat: 36.8806, lng: 10.3250, plan: "free", is_verified: true, is_active: true, category_nom: "Éducation", category_emoji: "🎓", category_couleur: "#7C3AED", note_moyenne: 4.8, nb_avis: 62, age_min: 3, age_max: 6 },
  { id: "7", slug: "club-natation-junior", nom: "Club Natation Junior", ville: "El Menzah", lat: 36.8499, lng: 10.1770, plan: "free", is_verified: true, is_active: true, category_nom: "Ateliers", category_emoji: "🎨", category_couleur: "#DC2626", note_moyenne: 4.5, nb_avis: 114, prix_label: "Dès 80 TND/mois", age_min: 4, age_max: 14 },
  { id: "8", slug: "atelier-robotique-kids", nom: "Atelier Robotique Kids", ville: "CUN", lat: 36.8400, lng: 10.1950, plan: "premium", is_verified: true, is_active: true, category_nom: "Ateliers", category_emoji: "🎨", category_couleur: "#DC2626", note_moyenne: 4.9, nb_avis: 47, prix_label: "Dès 120 TND/mois", age_min: 8, age_max: 16 },
  { id: "9", slug: "dr-trabelsi-dentiste", nom: "Dr. Trabelsi — Dentiste", ville: "Lac 1", lat: 36.8440, lng: 10.2300, plan: "free", is_verified: true, is_active: true, category_nom: "Santé", category_emoji: "🏥", category_couleur: "#16a34a", note_moyenne: 4.7, nb_avis: 76, prix_label: "70 TND" },
  { id: "10", slug: "mini-ferme-pedagogique", nom: "Mini Ferme Pédagogique", ville: "Bir El Bey", lat: 36.7650, lng: 10.3180, plan: "free", is_verified: false, is_active: true, category_nom: "Loisirs", category_emoji: "🎪", category_couleur: "#2563EB", note_moyenne: 4.4, nb_avis: 58, prix_label: "Dès 25 TND", age_min: 2, age_max: 10 },
  { id: "11", slug: "studio-danse-kids", nom: "Studio Danse Kids", ville: "Ennasr", lat: 36.8720, lng: 10.2080, plan: "free", is_verified: true, is_active: true, category_nom: "Ateliers", category_emoji: "🎨", category_couleur: "#DC2626", note_moyenne: 4.6, nb_avis: 91, prix_label: "Dès 90 TND/mois", age_min: 4, age_max: 16 },
  { id: "12", slug: "librairie-jeunesse-tunis", nom: "Librairie Jeunesse Tunis", ville: "Les Berges du Lac", lat: 36.8430, lng: 10.2380, plan: "free", is_verified: true, is_active: true, category_nom: "Shopping", category_emoji: "🛍", category_couleur: "#0891B2", note_moyenne: 4.8, nb_avis: 134 },
];

// ─── Card composants ─────────────────────────────────────────────
function ListingCard({ l, onClick, isSelected }: { l: Listing; onClick?: () => void; isSelected?: boolean }) {
  const color = CAT_COLOR[l.category_nom?.toLowerCase() ?? ""] ?? l.category_couleur ?? "#F26522";
  const catSlug = Object.keys(CAT_COLOR).find((k) => l.category_nom?.toLowerCase().includes(k)) ?? "";
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border-[1.5px] p-4 flex gap-3 cursor-pointer transition-all duration-200
        ${l.plan === "premium" ? "border-amber-300" : "border-black/8"}
        ${isSelected ? "ring-2 ring-[#0D2461] shadow-lg" : "hover:shadow-lg hover:-translate-y-0.5"}
      `}
    >
      {/* Emoji / thumbnail */}
      <div className="w-[60px] h-[60px] rounded-xl flex items-center justify-center text-3xl flex-shrink-0 bg-gradient-to-br from-[#F7F6F2] to-[#EDE9E0] relative">
        {l.plan === "premium" && <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber-400 rounded-t-xl" />}
        <span>{l.category_emoji ?? "📍"}</span>
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase" style={{ background: color + "20", color }}>
            {l.category_nom ?? catSlug}
          </span>
          {l.is_verified && <span className="text-[9px] font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded-full">✓ Vérifié</span>}
          {l.plan === "premium" && <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-full">Premium</span>}
        </div>
        <h3 className="text-[14px] font-extrabold text-[#111827] leading-snug mb-0.5 truncate">{l.nom}</h3>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1.5">
          <MapPin size={10} />
          <span>{l.quartier ? `${l.quartier}, ` : ""}{l.ville}</span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-1">
          <span className="flex items-center gap-1 text-[12px] font-extrabold text-[#F5C518]">
            <Star size={10} fill="#F5C518" />
            {Number(l.note_moyenne).toFixed(1)}
            <span className="text-[10px] text-gray-400 font-normal">({l.nb_avis})</span>
          </span>
          {l.age_min != null && l.age_max != null && (
            <span className="text-[10px] bg-[#F7F6F2] px-1.5 py-0.5 rounded-full text-gray-500">{l.age_min}–{l.age_max} ans</span>
          )}
          {l.prix_label && <span className="text-[11px] font-extrabold text-[#F26522]">{l.prix_label}</span>}
        </div>
      </div>
    </div>
  );
}

function GridCard({ l }: { l: Listing }) {
  const color = CAT_COLOR[l.category_nom?.toLowerCase() ?? ""] ?? l.category_couleur ?? "#F26522";
  return (
    <Link href={`/listing/${l.slug}`} className={`bg-white rounded-2xl border-[1.5px] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all ${l.plan === "premium" ? "border-amber-300" : "border-black/8"}`}>
      <div className="h-[120px] flex items-center justify-center text-4xl bg-gradient-to-br from-[#F7F6F2] to-[#EDE9E0] relative">
        {l.plan === "premium" && <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber-400" />}
        {l.category_emoji ?? "📍"}
      </div>
      <div className="p-3">
        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase" style={{ background: color + "20", color }}>{l.category_nom}</span>
        <p className="text-[13px] font-extrabold text-[#111827] mt-1 truncate">{l.nom}</p>
        <p className="text-[10px] text-gray-400 mt-0.5 mb-1.5 flex items-center gap-0.5"><MapPin size={9} />{l.ville}</p>
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-extrabold text-[#F5C518] flex items-center gap-0.5"><Star size={10} fill="#F5C518" />{Number(l.note_moyenne).toFixed(1)}</span>
          {l.prix_label && <span className="text-[10px] font-bold text-[#F26522]">{l.prix_label}</span>}
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

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Fetch from API
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
    } catch {
      // Keep demo data on error
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, activeCat, activeVille]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Client-side sort
  const sorted = useMemo(() => {
    const d = [...listings];
    if (sort === "note") d.sort((a, b) => b.note_moyenne - a.note_moyenne);
    else if (sort === "avis") d.sort((a, b) => b.nb_avis - a.nb_avis);
    else d.sort((a, b) => (b.plan === "premium" ? 1 : 0) - (a.plan === "premium" ? 1 : 0));
    return d;
  }, [listings, sort]);

  // Map pins from listings with coordinates
  const mapPins: MapPinType[] = useMemo(
    () =>
      sorted
        .filter((l) => l.lat != null && l.lng != null)
        .map((l) => ({
          id: l.id,
          lat: l.lat!,
          lng: l.lng!,
          name: l.nom,
          category: Object.keys(CAT_COLOR).find((k) => l.category_nom?.toLowerCase().includes(k)),
          premium: l.plan === "premium",
          rating: l.note_moyenne,
          slug: l.slug,
        })),
    [sorted]
  );

  const selectedListing = selectedId ? sorted.find((l) => l.id === selectedId) : null;

  return (
    <div className="flex flex-col h-[calc(100vh-57px)] bg-[#F7F6F2]">

      {/* ── Search bar ── */}
      <div className="bg-white border-b border-black/8 px-4 py-2.5 flex-shrink-0">
        <div className="max-w-[1200px] mx-auto flex items-center gap-2">
          <div className="flex-1 relative">
            <div className="flex items-center bg-[#F7F6F2] rounded-xl px-3 gap-2 border border-black/8 focus-within:border-[#F26522] focus-within:bg-white transition-all">
              <Search size={15} className="text-gray-400 flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Pédiatre, activité, anniversaire..."
                className="flex-1 bg-transparent border-none outline-none text-[14px] py-2 text-[#111827]"
              />
              {loading && <Loader2 size={13} className="animate-spin text-[#F26522] flex-shrink-0" />}
              {searchQuery && !loading && (
                <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Smart suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-black/8 z-50 overflow-hidden">
                <div className="px-3 py-2 border-b border-black/5 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-[#F26522]" />
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Suggestions IA</span>
                </div>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onMouseDown={() => { setSearchQuery(s); setShowSuggestions(false); }}
                    className="w-full text-left px-3 py-2 text-[13px] text-gray-700 hover:bg-[#F7F6F2] transition-colors"
                  >
                    🔍 {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ville selector */}
          <div className="relative">
            <select
              value={activeVille}
              onChange={(e) => setActiveVille(e.target.value)}
              className="appearance-none text-[12px] font-bold text-gray-600 bg-[#F7F6F2] border border-black/8 rounded-xl pl-3 pr-7 py-2 outline-none cursor-pointer hover:border-[#F26522] transition-all"
            >
              <option value="all">Tout Tunis</option>
              {VILLES.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <MapPin size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Category pills ── */}
      <div className="bg-white border-b border-black/8 px-4 py-2 overflow-x-auto no-scrollbar flex-shrink-0">
        <div className="flex items-center gap-2 max-w-[1200px] mx-auto">
          {CATS.map((c) => (
            <button
              key={c.slug}
              onClick={() => setActiveCat(c.slug)}
              className={`text-[12px] font-bold px-3 py-1.5 rounded-full border whitespace-nowrap transition-all
                ${activeCat === c.slug
                  ? "bg-[#F26522] border-[#F26522] text-white shadow-sm"
                  : "bg-white border-black/15 text-gray-600 hover:border-[#F26522] hover:text-[#F26522]"
                }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white border-b border-black/8 px-4 py-2 flex items-center gap-3 flex-shrink-0">
        <div className="max-w-[1200px] mx-auto w-full flex items-center gap-3">
          <span className="text-[13px] font-bold text-[#111827]">{sorted.length} résultat{sorted.length !== 1 ? "s" : ""}</span>
          {loading && <Loader2 size={12} className="animate-spin text-gray-400" />}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-1.5 text-[12px] font-bold text-gray-600 bg-white border border-black/15 rounded-lg px-2.5 py-1.5 hover:border-[#F26522] hover:text-[#F26522] transition-all"
            >
              <SlidersHorizontal size={12} />
              <span className="hidden sm:inline">Filtres</span>
            </button>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none text-[12px] font-bold text-gray-600 bg-white border border-black/15 rounded-lg pl-2.5 pr-6 py-1.5 outline-none cursor-pointer hover:border-[#F26522]"
              >
                <option value="pertinence">Pertinence</option>
                <option value="note">Mieux notés</option>
                <option value="avis">Plus d'avis</option>
              </select>
              <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="flex border border-black/15 rounded-lg overflow-hidden">
              {(["list", "grid", "map"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`p-1.5 transition-colors ${view === v ? "bg-[#0D2461] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                  title={v === "list" ? "Liste" : v === "grid" ? "Grille" : "Carte"}
                >
                  {v === "list" ? <List size={14} /> : v === "grid" ? <LayoutGrid size={14} /> : <Map size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Listings panel — masqué en mode carte mobile */}
        {view !== "map" && (
          <div className={`${view === "grid" ? "w-full" : "w-full lg:w-[420px] xl:w-[480px]"} flex-shrink-0 overflow-y-auto p-4 flex flex-col gap-3`}>
            {sorted.length === 0 && !loading ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-5xl mb-4">🔍</p>
                <p className="font-extrabold text-[#111827] mb-1">Aucun résultat trouvé</p>
                <p className="text-sm mb-4">Essayez avec d&apos;autres mots-clés ou filtres</p>
                <button onClick={() => { setSearchQuery(""); setActiveCat("all"); }} className="text-[#F26522] font-bold text-sm hover:underline">
                  Effacer les filtres
                </button>
              </div>
            ) : view === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {sorted.map((l) => <GridCard key={l.id} l={l} />)}
              </div>
            ) : (
              sorted.map((l) => (
                <ListingCard
                  key={l.id}
                  l={l}
                  isSelected={selectedId === l.id}
                  onClick={() => setSelectedId(selectedId === l.id ? null : l.id)}
                />
              ))
            )}
          </div>
        )}

        {/* Carte — visible en desktop (split view) ou en mode carte complet */}
        <div className={`${view === "map" ? "flex-1" : "hidden lg:flex flex-1"} flex-col overflow-hidden relative`}>
          <div className="flex-1 p-3" style={{ minHeight: 0 }}>
            <MapView
              pins={mapPins}
              height="calc(100vh - 200px)"
              selectedId={selectedId}
              onPinClick={(pin) => setSelectedId(pin.id as string)}
            />
          </div>

          {/* Popup listing sélectionné (desktop) */}
          {selectedListing && view !== "map" && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[290px] bg-white rounded-2xl shadow-2xl border border-black/10 p-4 z-[1000]">
              <button onClick={() => setSelectedId(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
              <div className="flex gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-[#F7F6F2] flex items-center justify-center text-2xl flex-shrink-0">
                  {selectedListing.category_emoji}
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
                  <Star size={11} fill="#F5C518" />
                  {Number(selectedListing.note_moyenne).toFixed(1)}
                  <span className="text-gray-400 font-normal">({selectedListing.nb_avis})</span>
                </span>
                {selectedListing.prix_label && (
                  <span className="text-[12px] font-bold text-[#F26522]">{selectedListing.prix_label}</span>
                )}
              </div>
              <Link
                href={`/listing/${selectedListing.slug}`}
                className="block w-full text-center bg-[#0D2461] text-white text-[12px] font-bold py-2.5 rounded-xl hover:bg-[#1A3A8F] transition-colors"
              >
                Voir la fiche complète →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Filter drawer ── */}
      {filterOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setFilterOpen(false); }}
        >
          <div className="bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl p-5 pb-8 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 md:hidden" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[17px] font-extrabold text-[#111827]">Filtrer les résultats</h3>
              <button onClick={() => setFilterOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[12px] font-extrabold text-[#111827] uppercase tracking-wide mb-3">Tranche d&apos;âge</p>
                <div className="flex flex-wrap gap-2">
                  {["0–2 ans", "3–6 ans", "6–12 ans", "12–18 ans"].map((a) => (
                    <button key={a} className="text-[12px] font-bold px-3 py-1.5 rounded-full border border-black/15 hover:border-[#F26522] hover:text-[#F26522] transition-all">{a}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[12px] font-extrabold text-[#111827] uppercase tracking-wide mb-3">Disponibilité</p>
                <div className="flex flex-wrap gap-2">
                  {["Ouvert maintenant", "Week-end", "Soirée"].map((d) => (
                    <button key={d} className="text-[12px] font-bold px-3 py-1.5 rounded-full border border-black/15 hover:border-[#F26522] hover:text-[#F26522] transition-all">{d}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[12px] font-extrabold text-[#111827] uppercase tracking-wide mb-3">Ville</p>
                <div className="flex flex-wrap gap-2">
                  {VILLES.map((v) => (
                    <button
                      key={v}
                      onClick={() => setActiveVille(v)}
                      className={`text-[12px] font-bold px-3 py-1.5 rounded-full border transition-all
                        ${activeVille === v ? "bg-[#0D2461] border-[#0D2461] text-white" : "border-black/15 hover:border-[#F26522] hover:text-[#F26522]"}
                      `}
                    >{v}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[12px] font-extrabold text-[#111827] uppercase tracking-wide mb-3">Options</p>
                <div className="flex flex-wrap gap-2">
                  {["Vérifié ✓", "Premium", "Parking", "Bilingue", "Accès PMR"].map((o) => (
                    <button key={o} className="text-[12px] font-bold px-3 py-1.5 rounded-full border border-black/15 hover:border-[#F26522] hover:text-[#F26522] transition-all">{o}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => { setActiveCat("all"); setActiveVille("all"); setSearchQuery(""); setFilterOpen(false); }}
                className="flex-1 border-2 border-black/15 text-[13px] font-bold py-3 rounded-xl hover:border-[#F26522] hover:text-[#F26522] transition-all"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="flex-1 bg-[#F26522] text-white text-[13px] font-bold py-3 rounded-xl hover:bg-[#FF8C4B] transition-all shadow-sm"
              >
                Voir {sorted.length} résultats
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
