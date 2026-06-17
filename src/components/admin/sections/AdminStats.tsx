"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { BarChart3, Loader2, TrendingUp, Users, Building2, Star } from "lucide-react";

export default function AdminStats() {
  const supabase = createClient();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [listingsRes, profilesRes, reviewsRes] = await Promise.all([
        supabase.from("listings_with_stats").select("*"),
        supabase.from("profiles").select("id, role, created_at"),
        supabase.from("reviews").select("id, note, created_at"),
      ]);

      const ls = listingsRes.data || [];
      const profiles = profilesRes.data || [];
      const reviews = reviewsRes.data || [];

      // Monthly signups (last 6 months)
      const monthlySignups: Record<string, number> = {};
      profiles.forEach((p) => {
        const m = new Date(p.created_at).toLocaleString("fr-FR", { month: "short", year: "2-digit" });
        monthlySignups[m] = (monthlySignups[m] || 0) + 1;
      });

      // Rating distribution
      const ratingDist = [1, 2, 3, 4, 5].map((r) => ({
        note: r,
        count: reviews.filter((rv) => Math.round(rv.note) === r).length,
      }));

      setData({
        totalListings: ls.length,
        premiumListings: ls.filter((l) => l.plan === "premium").length,
        totalUsers: profiles.length,
        totalReviews: reviews.length,
        avgNote: reviews.length
          ? (reviews.reduce((s, r) => s + Number(r.note), 0) / reviews.length).toFixed(1)
          : "–",
        byCategory: Object.entries(
          ls.reduce((acc: any, l) => {
            const k = l.category_nom || "Autre";
            acc[k] = { nom: k, emoji: l.category_emoji || "📍", count: (acc[k]?.count || 0) + 1 };
            return acc;
          }, {})
        )
          .map(([, v]) => v as { nom: string; emoji: string; count: number })
          .sort((a, b) => b.count - a.count),
        byPlan: [
          { label: "Premium", count: ls.filter((l) => l.plan === "premium").length, color: "#F5C518" },
          { label: "Free", count: ls.filter((l) => l.plan !== "premium").length, color: "#0D2461" },
        ],
        ratingDist,
        monthlySignups,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-[#0D2461]" />
      </div>
    );
  }

  const maxCat = Math.max(...data.byCategory.map((c: any) => c.count), 1);
  const maxRating = Math.max(...data.ratingDist.map((r: any) => r.count), 1);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-black text-[28px] text-[#0D2461] leading-none">Statistiques</h1>
        <p className="text-gray-400 text-[13px] mt-1">Vue analytique de la plateforme</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Listings", value: data.totalListings, icon: <Building2 size={18} />, color: "#0D2461" },
          { label: "Premium", value: `${data.premiumListings} (${data.totalListings ? Math.round(data.premiumListings / data.totalListings * 100) : 0}%)`, icon: <TrendingUp size={18} />, color: "#F5C518" },
          { label: "Utilisateurs", value: data.totalUsers, icon: <Users size={18} />, color: "#7C3AED" },
          { label: "Note moyenne", value: `★ ${data.avgNote}`, icon: <Star size={18} />, color: "#F26522" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl p-5 border border-black/8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: k.color + "15", color: k.color }}>
              {k.icon}
            </div>
            <p className="font-black text-[26px] leading-none text-[#0D2461]">{k.value}</p>
            <p className="text-[12px] text-gray-400 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* By category */}
        <div className="bg-white rounded-2xl border border-black/8 p-5">
          <h2 className="font-bold text-[15px] text-[#0D2461] mb-4 flex items-center gap-2">
            <BarChart3 size={16} /> Listings par catégorie
          </h2>
          <div className="space-y-3">
            {data.byCategory.map((c: any) => (
              <div key={c.nom}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-semibold text-gray-600">{c.emoji} {c.nom}</span>
                  <span className="text-[11px] font-bold text-[#0D2461]">{c.count}</span>
                </div>
                <div className="h-2 bg-[#F7F6F2] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0D2461] rounded-full"
                    style={{ width: `${(c.count / maxCat) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating distribution */}
        <div className="bg-white rounded-2xl border border-black/8 p-5">
          <h2 className="font-bold text-[15px] text-[#0D2461] mb-4">Distribution des notes</h2>
          <div className="space-y-3">
            {[...data.ratingDist].reverse().map((r: any) => (
              <div key={r.note} className="flex items-center gap-3">
                <span className="text-[12px] font-bold text-[#F5C518] w-6">{r.note}★</span>
                <div className="flex-1 h-2 bg-[#F7F6F2] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#F5C518] rounded-full"
                    style={{ width: `${(r.count / maxRating) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] text-gray-400 w-6 text-right">{r.count}</span>
              </div>
            ))}
          </div>
          {data.totalReviews === 0 && (
            <p className="text-[13px] text-gray-400 text-center py-4">Aucun avis encore</p>
          )}
        </div>
      </div>

      {/* Plan distribution */}
      <div className="bg-white rounded-2xl border border-black/8 p-5">
        <h2 className="font-bold text-[15px] text-[#0D2461] mb-4">Répartition des plans</h2>
        <div className="flex items-center gap-4">
          {data.byPlan.map((p: any) => (
            <div key={p.label} className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-bold" style={{ color: p.color }}>{p.label}</span>
                <span className="text-[13px] font-black text-[#0D2461]">{p.count}</span>
              </div>
              <div className="h-3 bg-[#F7F6F2] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${data.totalListings ? (p.count / data.totalListings) * 100 : 0}%`,
                    background: p.color,
                  }}
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                {data.totalListings ? Math.round((p.count / data.totalListings) * 100) : 0}% du total
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
