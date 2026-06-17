"use client";

import { useState } from "react";
import { Tag, Plus, Trash2, Copy } from "lucide-react";

interface Promo {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  uses: number;
  maxUses: number | null;
  expiresAt: string | null;
  active: boolean;
}

const MOCK_PROMOS: Promo[] = [
  { id: "1", code: "LAUNCH50", type: "percent", value: 50, uses: 12, maxUses: 50, expiresAt: "2025-12-31", active: true },
  { id: "2", code: "SUMMER25", type: "percent", value: 25, uses: 3, maxUses: null, expiresAt: "2025-09-01", active: true },
  { id: "3", code: "KIDSWORLD", type: "fixed", value: 10, uses: 8, maxUses: null, expiresAt: null, active: false },
];

export default function AdminPromos() {
  const [promos, setPromos] = useState<Promo[]>(MOCK_PROMOS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent" as "percent" | "fixed", value: 0, maxUses: "", expiresAt: "" });

  const addPromo = () => {
    if (!form.code) return;
    const newPromo: Promo = {
      id: Date.now().toString(),
      code: form.code.toUpperCase(),
      type: form.type,
      value: form.value,
      uses: 0,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      expiresAt: form.expiresAt || null,
      active: true,
    };
    setPromos((ps) => [newPromo, ...ps]);
    setForm({ code: "", type: "percent", value: 0, maxUses: "", expiresAt: "" });
    setShowForm(false);
  };

  const toggleActive = (id: string) => {
    setPromos((ps) => ps.map((p) => p.id === id ? { ...p, active: !p.active } : p));
  };

  const deletePromo = (id: string) => {
    if (confirm("Supprimer cette promo ?")) setPromos((ps) => ps.filter((p) => p.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-[28px] text-[#0D2461] leading-none">Promotions</h1>
          <p className="text-gray-400 text-[13px] mt-1">Codes promo et offres spéciales</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D2461] text-white rounded-xl text-[13px] font-bold hover:bg-[#1a3a8a] transition-all"
        >
          <Plus size={14} /> Nouvelle promo
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-[13px] text-amber-700">
        ⚠️ Les codes promo affichés sont des données de démonstration. L&apos;intégration base de données sera ajoutée dans une prochaine phase.
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-black/8 p-5 mb-4">
          <h2 className="font-bold text-[15px] text-[#0D2461] mb-4">Créer un code promo</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block">Code</label>
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="ex: SUMMER25"
                className="w-full border border-black/12 rounded-xl px-3 py-2 text-[13px] font-mono uppercase outline-none focus:border-[#0D2461]/30"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "percent" | "fixed" }))}
                className="w-full border border-black/12 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0D2461]/30 bg-white"
              >
                <option value="percent">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (DT)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block">
                Valeur {form.type === "percent" ? "(%)" : "(DT)"}
              </label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
                className="w-full border border-black/12 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0D2461]/30"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block">Utilisations max (vide = illimité)</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                placeholder="Illimité"
                className="w-full border border-black/12 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0D2461]/30"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block">Expiration</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                className="w-full border border-black/12 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0D2461]/30"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addPromo} className="px-4 py-2 bg-[#0D2461] text-white rounded-xl text-[13px] font-bold hover:bg-[#1a3a8a] transition-all">
              Créer
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-[#F7F6F2] text-gray-500 rounded-xl text-[13px] font-semibold hover:bg-gray-200 transition-all">
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/8 bg-[#F7F6F2]">
              <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Code</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Remise</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Utilisations</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Expiration</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Statut</th>
              <th className="text-right px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promos.map((p) => (
              <tr key={p.id} className="border-b border-black/5 last:border-0 hover:bg-[#F7F6F2] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[13px] text-[#0D2461] bg-[#F7F6F2] px-2 py-1 rounded-lg">
                      {p.code}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(p.code)}
                      className="text-gray-300 hover:text-gray-500 transition-colors"
                      title="Copier"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[13px] font-bold" style={{ color: p.type === "percent" ? "#F26522" : "#16A34A" }}>
                    {p.type === "percent" ? `-${p.value}%` : `-${p.value} DT`}
                  </span>
                </td>
                <td className="px-4 py-3 text-[12px] text-gray-500">
                  {p.uses} {p.maxUses ? `/ ${p.maxUses}` : "/ ∞"}
                </td>
                <td className="px-4 py-3 text-[12px] text-gray-500">
                  {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString("fr-FR") : "Aucune"}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(p.id)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
                      p.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {p.active ? "● Actif" : "○ Inactif"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <button
                      onClick={() => deletePromo(p.id)}
                      className="w-7 h-7 rounded-lg bg-[#F7F6F2] flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
