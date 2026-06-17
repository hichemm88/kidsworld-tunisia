"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import {
  Building2, Users, Star, Crown, Eye, TrendingUp,
  ArrowRight, RefreshCw, Loader2, CheckCircle2,
  AlertCircle, Clock, Briefcase,
} from "lucide-react";

interface Stats {
  totalListings: number;
  activeListings: number;
  premiumListings: number;
  freeListings: number;
  totalUsers: number;
  totalPros: number;
  totalParents: number;
  totalReviews: number;
  premiumRate: number;
  recentListings: any[];
  topRated: any[];
  byCategory: { nom: string; emoji: string; count: number }[];
}

export default function AdminHome() {
  const supabase = createClient();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    const [listingsRes, profilesRes, reviewsRes] = await Promise.all([
      supabase
        .from("listings_with_stats")
        .select("id, nom, slug, plan, is_active, ville, note_moyenne, nb_avis, category_nom, category_emoji, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, role"),
      supabase.from("reviews").select("id", { count: "exact", head: true }),
    ]);

    const ls = listingsRes.data || [];
    const profiles = profilesRes.data || [];

    const totalListings = ls.length;
    const activeListings = ls.filter((l) => l.is_active).length;
    const premiumListings = ls.filter((l) => l.plan === "premium").length;
    const freeListings = totalListings - premiumListings;
    const premiumRate = totalListings ? Math.round((premiumListings / totalListings) * 100) : 0;

    const totalUsers = profiles.length;
    const totalPros = profiles.filter((p) => p.role === "pro").length;
    const totalParents = profiles.filter((p) => p.role === "parent").length;

    const catMap: Record<string, { nom: string; emoji: string; count: number }> = {};
    ls.forEach((l) => {
      if (l.category_nom) {
        const k = l.category_nom;
        if (!catMap[k]) catMap[k] = { nom: k, emoji: l.category_emoji || "📍", count: 0 };
        catMap[k].count++;
      }
    });

    setStats({
      totalListings,
      activeListings,
      premiumListings,
      freeListings,
      totalUsers,
      totalPros,
      totalParents,
      totalReviews: reviewsRes.count || 0,
      premiumRate,
      recentListings: ls.slice(0, 6),
      topRated: [...ls]
        .filter((l) => (l.nb_avis || 0) > 0)
        .sort((a, b) => Number(b.note_moyenne) - Number(a.note_moyenne))
        .slice(0, 5),
      byCategory: Object.values(catMap).sort((a, b) => b.count - a.count),
    });

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-[#0D2461]" />
      </div>
    );
  }

  const s = stats!;

  const STAT_CARDS = [
    {
      label: "Listings total",
      value: s.totalListings,
      sub: `${s.activeListings} actifs`,
      icon: <Building2 size={18} />,
      color: "#0D2461",
      href: "/admin/listings",
    },
    {
      label: "Premium",
      value: s.premiumListings,
      sub: `${s.premiumRate}% du total`,
      icon: <Crown size={18} />,
      color: "#F5C518",
      href: "/admin/listings?plan=premium",
    },
    {
      label: "Utilisateurs",
      value: s.totalUsers,
      sub: `${s.totalParents} parents · ${s.totalPros} pros`,
      icon: <Users size={18} />,
      color: "#7C3AED",
      href: "/admin/parents",
    },
    {
      label: "Professionnels",
      value: s.totalPros,
      sub: "fiches clients",
      icon: <Briefcase size={18} />,
      color: "#0891B2",
      href: "/admin/pros",
    },
    {
      label: "Avis",
      value: s.totalReviews,
      sub: "évaluations",
      icon: <Star size={18} />,
      color: "#F26522",
      href: "/admin/listings",
    },
    {
      label: "Taux premium",
      value: `${s.premiumRate}%`,
      sub: `${s.freeListings} listings free`,
      icon: <TrendingUp size={18} />,
      color: "#16A34A",
      href: "/admin/packages",
    },
  ];

  const QUICK_LINKS = [
    { href: "/admin/listings", label: "Gérer les listings", icon: <Building2 size={14} />, color: "#0D2461" },
    { href: "/admin/parents", label: "Gérer les parents", icon: <Users size={14} />, color: "#7C3AED" },
    { href: "/admin/pros", label: "Gérer les pros", icon: <Briefcase size={14} />, color: "#0891B2" },
    { href: "/admin/packages", label: "Packages & Prix", icon: <Crown size={14} />, color: "#F5C518" },
    { href: "/admin/promos", label: "Promotions", icon: <Eye size={14} />, color: "#F26522" },
    { href: "/admin/settings", label: "Paramètres", icon: <AlertCircle size={14} />, color: "#6B7280" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-black text-[28px] text-[#0D2461] leading-none">Dashboard</h1>
          <p className="text-gray-400 text-[13px] mt-1">Vue d&apos;ensemble de la plateforme</p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-black/8 rounded-xl text-[13px] font-semibold text-gray-500 hover:text-[#0D2461] transition-all"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {STAT_CARDS.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-2xl p-4 border border-black/8 hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: card.color + "15", color: card.color }}
            >
              {card.icon}
            </div>
            <p className="font-black text-[28px] leading-none text-[#0D2461]">{card.value}</p>
            <p className="text-[12px] font-bold text-gray-600 mt-1">{card.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{card.sub}</p>
          </Link>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* Recent listings */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-black/8 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/6">
            <h2 className="font-bold text-[15px] text-[#0D2461]">Derniers listings</h2>
            <Link href="/admin/listings" className="text-[12px] font-semibold text-[#F26522] hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-black/5">
            {s.recentListings.map((l) => (
              <div key={l.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#F7F6F2] transition-colors">
                <span className="text-lg">{l.category_emoji || "📍"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-[#0D2461] truncate">{l.nom}</p>
                  <p className="text-[11px] text-gray-400">{l.category_nom} · {l.ville}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {l.plan === "premium" && (
                    <span className="text-[10px] font-bold bg-[#F5C518]/15 text-[#B8941A] px-2 py-0.5 rounded-full">
                      ⭐ Premium
                    </span>
                  )}
                  {l.is_active ? (
                    <CheckCircle2 size={14} className="text-green-500" />
                  ) : (
                    <AlertCircle size={14} className="text-gray-300" />
                  )}
                  <Link
                    href={`/listing/${l.slug}`}
                    target="_blank"
                    className="w-6 h-6 rounded-lg bg-[#F7F6F2] flex items-center justify-center text-gray-400 hover:text-[#0D2461] transition-colors"
                  >
                    <Eye size={11} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right col */}
        <div className="flex flex-col gap-4">
          {/* By category */}
          <div className="bg-white rounded-2xl border border-black/8 p-5 flex-1">
            <h2 className="font-bold text-[15px] text-[#0D2461] mb-4">Par catégorie</h2>
            <div className="space-y-3">
              {s.byCategory.slice(0, 6).map((c) => {
                const pct = s.totalListings ? Math.round((c.count / s.totalListings) * 100) : 0;
                return (
                  <div key={c.nom}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-semibold text-gray-600">
                        {c.emoji} {c.nom}
                      </span>
                      <span className="text-[11px] font-bold text-[#0D2461]">{c.count}</span>
                    </div>
                    <div className="h-1.5 bg-[#F7F6F2] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0D2461] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top rated */}
        <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
          <div className="px-5 py-4 border-b border-black/6">
            <h2 className="font-bold text-[15px] text-[#0D2461]">Top listings par note</h2>
          </div>
          <div className="divide-y divide-black/5">
            {s.topRated.length === 0 && (
              <p className="px-5 py-8 text-center text-[13px] text-gray-400">Aucun avis encore</p>
            )}
            {s.topRated.map((l, i) => (
              <div key={l.id} className="flex items-center gap-3 px-5 py-3">
                <span className="text-[14px] font-black text-gray-200 w-5">{i + 1}</span>
                <span className="text-base">{l.category_emoji || "📍"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-[#0D2461] truncate">{l.nom}</p>
                  <p className="text-[11px] text-gray-400">{l.ville}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-black text-[#F5C518]">★ {Number(l.note_moyenne).toFixed(1)}</p>
                  <p className="text-[10px] text-gray-400">{l.nb_avis} avis</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl border border-black/8 p-5">
          <h2 className="font-bold text-[15px] text-[#0D2461] mb-4">Accès rapides</h2>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-black/8 text-[13px] font-semibold text-gray-600 hover:border-[#0D2461]/20 hover:bg-[#F7F6F2] hover:text-[#0D2461] transition-all group"
              >
                <span style={{ color: l.color }}>{l.icon}</span>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Health summary */}
          <div className="mt-4 bg-[#F7F6F2] rounded-xl p-4">
            <p className="text-[12px] font-bold text-[#0D2461] mb-2">Santé de la plateforme</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-green-500" /> Listings actifs
                </span>
                <span className="font-bold text-[#0D2461]">{s.activeListings} / {s.totalListings}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Crown size={12} className="text-[#F5C518]" /> Taux premium
                </span>
                <span className="font-bold text-[#0D2461]">{s.premiumRate}%</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Clock size={12} className="text-blue-500" /> Listings inactifs
                </span>
                <span className="font-bold text-orange-500">{s.totalListings - s.activeListings}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
