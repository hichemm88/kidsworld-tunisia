"use client";

import { useState } from "react";
import { CreditCard, Check, AlertCircle, ExternalLink, Eye, EyeOff } from "lucide-react";

export default function AdminPayments() {
  const [konnectKey, setKonnectKey] = useState("");
  const [konnectSecret, setKonnectSecret] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: save to Supabase secrets or env
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const METHODS = [
    {
      id: "konnect",
      name: "Konnect",
      logo: "🔌",
      description: "Passerelle de paiement tunisienne. Accepte CB, virement, monnaie mobile.",
      status: "pending",
      url: "https://konnect.network",
    },
    {
      id: "stripe",
      name: "Stripe",
      logo: "💳",
      description: "Paiement international par carte bancaire.",
      status: "coming",
      url: "https://stripe.com",
    },
    {
      id: "paypal",
      name: "PayPal",
      logo: "🅿️",
      description: "Paiement PayPal pour les clients internationaux.",
      status: "coming",
      url: "https://paypal.com",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-black text-[28px] text-[#0D2461] leading-none">Paiements</h1>
        <p className="text-gray-400 text-[13px] mt-1">Configuration des moyens de paiement</p>
      </div>

      {/* Payment methods */}
      <div className="grid gap-3 mb-6">
        {METHODS.map((m) => (
          <div key={m.id} className="bg-white rounded-2xl border border-black/8 p-5 flex items-center gap-4">
            <div className="text-3xl w-12 text-center">{m.logo}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-bold text-[15px] text-[#0D2461]">{m.name}</p>
                {m.status === "pending" && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">À configurer</span>
                )}
                {m.status === "coming" && (
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Bientôt</span>
                )}
                {m.status === "active" && (
                  <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check size={9} /> Actif
                  </span>
                )}
              </div>
              <p className="text-[12px] text-gray-500">{m.description}</p>
            </div>
            <a
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F7F6F2] text-[12px] font-semibold text-gray-500 hover:bg-[#0D2461] hover:text-white transition-all"
            >
              <ExternalLink size={12} /> Docs
            </a>
          </div>
        ))}
      </div>

      {/* Konnect config */}
      <div className="bg-white rounded-2xl border border-black/8 p-5">
        <h2 className="font-bold text-[15px] text-[#0D2461] mb-1 flex items-center gap-2">
          <CreditCard size={15} /> Configuration Konnect
        </h2>
        <p className="text-[12px] text-gray-400 mb-5">
          Récupérez vos clés API sur{" "}
          <a href="https://konnect.network" target="_blank" className="text-[#0D2461] hover:underline">
            konnect.network →
          </a>
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 flex gap-2 text-[12px] text-amber-700">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>
            Les clés API doivent être stockées en variables d&apos;environnement Vercel, pas en base de données. Cette interface vous guide dans la configuration.
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">
              Konnect API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={konnectKey}
                onChange={(e) => setKonnectKey(e.target.value)}
                placeholder="kk_prod_xxxxxxxxxxxxxxxx"
                className="w-full border border-black/12 rounded-xl px-3 py-2.5 pr-10 text-[13px] font-mono outline-none focus:border-[#0D2461]/30"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">
              Konnect Secret Key
            </label>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                value={konnectSecret}
                onChange={(e) => setKonnectSecret(e.target.value)}
                placeholder="ks_prod_xxxxxxxxxxxxxxxx"
                className="w-full border border-black/12 rounded-xl px-3 py-2.5 pr-10 text-[13px] font-mono outline-none focus:border-[#0D2461]/30"
              />
              <button
                type="button"
                onClick={() => setShowSecret((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="bg-[#F7F6F2] rounded-xl p-4 text-[12px] text-gray-500">
            <p className="font-bold text-gray-700 mb-2">Pour activer Konnect :</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Créez un compte sur konnect.network</li>
              <li>Récupérez vos clés API dans les paramètres du compte</li>
              <li>Ajoutez <code className="bg-white px-1 rounded font-mono">KONNECT_API_KEY</code> et <code className="bg-white px-1 rounded font-mono">KONNECT_SECRET</code> dans les variables d&apos;environnement Vercel</li>
              <li>Redeployez l&apos;application</li>
            </ol>
          </div>

          <button
            type="submit"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
              saved
                ? "bg-green-500 text-white"
                : "bg-[#0D2461] text-white hover:bg-[#1a3a8a]"
            }`}
          >
            {saved ? <><Check size={14} /> Sauvegardé</> : "Sauvegarder"}
          </button>
        </form>
      </div>
    </div>
  );
}
