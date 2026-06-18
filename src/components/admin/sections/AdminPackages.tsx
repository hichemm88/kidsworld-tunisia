"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import {
  Package, Plus, Edit3, Trash2, Check, X,
  Loader2, GripVertical, ToggleLeft, ToggleRight,
} from "lucide-react";

interface DBPackage {
  id: string;
  slug: string;
  name: string;
  price_dt: number;
  period: string;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

const EMPTY: Omit<DBPackage, "id" | "sort_order"> = {
  slug: "",
  name: "",
  price_dt: 0,
  period: "mois",
  features: [],
  is_popular: false,
  is_active: true,
};

export default function AdminPackages() {
  const supabase = createClient();
  const [packages, setPackages] = useState<DBPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<DBPackage, "id" | "sort_order">>(EMPTY);
  const [featuresStr, setFeaturesStr] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dbMissing, setDbMissing] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error?.message?.includes("does not exist")) {
      setDbMissing(true);
    } else {
      setPackages(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startEdit = (pkg: DBPackage) => {
    setEditId(pkg.id);
    setForm({
      slug: pkg.slug,
      name: pkg.name,
      price_dt: pkg.price_dt,
      period: pkg.period,
      features: pkg.features,
      is_popular: pkg.is_popular,
      is_active: pkg.is_active,
    });
    setFeaturesStr((pkg.features || []).join("\n"));
    setShowAdd(false);
  };

  const startAdd = () => {
    setEditId(null);
    setForm({ ...EMPTY });
    setFeaturesStr("");
    setShowAdd(true);
  };

  const cancel = () => { setEditId(null); setShowAdd(false); };

  const save = async () => {
    setSaving(true);
    const features = featuresStr.split("\n").map((f) => f.trim()).filter(Boolean);
    const payload = { ...form, features };

    if (editId) {
      await supabase.from("packages").update(payload).eq("id", editId);
      setPackages((ps) => ps.map((p) => p.id === editId ? { ...p, ...payload } : p));
    } else {
      const { data } = await supabase
        .from("packages")
        .insert({ ...payload, sort_order: packages.length })
        .select()
        .single();
      if (data) setPackages((ps) => [...ps, data]);
    }
    setSaving(false);
    cancel();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("packages").update({ is_active: !current }).eq("id", id);
    setPackages((ps) => ps.map((p) => p.id === id ? { ...p, is_active: !current } : p));
  };

  const togglePopular = async (id: string, current: boolean) => {
    // Only one popular at a time
    await supabase.from("packages").update({ is_popular: false }).neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("packages").update({ is_popular: !current }).eq("id", id);
    setPackages((ps) => ps.map((p) => ({ ...p, is_popular: p.id === id ? !current : false })));
  };

  const deletePkg = async (id: string, name: string) => {
    if (!confirm(`Supprimer le package "${name}" ?`)) return;
    await supabase.from("packages").delete().eq("id", id);
    setPackages((ps) => ps.filter((p) => p.id !== id));
  };

  const COLORS: Record<string, string> = {
    free: "#6B7280",
    premium: "#F5C518",
    "premium-annual": "#0D2461",
  };
  const color = (slug: string) => COLORS[slug] || "#0D2461";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-[#0D2461]" />
      </div>
    );
  }

  if (dbMissing) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="font-black text-[28px] text-[#0D2461] leading-none">Packages & Prix</h1>
        </div>
        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <p className="font-bold text-[15px] text-red-600 mb-2">⚠️ Table manquante</p>
          <p className="text-[13px] text-gray-600 mb-4">
            La table <code className="bg-gray-100 px-1 rounded font-mono">packages</code> n&apos;existe pas encore dans votre base Supabase.
            Exécutez le SQL suivant dans l&apos;éditeur SQL de Supabase :
          </p>
          <pre className="bg-[#F7F6F2] rounded-xl p-4 text-[11px] font-mono text-gray-700 overflow-x-auto whitespace-pre-wrap">
{`CREATE TABLE packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price_dt INT NOT NULL DEFAULT 0,
  period TEXT NOT NULL DEFAULT 'mois',
  features JSONB DEFAULT '[]',
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all" ON packages USING (true) WITH CHECK (true);

INSERT INTO packages (slug, name, price_dt, period, features, is_popular, sort_order) VALUES
('free', 'Free', 0, 'à vie', '["1 listing","Informations de base","Visible dans les résultats"]', FALSE, 0),
('premium', 'Premium', 49, 'mois', '["1 listing premium mis en avant","Photos illimitées","Horaires & tarifs","Carte interactive","Badge vérifié ✓","Statistiques de vues","Support prioritaire"]', TRUE, 1),
('premium-annual', 'Premium Annuel', 399, 'an', '["Tout Premium mensuel","Économisez 189 DT/an","2 mois offerts","Onboarding dédié"]', FALSE, 2);`}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-[28px] text-[#0D2461] leading-none">Packages & Prix</h1>
          <p className="text-[13px] text-gray-500 mt-1">{packages.length} packages actifs</p>
        </div>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D2461] text-white text-[13px] font-semibold hover:os=-[10%] transition"
        >
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white rounded-2xl border border-gray-150 p-5 mb-5">
          <h2 className="font-bold text-[15px] text-[#0D2461] mb-4">Nouveau package</h2>
          <PackageForm
            form={form}
            setForm={setForm}
            featuresStr={featuresStr}
            setFeaturesStr={setFeaturesStr}
            onSave={save}
            onCancel={cancel}
            saving={saving}
          />
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-2xl border border-gray-150 overflow-hidden">
            {editId === pkg.id ? (
              <div className="p-5">
                <h2 className="font-bold text-[15px] text-[#0D2461] mb-4">Modifier : {pkg.name}</h2>
                <PackageForm
                  form={form}
                  setForm={setForm}
                  featuresStr={featuresStr}
                  setFeaturesStr={setFeaturesStr}
                  onSave={save}
                  onCancel={cancel}
                  saving={saving}
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 p-5">
                {/* Color dot */}
                <div className="w-2 h-10 rounded-full shrink-0" style={{ backgroundColor: color(pkg.slug) }} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[15px] text-[#0D2461]">{pkg.name}</span>
                    {pkg.is_popular && <span className="px-2 py-0.5 rounded-full bg-[#F5C518]/15 text-[#B89200] text-[10px] font-semibold">Populaire</span>}
                    {!pkg.is_active && <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 text-[10px] font-semibold">Inactif</span>}
                  </div>
                  <p className="text-[13px] text-gray-500 mt-0.5">
                    {pkg.price_dt === 0 ? "Gratuit" : `${pkg.price_dt} DT/`${pkg.period}`}
                    {pkg.features?.length > 0 && ` · ${pkg.features.length} avantages`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => togglePopular(pkg.id, pkg.is_popular)} title="Populaire"
                    className="p-2 rounded-lg hover:bg-gray-100 text-[12px]">
                    <span className={pkg.is_popular ? "text-[#F5C518]" : "text-gray-300"}>⚡</span>
                  </button>
                  <button onClick={() => toggleActive(pkg.id, pkg.is_active)} title={pkg.is_active ? "Désactiver" : "Activer"}
                    className="p-2 rounded-lg hover:bg-gray-100">
                    {pkg.is_active
                      ? <ToggleRight size={18} className="text-green-500" />
                      : <ToggleLeft size={18} className="text-gray-300" />}
                  </button>
                  <button onClick={() => startEdit(pkg)} className="p-2 rounded-lg hover:bg-gray-100">
                    <Edit3 size={15} className="text-gray-400" />
                  </button>
                  <button onClick={() => deletePkg(pkg.id, pkg.name)} className="p-2 rounded-lg hover:bg-red-50/20">
                    <Trash2 size={15} className="text-red-300" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PackageForm({ form, setForm, featuresStr, setFeaturesStr, onSave, onCancel, saving }: {
  form: any; setForm: any; featuresStr: string; setFeaturesStr: any; onSave: () => void; onCancel: () => void; saving: boolean;
}) {
  const f = (n: string, v: string | number | boolean) => setForm((prev: any) => ({ ...prev, [n]: v }));
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-[12px] font-semibold text-gray-600 mb-1">Slug</label>
        <input value={form.slug} onChange={e => f("slug", e.target.value)}
          className="w5 width-full border border-gray-200 rounded-xl px-3 py-2 text-[13px]" placeholder="e.g. free" />
      </div>
      <div>
        <label className="block text-[12px] font-semibold text-gray-600 mb-1">Nom</label>
        <input value={form.name} onChange={e => f("name", e.target.value)}
          className="width-full border border-gray-200 rounded-xl px-3 py-2 text-[13px]" />
      </div>
      <div>
        <label className="block text-[12px] font-semibold text-gray-600 mb-1">Prix DT</label>
        <input type="number" value={form.price_dt} onChange={e => f("price_dt", Number(e.target.value))}
          className="width-full border border-gray-200 rounded-xl px-3 py-2 text-[13px]" />
      </div>
      <div>
        <label className="block text-[12px] font-semibold text-gray-600 mb-1">Période</label>
        <input value={form.period} onChange={e => f("period", e.target.value)}
          className="width-full border border-gray-200 rounded-xl px-3 py-2 text-[13px]" placeholder="mois | an | à vie" />
      </div>
      <div className="col-span-2">
        <label className="block text-[12px] font-semibold text-gray-600 mb-1">Avantages (1 par ligne)</label>
        <textarea rows={5} value={featuresStr} onChange={e => setFeaturesStr(e.target.value)}
          className="width-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] resize-none"
          placeholder={"1 listing\nPhotos illimitées\n..."} />
      </div>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_popular} onChange={e => f("is_popular", e.target.checked)} />
          <span className="text-[13px] font-semibold">Populaire</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={e => f("is_active", e.target.checked)} />
          <span className="text-[13px] font-semibold">Actif</span>
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] hover:bg-gray-50 transition">Annuler</button>
        <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded-xl bg-[#0D2461] text-white text-[13px] font-semibold hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50">
          {saving && <Loader2 size={14} className="animate-spin" />} Enregistrer
        </button>
      </div>
    </div>
  );
}
