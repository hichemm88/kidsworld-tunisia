"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, MapPin, ArrowRight, Crown } from "lucide-react";

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
  category_nom?: string;
  category_emoji?: string;
  category_couleur?: string;
  prix_label?: string;
  age_min?: number;
  age_max?: number;
}

const DEMO: Listing[] = [
  { id: "1", slug: "jumpark-trampoline", nom: "JumPark Trampoline", ville: "La Soukra", plan: "premium", is_verified: true, note_moyenne: 4.8, nb_avis: 312, category_nom: "Loisirs", category_emoji: "🎪", category_couleur: "#2563EB", prix_label: "Dès 15 TND", age_min: 3, age_max: 14 },
  { id: "2", slug: "dr-ben-ali-sana", nom: "Dr. Ben Ali Sana", ville: "Les Berges du Lac", plan: "premium", is_verified: true, note_moyenne: 4.9, nb_avis: 148, category_nom: "Santé", category_emoji: "🏥", category_couleur: "#16a34a", prix_label: "60 TND" },
  { id: "3", slug: "kids-english-club", nom: "Kids English Club", ville: "Manar 2", plan: "free", is_verified: true, note_moyenne: 4.7, nb_avis: 89, category_nom: "Éducation", category_emoji: "🎓", category_couleur: "#7C3AED", age_min: 6, age_max: 16 },
  { id: "4", slug: "happy-birthday-events", nom: "Happy Birthday Events", ville: "Ariana", plan: "premium", is_verified: false, note_moyenne: 4.6, nb_avis: 203, category_nom: "Fêtes", category_emoji: "🎂", category_couleur: "#DB2777", prix_label: "Sur devis" },
  { id: "5", slug: "atelier-robotique-kids", nom: "Atelier Robotique Kids", ville: "CUN", plan: "premium", is_verified: true, note_moyenne: 4.9, nb_avis: 47, category_nom: "Ateliers", category_emoji: "🎨", category_couleur: "#DC2626", prix_label: "Dès 120 TND/mois", age_min: 8, age_max: 16 },
];

function Card({ l }: { l: Listing }) {
  const color = l.category_couleur ?? "#F26522";
  return (
    <Link
      href={`/listing/${l.slug}`}
      className={`block flex-shrink-0 w-[220px] bg-white rounded-2xl border-[1.5px] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200
        ${l.plan === "premium" ? "border-amber-300" : "border-black/8"}`}
    >
      {/* Thumbnail */}
      <div className="h-[110px] bg-gradient-to-br from-[#F7F6F2] to-[#EDE9E0] flex items-center justify-center text-5xl relative overflow-hidden">
        {l.plan === "premium" && (
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300" />
        )}
        {l.plan === "premium" && (
          <div className="absolute top-2 right-2 bg-amber-400/90 backdrop-blur-sm text-white rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
            <Crown size={9} />
            <span className="text-[8px] font-extrabold">Premium</span>
          </div>
        )}
        {l.category_emoji ?? "📍"}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Category badge */}
        <span
          className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase"
          style={{ background: color + "1A", color }}
        >
          {l.category_nom}
        </span>

        <h3 className="text-[14px] font-extrabold text-[#111827] mt-1.5 mb-0.5 leading-tight line-clamp-2">
          {l.nom}
        </h3>

        <p className="text-[11px] text-gray-400 flex items-center gap-1 mb-2">
          <MapPin size={9} />
          {l.quartier ? `${l.quartier} · ` : ""}{l.ville}
        </p>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[12px] font-extrabold text-[#F5C518]">
            <Star size={10} fill="#F5C518" />
            {Number(l.note_moyenne).toFixed(1)}
            <span className="text-[10px] text-gray-400 font-normal">({l.nb_avis})</span>
          </span>
          {l.prix_label && (
            <span className="text-[11px] font-extrabold text-[#F26522]">{l.prix_label}</span>
          )}
          {l.age_min != null && l.age_max != null && !l.prix_label && (
            <span className="text-[10px] bg-[#F7F6F2] px-1.5 py-0.5 rounded-full text-gray-400">
              {l.age_min}–{l.age_max} ans
            </span>
          )}
        </div>

        {l.is_verified && (
          <div className="mt-2 pt-2 border-t border-black/5 flex items-center gap-1">
            <span className="text-[10px] text-blue-600 font-bold">✓ Établissement vérifié</span>
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
        if (data.listings && data.listings.length >= 3) {
          setListings(data.listings);
        }
      })
      .catch(() => {}) // keep demo on error
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-[72px] bg-[#F7F6F2]">
      <div className="max-w-[1140px] mx-auto px-5">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.12em] uppercase text-[#F26522] mb-1">
              ❤️ Coups de cœur
            </p>
            <h2 className="font-bebas text-[clamp(28px,4vw,42px)] text-[#0D2461] tracking-wide leading-tight">
              Les plus populaires près de vous
            </h2>
            <p className="text-gray-400 text-[13px] mt-1">
              {loading ? "Chargement..." : `${listings.length} établissements recommandés par les familles`}
            </p>
          </div>
          <Link
            href="/listings"
            className="hidden md:inline-flex items-center gap-1.5 text-[13px] font-bold text-[#F26522] bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition-colors"
          >
            Voir tout
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Horizontal scroll carousel */}
        <div className="overflow-x-auto -mx-5 px-5 no-scrollbar">
          <div className="flex gap-4 pb-4">
            {listings.map((l) => <Card key={l.id} l={l} />)}
            {/* CTA card */}
            <Link
              href="/listings"
              className="flex-shrink-0 w-[180px] rounded-2xl border-2 border-dashed border-[#0D2461]/20 flex flex-col items-center justify-center gap-3 text-center hover:border-[#F26522]/40 hover:bg-orange-50/50 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#0D2461]/5 flex items-center justify-center text-2xl">
                🔍
              </div>
              <div>
                <p className="text-[13px] font-extrabold text-[#0D2461]">Explorer tous</p>
                <p className="text-[11px] text-gray-400">les établissements</p>
              </div>
              <ArrowRight size={16} className="text-[#F26522]" />
            </Link>
          </div>
        </div>

        <div className="mt-4 md:hidden text-center">
          <Link href="/listings" className="text-[13px] font-bold text-[#F26522] hover:underline">
            Voir tous les établissements →
          </Link>
        </div>
      </div>
    </section>
  );
}
