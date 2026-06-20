"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import {
  Building2, Search, Eye, Edit3, Trash2, Crown,
  CheckCircle2, AlertCircle, RefreshCw, Loader2,
  ChevronUp, ChevronDown, Filter, Download, Square,
  CheckSquare, Plus,
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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

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
    if (!confirm(`Supprimer "${nom}" ? Action irreversible.`)) return;
    await supabase.from("listings").delete().eq("id", id);
    setListings((ls) => ls.filter((l) => l.id !== id));
  };

  // Selection
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((l) => l.id)));
    }
  };

  // Bulk actions
  const bulkDelete = async () => {
    if (!selected.size) return;
    if (!confirm(`Supprimer ${selected.size} listing(s) ? Action irreversible.`)) return;
    setBulkLoading(true);
    for (const id of Array.from(selected)) {
      await supabase.from("listings").delete().eq("id", id);
    }
    setListings((ls) => ls.filter((l) => !selected.has(l.id)));
    setSelected(new Set());
    setBulkLoading(false);
  };

  const bulkSetPlan = async (plan: "free" | "premium") => {
    if (!selected.size) return;
    setBulkLoading(true);
    await supabase.from("listings").update({ plan }).in("id", Array.from(selected));
    setListings((ls) => ls.map((l) => selected.has(l.id) ? { ...l, plan } : l));
    setSelected(new Set());
    setBulkLoading(false);
  };

  const bulkSetActive = async (is_active: boolean) => {
    if (!selected.size) return;
    setBulkLoading(true);
    await supabase.from("listings").update({ is_active }).in("id", Array.from(selected));
    setListings((ls) => ls.map((l) => selected.has(l.id) ? { ...l, is_active } : l));
    setSelected(new Set());
    setBulkLoading(false);
  };

  // CSV Export
  const exportCsv = () => {
    const rows = filtered;
    const headers = ["nom", "ville", "plan", "is_active", "is_verified", "phone", "website", "note_moyenne", "nb_avis", "category_nom", "created_at"];
    const csv = [
      headers.join(";"),
      ...rows.map((l) => headers.map((h) => {
        const val = l[h] ?? "";
        return `"${String(val).replace(/"/g, '\"')}""`;
      }).join(";")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kidsworld-listings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const filtered = listings
    .filter((l) => {
      if (search && !l.nom?.toLowerCase().includes(search.toLowerCase()) && !l.ville?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterPlan !== "all" && l.plan !== filterPlan) return false;
      if (filterStatus === "active" && !l.is_active) return false;
      if (filterStatus === "inactive" && l.is_active) return false;
      return true;
    })
    .sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronDown size={10} className="opacity-30" />;
    return sortDir === "asc" ? <ChevronUp size={10} /> : <ChevronDown size={10} />;
  }

  return (
    <div className="p-6 space-y-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-black text-[28px] text-[#0D2461] leading-none">Listings</h1>
          <p className="text-gray-400 text-[13px] mt-1">{listings.length} etablissements</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-black/10 rounded-xl text-[12px] font-semibold text-gray-600 hover:bg-gray-50 transition-all">
            <Download size={13} /> CSV
          </button>
          <button onClick={load} disabled={loading} className="w-8 h-8 flex items-center justify-center bg-white border border-black/10 rounded-xl text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-all">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <Link href="/dashboard/listing/nouveau" className="flex items-center gap-1.5 px-3 py-2 bg-[#0D2461] text-white rounded-xl text-[12px] font-bold hover:bg-[#1a3a8a] transition-all">
            <Plus size={13} /> Nouveau
          </Link>
        </div>
      </div>

      {/* Bulk toolbar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 bg-[#0D2461] text-white px-4 py-3 rounded-xl">
          <span className="text-[12px] font-bold mr-2">{selected.size} selectionne(s)</span>
          <button onClick={() => bulkSetPlan("premium")} disabled={bulkLoading} className="px-3 py-1.5 bg-[#F5C518] text-[#0D2461] rounded-lg text-[11px] font-bold hover:bg-[#F5C518]/80 transition-all disabled:opacity-50">
            <Crown size={11} className="inline mr-1" />Premium
          </button>
          <button onClick={() => bulkSetPlan("free")} disabled={bulkLoading} className="px-3 py-1.5 bg-white/20 rounded-lg text-[11px] font-bold hover:bg-white/30 transition-all disabled:opacity-50">Free</button>
          <button onClick={() => bulkSetActive(true)} disabled={bulkLoading} className="px-3 py-1.5 bg-green-500/80 rounded-lg text-[11px] font-bold hover:bg-green-500 transition-all disabled:opacity-50">Activer</button>
          <button onClick={() => bulkSetActive(false)} disabled={bulkLoading} className="px-3 py-1.5 bg-white/20 rounded-lg text-[11px] font-bold hover:bg-white/30 transition-all disabled:opacity-50">Masquer</button>
          <button onClick={bulkDelete} disabled={bulkLoading} className="ml-auto px-3 py-1.5 bg-red-500/80 rounded-lg text-[11px] font-bold hover:bg-red-500 transition-all disabled:opacity-50">
            <Trash2 size={11} className="inline mr-1" />Supprimer
          </button>
          {bulkLoading && <Loader2 size={14} className="animate-spin ml-2" />}
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-white border border-black/8 rounded-xl px-3 py-2">
          <Search size={14} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="flex-1 text-[13px] outline-none bg-transparent"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-black/8 rounded-xl p-1">
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
              {v === "all" ? "Tous" : v === "active" ? "Actifs" : "Masques"}
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
                  <th className="px-4 py-3 w-10">
                    <button onClick={toggleSelectAll} className="text-gray-400 hover:text-[#0D2461]">
                      {selected.size === filtered.length && filtered.length > 0
                        ? <CheckSquare size={14} className="text-[#0D2461]" />
                        : <Square size={14} />}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase cursor-pointer hover:text-[#0D2461] select-none" onClick={() => sort("nom")}>
                    <span className="flex items-center gap-1">Etablissement <SortIcon field="nom" /></span>
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase cursor-pointer hover:text-[#0D2461] select-none" onClick={() => sort("ville")}>
                    <span className="flex items-center gap-1">Ville <SortIcon field="ville" /></span>
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase cursor-pointer hover:text-[#0D2461] select-none" onClick={() => sort("note_moyenne")}>
                    <span className="flex items-center gap-1">Note <SortIcon field="note_moyenne" /></span>
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase cursor-pointer hover:text-[#0D2461] select-none" onClick={() => sort("plan")}>
                    <span className="flex items-center gap-1">Plan <SortIcon field="plan" /></span>
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Statut</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className={`border-b border-black/5 last:border-0 transition-colors ${selected.has(l.id) ? "bg-blue-50" : "hover:bg-[#F7F6F2]"}`}>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(l.id)} className="text-gray-400 hover:text-[#0D2461]">
                        {selected.has(l.id) ? <CheckSquare size={14} className="text-[#0D2461]" /> : <Square size={14} />}
                      </button>
                    </td>
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
                          <span className="text-[12px] font-bold text-[#F5C518]">★ {Number(l.note_moyenne || 0).toFixed(1)}</span>
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
                          <><AlertCircle size={10} /> Masque</>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/listing/${l.slug}`} target="_blank"
                          className="w-7 h-7 rounded-lg bg-[#F7F6F2] flex items-center justify-center text-gray-400 hover:bg-[#0D2461] hover:text-white transition-all" title="Voir">
                          <Eye size={12} />
                        </Link>
                        <Link href={`/dashboard/listing/${l.id}/edit`}
                          className="w-7 h-7 rounded-lg bg-[#F7F6F2] flex items-center justify-center text-gray-400 hover:bg-[#F26522] hover:text-white transition-all" title="Modifier">
                          <Edit3 size={12} />
                        </Link>
                        <button onClick={() => deleteListing(l.id, l.nom)}
                          className="w-7 h-7 rounded-lg bg-[#F7F6F2] flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-all" title="Supprimer">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <Building2 size={24} className="text-gray-200 mx-auto mb-2" />
                      <p className="text-[13px] text-gray-400">Aucun listing trouve</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-black/5 bg-[#F7F6F2]">
              <p className="text-[11px] text-gray-400">{filtered.length} resultats</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
