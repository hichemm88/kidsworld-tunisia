"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, MapPin, ArrowRight, Crown, Heart, BookOpen, Zap, Palette, Gift, ShoppingBag, Building2 } from "lucide-react";

interface Listing {
  id: string;
  slug: string;
  nom: string;
  ville: string;
  quartier?: string;
  plan: "free" | "premium";
  is_verified: boolean;
  note_moyenne: number;
  nb_avis: number;
  category_slug?: string;
  category_nom?: string;
  category_couleur?: string;
  prix_label?: string;
  age_min?: number;
  age_max?: number;
}

const CAT_ICONS: Record<string, { Icon: React.ComponentType<any>; color: string }> = {
  sante:     { Icon: Heart,       color: "#16a34a" },
  education: { Icon: BookOpen,    color: "#7C3AED" },
  loisirs:   { Icon: Zap,         color: "#2563EB" },
  ateliers:  { Icon: Palette,     color: "#DC2626" },
  fetes:     { Icon: Gift,        color: "#DB2777" },
  shopping:  { Icon: ShoppingBag, color: "#0891B2" },
};

const DEMO: Listing[] = [
  { id: "1", slug: "jumpark-trampoline", nom: "JumPark Trampoline", ville: "La Soukra", plan: "premium", is_verified: true, note_moyenne: 4.8, nb_avis: 312, category_slug: "loisirs", category_nom: "Loisirs", category_couleur: "#2563EB", prix_label: "Dès 15 TND", age_min: 3, age_max: 14 },
  { id: "2", slug: "dr-ben-ali-sana", nom: "Dr. Ben Ali Sana", ville: "Les Berges du Lac", plan: "premium", is_verified: true, note_moyenne: 4.9, nb_avis: 148, category_slug: "sante", category_nom: "Santé", category_couleur: "#16a34a", prix_label: "60 TND" },
  { id: "3", slug: "kids-english-club", nom: "Kids English Club", ville: "Manar 2", plan: "free", is_verified: true, note_moyenne: 4.7, nb_avis: 89, category_slug: "education", category_nom: "Éducation", category_couleur: "#7C3AED", age_min: 6, age_max: 16 },
  { id: "4", slug: "happy-birthday-events", nom: "Happy Birthday Events", ville: "Ariana", plan: "premium", is_verified: false, note_moyenne: 4.6, nb_avis: 203, category_slug: "fetes", category_nom: "Fêtes", category_couleur: "#DB2777", prix_label: "Sur devis" },
  { id: "5", slug: "atelier-robotique-kids", nom: "Atelier Robotique Kids", ville: "CUN", plan: "premium", is_verified: true, note_moyenne: 4.9, nb_avis: 47, category_slug: "ateliers", category_nom: "Ateliers", category_couleur: "#DC2626", prix_label: "Dès 120 TND/mois", age_min: 8, age_max: 16 },
];

function CategoryIcon({ slug, color }: { slug?: string; color?: string }) {
  const cat = slug ? CAT_ICONS[slug] : null;
  const iconColor = cat?.color ?? color ?? "#F26522";
  const Icon = cat?.Icon ?? Building2;
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: iconColor + "18" }}
    >
      <Icon size={20} style={{ color: iconColor }} strokeWidth={1.75} />
    </div>
  );
}

function Card({ l }: { l: Listing }) {
  const color = l.category_couleur ?? "#F26522";
  return (
    <Link
      href={`/listing/${l.slug}`}
      className={`block flex-shrink-0 w-[220px] bg-white rounded-2xl border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${
        l.plan === "premium" ? "border-amber-300" : "border-black/8"
      }`}
    >
      {/* Thumbnail */}
      <div className="h-[100px] flex items-center justify-center relative overflow-hidden bg-gray-50">
        {l.plan === "premium" && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-400" />
        )}
        {l.plan === "premium" && (
          <div className="absolute top-2 right-2 bg-amber-400 text-white rounded-full px-2 py-0.5 flex items-center gap-0.5">
            <Crown size={9} />
            <span className="text-[8px] font-bold">Premium</span>
          </div>
        )}
        <CategoryIcon slug={l.category_slug} color={color} />
      </div>

      {/* Content */}
      <div className="p-3">
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase"
          style={{ background: color + "18", color }}
        >
          {l.category_nom}
        </span>

        <h3 className="text-[13px] font-bold text-[#111827] mt-2 mb-0.5 leading-tight line-clamp-2">
          {l.nom}
        </h3>

        <p className="text-[11px] text-gray-400 flex items-center gap-1 mb-2">
          <MapPin size={9} />
          {l.quartier ? `${l.quartier} · ` : ""}{l.ville}
        </p>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[12px] font-bold text-amber-500">
            <Star size={10} fill="currentColor" />
            {Number(l.note_moyenne).toFixed(1)}
            <span className="text-[10px] text-gray-400 font-normal">({l.nb_avis})</span>
          </span>
          {l.prix_label && (
            <span className="text-[11px] font-bold text-[#F26522]">{l.prix_label}</span>
          )}
          {l.age_min != null && l.age_max != null && !l.prix_label && (
            <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-400">
              {l.age_min}–{l.age_max} ans
            </span>
          )}
        </div>

        {l.is_verified && (
          <div className="mt-2 pt-2 border-t border-black/5 flex items-center gap-1">
            <span className="text-[10px] text-green-600 font-semibold">✓ Établissement vérifié</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function FeaturedListings() {
  const [listings, setListings] = useState<Listing[]>(DEMO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/listings?featured=true&limit=8")
      .then((r) => r.json())
      .then((data) => {
        if (data.listings && data.listings.length >= 3) setListings(data.listings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-[64px] bg-[#F7F6F2]">
      <div className="max-w-[1140px] mx-auto px-5">
        <div className="flex items-end justify-between mb-7">
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#F26522] mb-1">
              Coups de cœur
            </p>
            <h2 className="text-[clamp(22px,3vw,34px)] font-extrabold text-[#0D2461] leading-tight">
              Les plus populaires près de vous
            </h2>
            <p className="text-gray-400 text-[13px] mt-1">
              {loading ? "Chargement..." : `${listings.length} établissements recommandés par les familles`}
            </p>
          </div>
          <Link href="/listings"
            className="hidden md:inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#F26522] hover:text-[#e05a1a] transition-colors">
            Voir tout
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto -mx-5 px-5 no-scrollbar">
          <div className="flex gap-3.5 pb-4">
            {listings.map((l) => <Card key={l.id} l={l} />)}
            <Link href="/listings"
              className="flex-shrink-0 w-[160px] rounded-2xl border border-dashed border-black/15 flex flex-col items-center justify-center gap-2 text-center hover:border-[#F26522]/40 hover:bg-orange-50/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <ArrowRight size={18} className="text-gray-400" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-[#0D2461]">Explorer tous</p>
                <p className="text-[11px] text-gray-400">les établissements</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-3 md:hidden text-center">
          <Link href="/listings" className="text-[13px] font-semibold text-[#F26522] hover:underline">
            Voir tous les établissements →
          </Link>
        </div>
      </div>
    </section>
  );
}
