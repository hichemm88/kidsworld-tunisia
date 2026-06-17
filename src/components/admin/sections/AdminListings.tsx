"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import {
  Building2, Search, Eye, Edit3, Trash2, Crown,
  CheckCircle2, AlertCircle, RefreshCw, Loader2,
  ChevronUp, ChevronDown, Filter,
} from "lucide-react";

type SortField = "nom" | "ville" | "plan" | "note_moyenne" | "created_at";
type SortDir = "asc" | "desc";

export default function AdminListings() {
  const supabase = createClient();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<"all" | "free" | "premium">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("listings_with_stats")
      .select("*")
      .order("created_at", { ascending: false });
    setListings(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const togglePlan = async (id: string, current: string) => {
    const next = current === "premium" ? "free" : "premium";
    await supabase.from("listings").update({ plan: next }).eq("id", id);
    setListings((ls) => ls.map((l) => l.id === id ? { ...l, plan: next } : l));
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

  const sort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const filtered = listings
    .filter((l) => {
      if (filterPlan !== "all" && l.plan !== filterPlan) return false;
      if (filterStatus === "active" && !l.is_active) return false;
      if (filterStatus === "inactive" && l.is_active) return false;
      if (search) {
        const q = search.toLowerCase();
        return l.nom?.toLowerCase().includes(q) || l.ville?.toLowerCase().includes(q) || l.category_nom?.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      let va = a[sortField] ?? "";
      let vb = b[sortField] ?? "";
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp size={10} className="text-gray-300" />;
    return sortDir === "asc"
      ? <ChevronUp size={10} className="text-[#0D2461]" />
      : <ChevronDown size={10} className="text-[#0D2461]" />;
  };

  const total = listings.length;
  const premium = listings.filter((l) => l.plan === "premium").length;
  const active = listings.filter((l) => l.is_active).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-[28px] text-[#0D2461] leading-none">Listings</h1>
          <p className="text-gray-400 text-[13px] mt-1">
            {total} listings · {premium} premium · {active} actifs
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-black/8 rounded-xl text-[13px] font-semibold text-gray-500 hover:text-[#0D2461] transition-all"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total", value: total, color: "#0D2461", onClick: () => setFilterPlan("all") },
          { label: "Premium", value: premium, color: "#F5C518", onClick: () => setFilterPlan("premium") },
          { label: "Actifs", value: active, color: "#16A34A", onClick: () => setFilterStatus("active") },
        ].map((s) => (
          <button
            key={s.label}
            onClick={s.onClick}
            className="bg-white rounded-2xl p-4 border border-black/8 text-left hover:shadow-sm transition-all"
          >
            <p className="font-black text-[26px] leading-none" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="w-full pl-8 pr-3 py-2 bg-white border border-black/8 rounded-xl text-[13px] outline-none focus:border-[#0D2461]/30"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-black/8 rounded-xl p-1">
          <Filter size={12} className="text-gray-400 ml-2" />
          {(["all", "free", "premium"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFilterPlan(v)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                filterPlan === v ? "bg-[#0D2461] text-white" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {v === "all" ? "Tous" : v === "free" ? "Free" : "Premium"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-white border border-black/8 rounded-xl p-1">
          {(["all", "active", "inactive"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFilterStatus(v)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                filterStatus === v ? "bg-[#0D2461] text-white" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {v === "all" ? "Tous" : v === "active" ? "Actifs" : "Masqués"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-black/8">
          <Loader2 size={24} className="animate-spin text-[#0D2461]" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/8 bg-[#F7F6F2]">
                  <th
                    className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase cursor-pointer hover:text-[#0D2461] select-none"
                    onClick={() => sort("nom")}
                  >
                    <span className="flex items-center gap-1">Établissement <SortIcon field="nom" /></span>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase cursor-pointer hover:text-[#0D2461] select-none"
                    onClick={() => sort("ville")}
                  >
                    <span className="flex items-center gap-1">Ville <SortIcon field="ville" /></span>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase cursor-pointer hover:text-[#0D2461] select-none"
                    onClick={() => sort("note_moyenne")}
                  >
                    <span className="flex items-center gap-1">Note <SortIcon field="note_moyenne" /></span>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase cursor-pointer hover:text-[#0D2461] select-none"
                    onClick={() => sort("plan")}
                  >
                    <span className="flex items-center gap-1">Plan <SortIcon field="plan" /></span>
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Statut</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-b border-black/5 last:border-0 hover:bg-[#F7F6F2] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{l.category_emoji || "📍"}</span>
                        <div>
                          <p className="text-[13px] font-bold text-[#0D2461] max-w-[200px] truncate">{l.nom}</p>
                          <p className="text-[10px] text-gray-400">{l.category_nom || "–"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-500">{l.ville || "–"}</td>
                    <td className="px-4 py-3">
                      {(l.nb_avis || 0) > 0 ? (
                        <div>
                          <span className="text-[12px] font-bold text-[#F5C518]">
                            ★ {Number(l.note_moyenne || 0).toFixed(1)}
                          </span>
                          <span className="text-[10px] text-gray-400 ml-1">({l.nb_avis})</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-300">–</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePlan(l.id, l.plan)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
                          l.plan === "premium"
                            ? "bg-[#F5C518]/15 text-[#B8941A] hover:bg-[#F5C518]/30"
                            : "bg-gray-100 text-gray-500 hover:bg-[#F5C518]/10 hover:text-[#B8941A]"
                        }`}
                      >
                        {l.plan === "premium" ? "⭐ Premium" : "Free"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(l.id, l.is_active)}
                        className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
                          l.is_active
                            ? "bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-500"
                            : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-700"
                        }`}
                      >
                        {l.is_active ? (
                          <><CheckCircle2 size={10} /> Actif</>
                        ) : (
                          <><AlertCircle size={10} /> Masqué</>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/listing/${l.slug}`}
                          target="_blank"
                          className="w-7 h-7 rounded-lg bg-[#F7F6F2] flex items-center justify-center text-gray-400 hover:bg-[#0D2461] hover:text-white transition-all"
                          title="Voir"
                        >
                          <Eye size={12} />
                        </Link>
                        <Link
                          href={`/dashboard/listing/${l.id}/edit`}
                          className="w-7 h-7 rounded-lg bg-[#F7F6F2] flex items-center justify-center text-gray-400 hover:bg-[#F26522] hover:text-white transition-all"
                          title="Modifier"
                        >
                          <Edit3 size={12} />
                        </Link>
                        <button
                          onClick={() => deleteListing(l.id, l.nom)}
                          className="w-7 h-7 rounded-lg bg-[#F7F6F2] flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-all"
                          title="Supprimer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Building2 size={24} className="text-gray-200 mx-auto mb-2" />
                      <p className="text-[13px] text-gray-400">Aucun listing trouvé</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-black/5 bg-[#F7F6F2]">
              <p className="text-[11px] text-gray-400">{filtered.length} résultats</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
