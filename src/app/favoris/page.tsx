"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import Navbar from "@/components/layout/Navbar";
import {
  Heart, Star, MapPin, Building2, Zap, BookOpen, Palette, Gift, ShoppingBag, Loader2,
} from "lucide-react";

const CAT_ICONS: Record<string, { Icon: React.ComponentType<any>; color: string }> = {
  sante:     { Icon: Heart,       color: "#16a34a" },
  education: { Icon: BookOpen,    color: "#7C3AED" },
  loisirs:   { Icon: Zap,        color: "#2563EB" },
  ateliers:  { Icon: Palette,    color: "#DC2626" },
  fetes:     { Icon: Gift,       color: "#DB2777" },
  shopping:  { Icon: ShoppingBag,color: "#0891B2" },
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

export default function FavorisPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data } = await supabase
        .from("favorites")
        .select(`
          id,
          listing:listings_with_stats (
            id, slug, nom, ville, quartier, plan, is_verified,
            category_nom, category_slug, category_couleur,
            note_moyenne, nb_avis, prix_label, age_min, age_max
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setFavorites(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const removeFav = async (favId: string) => {
    setRemovingId(favId);
    await supabase.from("favorites").delete().eq("id", favId);
    setFavorites((prev) => prev.filter((f) => f.id !== favId));
    setRemovingId(null);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F7F6F2]">
        <div className="max-w-[760px] mx-auto px-5 py-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Heart size={20} className="text-red-500 fill-red-500" />
            </div>
            <div>
              <h1 className="text-[22px] font-extrabold text-[#0D2461]">Mes favoris</h1>
              {!loading && (
                <p className="text-[13px] text-gray-400">
                  {favorites.length === 0
                    ? "Aucun favori enregistré"
                    : `${favorites.length} établissement${favorites.length > 1 ? "s" : ""} sauvegardé${favorites.length > 1 ? "s" : ""}`}
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[#0D2461]" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Heart size={28} className="text-red-300" />
              </div>
              <p className="font-extrabold text-[18px] text-[#0D2461] mb-2">Aucun favori pour l&apos;instant</p>
              <p className="text-[14px] text-gray-400 mb-6">Cliquez sur ♥ sur n&apos;importe quelle fiche pour la retrouver ici</p>
              <Link href="/listings"
                className="inline-flex items-center gap-2 bg-[#F26522] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#FF8C4B] transition-all">
                Explorer les listings
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {favorites.map((fav) => {
                const l = fav.listing;
                if (!l) return null;
                const color = l.category_couleur ?? "#F26522";
                return (
                  <div key={fav.id}
                    className={`bg-white rounded-2xl border-[1.5px] p-4 flex gap-3 transition-all ${l.plan === "premium" ? "border-amber-300" : "border-black/8"} hover:shadow-md`}>
                    {/* Icon */}
                    <Link href={`/listing/${l.slug}`} className="w-[60px] h-[60px] rounded-xl flex-shrink-0 overflow-hidden relative block">
                      {l.plan === "premium" && <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber-400 z-10" />}
                      <CategoryIcon slug={l.category_slug} color={l.category_couleur} size={24} />
                    </Link>
                    {/* Content */}
                    <Link href={`/listing/${l.slug}`} className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase"
                          style={{ background: color + "20", color }}>{l.category_nom}</span>
                        {l.is_verified && <span className="text-[9px] font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded-full">✓ Vérifié</span>}
                        {l.plan === "premium" && <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-full">Premium</span>}
                      </div>
                      <h3 className="text-[14px] font-extrabold text-[#111827] leading-snug mb-0.5 truncate">{l.nom}</h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1.5">
                        <MapPin size={10} />
                        <span>{l.quartier ? `${l.quartier}, ` : ""}{l.ville}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
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
                    </Link>
                    {/* Remove button */}
                    <button
                      onClick={() => removeFav(fav.id)}
                      disabled={removingId === fav.id}
                      className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-all disabled:opacity-50"
                      title="Retirer des favoris"
                    >
                      {removingId === fav.id ? <Loader2 size={14} className="animate-spin" /> : <Heart size={14} className="fill-red-400" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
