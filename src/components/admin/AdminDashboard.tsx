"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import Link from "next/link";
import {
  Users, Building2, Star, Crown, RefreshCw, Eye, Edit3,
  Trash2, Check, X, ChevronRight, Loader2, Database
} from "lucide-react";

const TABS = ["Listings", "Statistiques", "Seed données"];

export default function AdminDashboard() {
  const supabase = createClient();
  const [tab, setTab] = useState(0);
  const [listings, setListings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [listingsRes, statsRes] = await Promise.all([
      supabase.from("listings_with_stats").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("listings").select("id, plan, is_active, category_id, categories(slug,nom,emoji)", { count: "exact" }),
    ]);

    const ls = listingsRes.data || [];
    setListings(ls);

    const total = ls.length;
    const premium = ls.filter((l: any) => l.plan === "premium").length;
    const active = ls.filter((l: any) => l.is_active).length;

    const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    const { count: reviewCount } = await supabase.from("reviews").select("*", { count: "exact", head: true });

    const catCounts: Record<string, { nom: string; emoji: string; count: number }> = {};
    ls.forEach((l: any) => {
      if (l.category_nom) {
        const k = l.category_nom;
        if (!catCounts[k]) catCounts[k] = { nom: k, emoji: l.category_emoji || "📍", count: 0 };
        catCounts[k].count++;
      }
    });

    setStats({
      total, premium, free: total - premium, active,
      users: userCount || 0, reviews: reviewCount || 0,
      premiumRate: total ? Math.round((premium / total) * 100) : 0,
      categories: Object.values(catCounts).sort((a, b) => b.count - a.count),
    });

    setLoading(false);
  };

  const togglePremium = async (id: string, current: string) => {
    const newPlan = current === "premium" ? "standard" : "premium";
    await supabase.from("listings").update({ plan: newPlan }).eq("id", id);
    setListings((ls) => ls.map((l) => l.id === id ? { ...l, plan: newPlan } : l));
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("listings").update({ is_active: !current }).eq("id", id);
    setListings((ls) => ls.map((l) => l.id === id ? { ...l, is_active: !current } : l));
  };

  const deleteListing = async (id: string, nom: string) => {
    if (!confirm(`Supprimer "${nom}" ? Action irréversible.`)) return;
    await supabase.from("listings").delete().eq("id", id);
    setListings((ls) => ls.filter((l) => l.id !== id));
  };

  const runSeed = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await fetch("/api/admin/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: "kidsworld-seed-2024" }),
      });
      const data = await res.json();
      setSeedResult(data);
      if (data.ok) await loadData();
    } catch (err) {
      setSeedResult({ error: "Erreur réseau" });
    } finally {
      setSeeding(false);
    }
  };

  const filtered = listings.filter((l) =>
    !search || l.nom?.toLowerCase().includes(search.toLowerCase()) || l.ville?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-[#0D2461]" />
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { icon: <Building2 size={16} />, label: "Listings", value: stats?.total, color: "#0D2461" },
          { icon: <Check size={16} />, label: "Actifs", value: stats?.active, color: "#16a34a" },
          { icon: <Crown size={16} />, label: "Premium", value: stats?.premium, color: "#F5C518" },
          { icon: <Users size={16} />, label: "Utilisateurs", value: stats?.users, color: "#7C3AED" },
          { icon: <Star size={16} />, label: "Avis", value: stats?.reviews, color: "#F26522" },
          { icon: <Building2 size={16} />, label: "Taux premium", value: stats?.premiumRate + "%", color: "#DC2626" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-black/8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: s.color + "15", color: s.color }}>
              {s.icon}
            </div>
            <p className="font-bebas text-[26px] leading-none" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-black/8 mb-6 w-fit">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${i === tab ? "bg-[#0D2461] text-white" : "text-gray-400 hover:text-gray-600"}`}>
            {t}
          </button>
        ))}
        <button onClick={loadData} className="ml-2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#0D2461] transition-colors" title="Actualiser">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Listings */}
      {tab === 0 && (
        <div>
          <div className="mb-4">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou ville..."
              className="w-full max-w-sm border border-black/12 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0D2461]/50" />
          </div>
          <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/8 bg-[#F7F6F2]">
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Établissement</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Ville</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Note</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Plan</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Statut</th>
                    <th className="text-right px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.id} className="border-b border-black/6 last:border-0 hover:bg-[#F7F6F2] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{l.category_emoji || "📍"}</span>
                          <div>
                            <p className="text-[13px] font-bold text-[#0D2461] truncate max-w-[180px]">{l.nom}</p>
                            <p className="text-[10px] text-gray-400">{l.category_nom || "–"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-500">{l.ville}</td>
                      <td className="px-4 py-3">
                        <span className="text-[12px] font-bold text-[#F5C518]">★ {Number(l.note_moyenne || 0).toFixed(1)}</span>
                        <span className="text-[10px] text-gray-400 ml-1">({l.nb_avis || 0})</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => togglePremium(l.id, l.plan)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-full transition-all ${
                            l.plan === "premium"
                              ? "bg-[#F5C518]/15 text-[#B8941A] hover:bg-[#F5C518]/30"
                              : "bg-gray-100 text-gray-500 hover:bg-[#F5C518]/15 hover:text-[#B8941A]"
                          }`}>
                          {l.plan === "premium" ? "⭐ Premium" : "Free"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActive(l.id, l.is_active)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-full transition-all ${
                            l.is_active
                              ? "bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-500"
                              : "bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700"
                          }`}>
                          {l.is_active ? "● Actif" : "○ Masqué"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/listing/${l.slug}`}
                            className="w-7 h-7 rounded-lg bg-[#F7F6F2] flex items-center justify-center text-gray-500 hover:bg-[#0D2461] hover:text-white transition-all">
                            <Eye size={12} />
                          </Link>
                          <Link href={`/dashboard/listing/${l.id}/edit`}
                            className="w-7 h-7 rounded-lg bg-[#F7F6F2] flex items-center justify-center text-gray-500 hover:bg-[#F26522] hover:text-white transition-all">
                            <Edit3 size={12} />
                          </Link>
                          <button onClick={() => deleteListing(l.id, l.nom)}
                            className="w-7 h-7 rounded-lg bg-[#F7F6F2] flex items-center justify-center text-gray-500 hover:bg-red-500 hover:text-white transition-all">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-[13px] text-gray-400">
                        Aucun listing trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      {tab === 1 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-black/8 p-5">
            <h3 className="font-bold text-[15px] text-[#0D2461] mb-4">Listings par catégorie</h3>
            <div className="flex flex-col gap-3">
              {(stats?.categories || []).map((c: any) => {
                const pct = stats?.total ? Math.round((c.count / stats.total) * 100) : 0;
                return (
                  <div key={c.nom}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-semibold text-gray-700">{c.emoji} {c.nom}</span>
                      <span className="text-[12px] font-bold text-[#0D2461]">{c.count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-[#F7F6F2] rounded-full overflow-hidden">
                      <div className="h-full bg-[#0D2461] rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {(!stats?.categories || stats.categories.length === 0) && (
                <p className="text-[13px] text-gray-400 text-center py-4">Pas de données</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-black/8 p-5">
            <h3 className="font-bold text-[15px] text-[#0D2461] mb-4">Top listings par note</h3>
            <div className="flex flex-col gap-3">
              {listings
                .filter((l) => l.nb_avis > 0)
                .sort((a, b) => Number(b.note_moyenne) - Number(a.note_moyenne))
                .slice(0, 6)
                .map((l, i) => (
                  <Link key={l.id} href={`/listing/${l.slug}`}
                    className="flex items-center gap-3 hover:bg-[#F7F6F2] rounded-xl p-2 -mx-2 transition-colors group">
                    <span className="text-[13px] font-extrabold text-gray-300 w-4">{i + 1}</span>
                    <span className="text-base">{l.category_emoji || "📍"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-[#0D2461] truncate">{l.nom}</p>
                      <p className="text-[10px] text-gray-400">{l.ville}</p>
                    </div>
                    <span className="text-[12px] font-bold text-[#F5C518]">★ {Number(l.note_moyenne).toFixed(1)}</span>
                    <ChevronRight size={12} className="text-gray-300 group-hover:text-gray-500" />
                  </Link>
                ))}
              {listings.filter((l) => l.nb_avis > 0).length === 0 && (
                <p className="text-[13px] text-gray-400 text-center py-4">Aucun avis encore</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seed données */}
      {tab === 2 && (
        <div className="max-w-[540px]">
          <div className="bg-white rounded-2xl border border-black/8 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#0D2461]/8 flex items-center justify-center">
                <Database size={20} className="text-[#0D2461]" />
              </div>
              <div>
                <h3 className="font-bold text-[15px] text-[#0D2461]">Insérer données réelles</h3>
                <p className="text-[12px] text-gray-500">20 listings tunisiens réels seront insérés/mis à jour</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-[12px] text-amber-700">
              ⚠️ Les catégories doivent exister dans la base. Cette action est idempotente (upsert).
            </div>

            <button onClick={runSeed} disabled={seeding}
              className="w-full py-3 bg-[#0D2461] text-white font-bold rounded-xl hover:bg-[#1a3a8a] disabled:opacity-60 transition-all flex items-center justify-center gap-2">
              {seeding ? <><Loader2 size={15} className="animate-spin" /> Insertion en cours...</> : "🌱 Lancer le seed"}
            </button>

            {seedResult && (
              <div className={`mt-4 p-4 rounded-xl text-[13px] ${seedResult.ok ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                {seedResult.ok ? (
                  <div>
                    <p className="font-bold text-green-700 mb-1">✅ Seed réussi !</p>
                    <p className="text-green-600">{seedResult.inserted} / {seedResult.total} listings insérés</p>
                    {seedResult.errors?.length > 0 && (
                      <div className="mt-2">
                        <p className="font-bold text-amber-600">Erreurs :</p>
                        {seedResult.errors.map((e: string, i: number) => (
                          <p key={i} className="text-amber-600 text-[11px]">{e}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-red-600 font-semibold">❌ {seedResult.error || "Échec du seed"}</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 bg-white rounded-2xl border border-black/8 p-5">
            <h3 className="font-bold text-[14px] text-[#0D2461] mb-3">Migration Supabase requise</h3>
            <p className="text-[12px] text-gray-500 mb-3">
              Pour que le profil parent fonctionne, exécutez ce SQL dans l&apos;éditeur Supabase :
            </p>
            <div className="bg-[#F7F6F2] rounded-xl p-3 text-[11px] font-mono text-gray-600 overflow-x-auto">
              {`CREATE TABLE IF NOT EXISTS children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  surnom TEXT NOT NULL,
  date_naissance DATE NOT NULL,
  sexe TEXT CHECK (sexe IN ('garçon','fille','autre')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own children" ON children
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
