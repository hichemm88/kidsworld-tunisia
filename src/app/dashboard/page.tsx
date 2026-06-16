"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import {
  Eye, Star, Edit3, Crown, MapPin, LogOut, Plus,
  ChevronRight, ToggleLeft, ToggleRight, Loader2, Bell
} from "lucide-react";

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUser(user);

      const [listingsRes, reviewsRes] = await Promise.all([
        supabase.from("listings_with_stats").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
        supabase.from("reviews").select("*, listing:listings(nom, slug)").in(
          "listing_id",
          // get listing ids first via a separate query if listings not loaded yet
          await supabase.from("listings").select("id").eq("owner_id", user.id).then(r => (r.data || []).map((l: any) => l.id))
        ).order("created_at", { ascending: false }).limit(10),
      ]);

      setListings(listingsRes.data || []);
      setReviews(reviewsRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("listings").update({ is_active: !current }).eq("id", id);
    setListings((l) => l.map((x) => x.id === id ? { ...x, is_active: !current } : x));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-[#0D2461] mx-auto mb-3" />
          <p className="text-gray-400 text-[13px]">Chargement...</p>
        </div>
      </div>
    );
  }

  const totalViews = listings.reduce((acc, l) => acc + (l.vues || 0), 0);
  const avgRating = listings.length
    ? (listings.reduce((acc, l) => acc + Number(l.note_moyenne || 0), 0) / listings.length).toFixed(1)
    : "–";
  const totalReviews = listings.reduce((acc, l) => acc + (l.nb_avis || 0), 0);
  const premiumCount = listings.filter((l) => l.plan === "premium").length;

  return (
    <div className="min-h-screen bg-[#F7F6F2]">

      {/* Header */}
      <div className="bg-[#071640] px-5 py-4">
        <div className="max-w-[960px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[11px] font-extrabold text-[#0D2461] italic">
              K<span className="text-[#F26522]">W</span>
            </div>
            <div>
              <p className="font-bebas text-[14px] tracking-[2px] text-white leading-none">KidsWorld</p>
              <p className="text-[10px] text-white/40">Espace professionnel</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors" title="Admin">
              <Bell size={15} />
            </Link>
            <button onClick={signOut}
              className="flex items-center gap-1.5 text-[12px] font-bold text-white/70 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <LogOut size={14} /> Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-5 py-6">

        {/* Welcome */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-bebas text-[28px] text-[#0D2461] tracking-wide leading-none">
              Bonjour, {user?.email?.split("@")[0]} 👋
            </h1>
            <p className="text-[13px] text-gray-500 mt-0.5">Gérez vos établissements depuis votre tableau de bord</p>
          </div>
          <Link href="/dashboard/listing/nouveau/edit"
            className="flex items-center gap-2 bg-[#F26522] text-white font-bold text-[13px] px-4 py-2.5 rounded-xl hover:bg-[#FF8C4B] transition-all">
            <Plus size={15} /> Nouveau listing
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Listings actifs", value: listings.filter((l) => l.is_active).length, icon: "📍", color: "bg-blue-50 text-blue-600" },
            { label: "Total vues", value: totalViews || "–", icon: "👁️", color: "bg-green-50 text-green-600" },
            { label: "Note moyenne", value: avgRating + (avgRating !== "–" ? " ★" : ""), icon: "⭐", color: "bg-amber-50 text-amber-600" },
            { label: "Avis reçus", value: totalReviews, icon: "💬", color: "bg-purple-50 text-purple-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-black/8">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-2.5 ${s.color}`}>
                {s.icon}
              </div>
              <p className="font-bebas text-[28px] text-[#0D2461] leading-none tracking-wide">{s.value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Mes listings */}
        <div className="mb-6">
          <h2 className="font-bold text-[16px] text-[#0D2461] mb-3">Mes établissements ({listings.length})</h2>

          {listings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-black/8 p-10 text-center">
              <div className="text-4xl mb-3">🏢</div>
              <p className="font-bold text-[16px] text-gray-700 mb-2">Aucun établissement encore</p>
              <p className="text-[13px] text-gray-400 mb-6">Créez votre première fiche et commencez à attirer des parents</p>
              <Link href="/dashboard/listing/nouveau/edit"
                className="bg-[#F26522] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#FF8C4B] transition-all inline-flex items-center gap-2">
                <Plus size={15} /> Créer mon premier listing
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {listings.map((l) => (
                <div key={l.id} className="bg-white rounded-2xl border border-black/8 p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F7F6F2] flex items-center justify-center text-2xl flex-shrink-0">
                    {l.category_emoji || "📍"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-bold text-[15px] text-[#0D2461] truncate">{l.nom}</p>
                      {l.plan === "premium" && (
                        <span className="inline-flex items-center gap-0.5 bg-[#F5C518]/15 text-[#B8941A] text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                          <Crown size={9} /> Premium
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1"><MapPin size={10} /> {l.ville}</span>
                      <span className="flex items-center gap-1"><Star size={10} className="text-[#F5C518] fill-[#F5C518]" /> {Number(l.note_moyenne || 0).toFixed(1)} ({l.nb_avis || 0} avis)</span>
                      <span className={`font-semibold ${l.is_active ? "text-green-500" : "text-gray-400"}`}>
                        {l.is_active ? "● Actif" : "○ Masqué"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleActive(l.id, l.is_active)}
                      className="w-9 h-9 rounded-xl bg-[#F7F6F2] flex items-center justify-center text-gray-500 hover:bg-[#0D2461] hover:text-white transition-all"
                      title={l.is_active ? "Masquer" : "Activer"}>
                      {l.is_active ? <ToggleRight size={16} className="text-green-500" /> : <ToggleLeft size={16} />}
                    </button>
                    <Link href={`/listing/${l.slug}`}
                      className="w-9 h-9 rounded-xl bg-[#F7F6F2] flex items-center justify-center text-[#0D2461] hover:bg-[#0D2461] hover:text-white transition-all">
                      <Eye size={15} />
                    </Link>
                    <Link href={`/dashboard/listing/${l.id}/edit`}
                      className="w-9 h-9 rounded-xl bg-[#F26522] flex items-center justify-center text-white hover:bg-[#FF8C4B] transition-all">
                      <Edit3 size={15} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">

          {/* Derniers avis */}
          <div className="bg-white rounded-2xl p-5 border border-black/8">
            <h2 className="font-bold text-[15px] text-[#0D2461] mb-4">Derniers avis reçus</h2>
            {reviews.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">⭐</div>
                <p className="text-[13px] text-gray-400">Aucun avis pour l&apos;instant</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {reviews.slice(0, 4).map((r: any) => (
                  <div key={r.id} className="flex gap-3 pb-3 border-b border-black/6 last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-[#0D2461]/10 flex items-center justify-center text-sm font-bold text-[#0D2461] flex-shrink-0">
                      {(r.user?.full_name || "A")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-[12px] font-bold text-[#111827]">{r.user?.full_name || "Anonyme"}</p>
                        <span className="text-[#F5C518] text-[11px]">{"★".repeat(r.note)}</span>
                      </div>
                      {r.listing && (
                        <p className="text-[10px] text-[#F26522] font-semibold mb-0.5">{r.listing.nom}</p>
                      )}
                      <p className="text-[12px] text-gray-400 truncate italic">&ldquo;{r.commentaire}&rdquo;</p>
                      <p className="text-[10px] text-gray-300 mt-0.5">
                        {new Date(r.created_at).toLocaleDateString("fr-TN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-2xl p-5 border border-black/8">
            <h2 className="font-bold text-[15px] text-[#0D2461] mb-4">Actions rapides</h2>
            <div className="flex flex-col gap-1">
              {[
                { icon: "➕", label: "Ajouter un nouveau listing", href: "/dashboard/listing/nouveau/edit" },
                { icon: "👤", label: "Gérer mon profil", href: "/profil" },
                { icon: "🏠", label: "Retour à l'accueil", href: "/" },
                { icon: "🔍", label: "Voir tous les listings", href: "/listings" },
                { icon: "⭐", label: "Offres Premium", href: "/tarifs" },
              ].map((action) => (
                <Link key={action.href} href={action.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F7F6F2] transition-colors group">
                  <span className="text-lg">{action.icon}</span>
                  <span className="flex-1 text-[13px] font-semibold text-gray-700 group-hover:text-[#0D2461]">
                    {action.label}
                  </span>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Upgrade Premium */}
        {premiumCount === 0 && (
          <div className="bg-[#0D2461] rounded-2xl p-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#F5C518] rounded-xl flex items-center justify-center flex-shrink-0">
                <Crown size={18} className="text-[#071640]" />
              </div>
              <div>
                <p className="font-extrabold text-white text-[15px] mb-0.5">Passez en Premium</p>
                <p className="text-[13px] text-white/60 leading-relaxed">
                  Apparaissez en premier, badge vérifié, photos mises en avant, statistiques avancées.
                </p>
              </div>
            </div>
            <Link href="/tarifs"
              className="flex-shrink-0 bg-[#F26522] text-white text-[13px] font-bold px-5 py-2.5 rounded-xl hover:bg-[#FF8C4B] transition-colors whitespace-nowrap">
              Voir les offres →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
