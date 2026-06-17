"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { Briefcase, Search, Loader2, LogIn, Eye, Mail } from "lucide-react";

export default function AdminPros() {
  const supabase = createClient();
  const [pros, setPros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      // Join profiles with their listings
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at, role")
        .eq("role", "pro")
        .order("created_at", { ascending: false });

      if (!profiles) { setLoading(false); return; }

      // Get listings count per user
      const { data: listings } = await supabase
        .from("listings")
        .select("id, nom, slug, plan, is_active, user_id");

      const listingsByUser: Record<string, any[]> = {};
      (listings || []).forEach((l) => {
        if (!listingsByUser[l.user_id]) listingsByUser[l.user_id] = [];
        listingsByUser[l.user_id].push(l);
      });

      setPros(profiles.map((p) => ({ ...p, listings: listingsByUser[p.id] || [] })));
      setLoading(false);
    })();
  }, []);

  const filtered = pros.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.full_name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-[28px] text-[#0D2461] leading-none">Professionnels</h1>
          <p className="text-gray-400 text-[13px] mt-1">{pros.length} comptes pro</p>
        </div>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher…"
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
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Pro</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Listings</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Inscription</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-black/5 last:border-0 hover:bg-[#F7F6F2] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#0891B2]/10 flex items-center justify-center text-[#0891B2] font-bold text-[13px]">
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
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      {p.listings.length === 0 && <span className="text-[11px] text-gray-300">Aucun listing</span>}
                      {p.listings.slice(0, 2).map((l: any) => (
                        <div key={l.id} className="flex items-center gap-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${l.plan === "premium" ? "bg-[#F5C518]/15 text-[#B8941A]" : "bg-gray-100 text-gray-400"}`}>
                            {l.plan}
                          </span>
                          <Link href={`/listing/${l.slug}`} target="_blank" className="text-[11px] text-[#0D2461] hover:underline truncate max-w-[120px]">
                            {l.nom}
                          </Link>
                        </div>
                      ))}
                      {p.listings.length > 2 && <span className="text-[10px] text-gray-400">+{p.listings.length - 2} autres</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-gray-400">
                    {new Date(p.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {p.listings[0] && (
                        <Link
                          href={`/listing/${p.listings[0].slug}`}
                          target="_blank"
                          className="w-7 h-7 rounded-lg bg-[#F7F6F2] flex items-center justify-center text-gray-400 hover:bg-[#0D2461] hover:text-white transition-all"
                          title="Voir fiche"
                        >
                          <Eye size={12} />
                        </Link>
                      )}
                      <button
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0891B2]/10 text-[#0891B2] hover:bg-[#0891B2] hover:text-white text-[11px] font-bold transition-all"
                        title="Se connecter en tant que ce pro"
                        onClick={() => alert("Impersonation — à implémenter avec audit log")}
                      >
                        <LogIn size={11} /> Se connecter
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Briefcase size={24} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-[13px] text-gray-400">Aucun professionnel trouvé</p>
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
