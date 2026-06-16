import Link from "next/link";
import { MapPin, Star } from "lucide-react";

export type Listing = {
  id: string;
  slug: string;
  nom: string;
  category: string;
  category_label: string;
  category_color: string;
  ville: string;
  quartier?: string;
  distance?: string;
  note: number;
  nb_avis: number;
  emoji: string;
  plan: "free" | "premium";
  is_open: boolean;
  is_verified: boolean;
  age_range?: string;
  prix_label?: string;
};

export default function ListingCard({ listing: l }: { listing: Listing }) {
  return (
    <Link
      href={`/listing/${l.slug}`}
      className={`flex-shrink-0 w-[260px] bg-white rounded-2xl overflow-hidden border-[1.5px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] cursor-pointer transition-all hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 ${
        l.plan === "premium" ? "border-[#FAC775]" : "border-black/8"
      }`}
    >
      {/* Image / emoji area */}
      <div className="h-[160px] flex items-center justify-center text-6xl relative bg-gradient-to-br from-[#F7F6F2] to-[#EDE9E0]">
        {l.plan === "premium" && (
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#F5C518]" />
        )}
        <span>{l.emoji}</span>
        <span
          className={`absolute bottom-2.5 left-2.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
            l.is_open
              ? "bg-green-600/90 text-white"
              : "bg-red-600/85 text-white"
          }`}
        >
          {l.is_open ? "Ouvert" : "Fermé"}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-3.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span
            className="text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide"
            style={{ background: l.category_color + "20", color: l.category_color }}
          >
            {l.category_label}
          </span>
          {l.is_verified && (
            <span className="text-[9px] font-bold text-[#0C447C] bg-[#E6F1FB] px-2 py-0.5 rounded-full">
              Vérifié ✓
            </span>
          )}
          {l.plan === "premium" && (
            <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              Premium
            </span>
          )}
        </div>

        <h3 className="text-[15px] font-extrabold text-[#111827] mb-1 leading-tight">
          {l.nom}
        </h3>

        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center gap-1 text-[12px] text-gray-400">
            <MapPin size={11} />
            {l.quartier || l.ville}
          </span>
          {l.distance && (
            <span className="text-[10px] font-bold text-[#F26522] bg-[#FFF0E8] px-1.5 py-0.5 rounded-full">
              {l.distance}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[12px] font-extrabold text-[#F5C518]">
            <Star size={12} fill="#F5C518" />
            {l.note.toFixed(1)}
            <span className="text-[10px] text-gray-400 font-normal">
              ({l.nb_avis})
            </span>
          </span>
          {l.age_range && (
            <span className="text-[10px] bg-[#F7F6F2] px-2 py-0.5 rounded-full text-gray-500">
              {l.age_range}
            </span>
          )}
          {l.prix_label && (
            <span className="text-[12px] font-extrabold text-[#F26522]">
              {l.prix_label}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
