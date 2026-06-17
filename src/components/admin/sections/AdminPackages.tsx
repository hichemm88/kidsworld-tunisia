"use client";

import { useState } from "react";
import { Package, Check, Edit3 } from "lucide-react";

const DEFAULT_PACKAGES = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "à vie",
    color: "#6B7280",
    features: [
      "1 listing",
      "Informations de base",
      "Visible dans les résultats",
    ],
    cta: "Gratuit",
  },
  {
    id: "premium",
    name: "Premium",
    price: 49,
    period: "/ mois",
    color: "#F5C518",
    features: [
      "1 listing premium mis en avant",
      "Photos illimitées",
      "Horaires & tarifs",
      "Carte interactive",
      "Badge vérifié ✓",
      "Statistiques de vues",
      "Support prioritaire",
    ],
    cta: "Commencer",
    popular: true,
  },
  {
    id: "premium-annual",
    name: "Premium Annuel",
    price: 399,
    period: "/ an",
    color: "#0D2461",
    features: [
      "Tout Premium mensuel",
      "Économisez 189 DT/an",
      "2 mois offerts",
      "Onboarding dédié",
    ],
    cta: "Choisir annuel",
  },
];

export default function AdminPackages() {
  const [packages, setPackages] = useState(DEFAULT_PACKAGES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState(0);

  const startEdit = (pkg: typeof packages[0]) => {
    setEditingId(pkg.id);
    setEditPrice(pkg.price);
  };

  const saveEdit = (id: string) => {
    setPackages((ps) => ps.map((p) => p.id === id ? { ...p, price: editPrice } : p));
    setEditingId(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-black text-[28px] text-[#0D2461] leading-none">Packages & Prix</h1>
        <p className="text-gray-400 text-[13px] mt-1">Configuration des offres et tarifs</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-[13px] text-amber-700">
        ⚠️ Cette section est en cours de développement. Les prix affichés sont des valeurs par défaut. L&apos;intégration Konnect sera configurée dans la section Paiements.
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-white rounded-2xl border-2 p-6 relative ${
              pkg.popular ? "border-[#F5C518]" : "border-black/8"
            }`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F5C518] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Populaire
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-black text-[16px]" style={{ color: pkg.color }}>{pkg.name}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  {editingId === pkg.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                        className="w-20 border border-black/15 rounded-lg px-2 py-1 text-[20px] font-black outline-none focus:border-[#0D2461]/40"
                      />
                      <button onClick={() => saveEdit(pkg.id)} className="text-green-600 hover:text-green-800 font-bold text-[13px]">✓ OK</button>
                    </div>
                  ) : (
                    <>
                      <span className="font-black text-[28px] text-[#0D2461]">{pkg.price} DT</span>
                      <span className="text-[12px] text-gray-400">{pkg.period}</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => startEdit(pkg)}
                className="w-8 h-8 rounded-xl bg-[#F7F6F2] flex items-center justify-center text-gray-400 hover:bg-[#0D2461] hover:text-white transition-all"
              >
                <Edit3 size={13} />
              </button>
            </div>

            <ul className="space-y-2 mb-6">
              {pkg.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[12px] text-gray-600">
                  <Check size={12} className="mt-0.5 shrink-0" style={{ color: pkg.color }} />
                  {f}
                </li>
              ))}
            </ul>

            <div className="px-4 py-2.5 rounded-xl text-center text-[13px] font-bold" style={{ background: pkg.color + "15", color: pkg.color }}>
              {pkg.cta}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-black/8 p-5">
        <h2 className="font-bold text-[15px] text-[#0D2461] mb-3 flex items-center gap-2">
          <Package size={15} /> Prochaines fonctionnalités
        </h2>
        <ul className="text-[13px] text-gray-500 space-y-1.5">
          <li>• Gestion des durées d&apos;abonnement (mensuel, annuel, personnalisé)</li>
          <li>• Période d&apos;essai gratuite configurable</li>
          <li>• Packages multi-listings pour les grandes enseignes</li>
          <li>• Prix par ville / région</li>
          <li>• Intégration Konnect pour paiement automatique (section Paiements)</li>
        </ul>
      </div>
    </div>
  );
}
