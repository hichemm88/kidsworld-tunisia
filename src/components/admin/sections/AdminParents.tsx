"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { Users, Search, Loader2, LogIn, Trash2, Mail } from "lucide-react";

export default function AdminParents() {
  const supabase = createClient();
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at, role")
        .eq("role", "parent")
        .order("created_at", { ascending: false });
      setParents(data || []);
      setLoading(false);
    })();
  }, []);

  const filtered = parents.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.full_name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-[28px] text-[#0D2461] leading-none">Parents</h1>
          <p className="text-gray-400 text-[13px] mt-1">{parents.length} comptes parents</p>
        </div>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email…"
          className="w-full pl-8 pr-3 py-2 bg-white border border-black/8 rounded-xl text-[13px] outline-none focus:border-[#0D2461]/30"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#0D2461]" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/8 bg-[#F7F6F2]">
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Nom</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Inscription</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-black/5 last:border-0 hover:bg-[#F7F6F2] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#7C3AED]/10 flex items-center justify-center text-[#7C3AED] font-bold text-[13px]">
                        {(p.full_name || p.email || "?")[0].toUpperCase()}
                      </div>
                      <span className="text-[13px] font-semibold text-[#0D2461]">{p.full_name || "–"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${p.email}`} className="text-[12px] text-gray-500 hover:text-[#0D2461] flex items-center gap-1">
                      <Mail size={11} /> {p.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-gray-400">
                    {new Date(p.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white text-[11px] font-bold transition-all"
                        title="Se connecter en tant que ce parent"
                        onClick={() => alert("Impersonation — à implémenter avec audit log")}
                      >
                        <LogIn size={11} /> Se connecter
                      </button>
                      <button
                        className="w-7 h-7 rounded-lg bg-[#F7F6F2] flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-all"
                        title="Supprimer"
                        onClick={() => confirm(`Supprimer le compte de ${p.full_name || p.email} ?`)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <Users size={24} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-[13px] text-gray-400">Aucun parent trouvé</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
