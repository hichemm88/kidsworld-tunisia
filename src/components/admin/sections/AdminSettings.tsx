"use client";

import { useState } from "react";
import { Settings, Palette, Globe, Bell, Shield, Database, Check } from "lucide-react";

const TABS = [
  { id: "branding", label: "Style & Branding", icon: <Palette size={14} /> },
  { id: "general", label: "Général", icon: <Globe size={14} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={14} /> },
  { id: "security", label: "Sécurité", icon: <Shield size={14} /> },
  { id: "system", label: "Système", icon: <Database size={14} /> },
];

export default function AdminSettings() {
  const [tab, setTab] = useState("branding");
  const [saved, setSaved] = useState(false);
  const [branding, setBranding] = useState({
    primaryColor: "#0D2461",
    accentColor: "#F26522",
    siteName: "KidsWorld Tunisia",
    tagline: "La référence des activités pour enfants en Tunisie",
    logoUrl: "",
    faviconUrl: "",
    fontHeading: "Bebas Neue",
    fontBody: "Inter",
  });

  const [general, setGeneral] = useState({
    siteUrl: "https://kidsworld-tunisia.vercel.app",
    defaultCity: "Tunis",
    contactEmail: "contact@kidsworld.tn",
    maxFreeListings: 1,
    requireEmailVerification: true,
    allowRegistration: true,
  });

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-black text-[28px] text-[#0D2461] leading-none">Paramètres</h1>
        <p className="text-gray-400 text-[13px] mt-1">Configuration de la plateforme</p>
      </div>

      <div className="flex gap-1 bg-white border border-black/8 rounded-2xl p-1.5 mb-5 w-fit flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all ${
              tab === t.id ? "bg-[#0D2461] text-white" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Branding */}
      {tab === "branding" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-black/8 p-5">
            <h2 className="font-bold text-[14px] text-[#0D2461] mb-4">Identité visuelle</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">Couleur principale</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => setBranding((b) => ({ ...b, primaryColor: e.target.value }))}
                    className="w-10 h-10 rounded-xl border border-black/12 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.primaryColor}
                    onChange={(e) => setBranding((b) => ({ ...b, primaryColor: e.target.value }))}
                    className="flex-1 border border-black/12 rounded-xl px-3 py-2 text-[13px] font-mono outline-none focus:border-[#0D2461]/30"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">Couleur d&apos;accent</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.accentColor}
                    onChange={(e) => setBranding((b) => ({ ...b, accentColor: e.target.value }))}
                    className="w-10 h-10 rounded-xl border border-black/12 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.accentColor}
                    onChange={(e) => setBranding((b) => ({ ...b, accentColor: e.target.value }))}
                    className="flex-1 border border-black/12 rounded-xl px-3 py-2 text-[13px] font-mono outline-none focus:border-[#0D2461]/30"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">Police titres</label>
                <select
                  value={branding.fontHeading}
                  onChange={(e) => setBranding((b) => ({ ...b, fontHeading: e.target.value }))}
                  className="w-full border border-black/12 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0D2461]/30 bg-white"
                >
                  <option>Bebas Neue</option>
                  <option>Montserrat</option>
                  <option>Poppins</option>
                  <option>Inter</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">Police corps</label>
                <select
                  value={branding.fontBody}
                  onChange={(e) => setBranding((b) => ({ ...b, fontBody: e.target.value }))}
                  className="w-full border border-black/12 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0D2461]/30 bg-white"
                >
                  <option>Inter</option>
                  <option>DM Sans</option>
                  <option>Nunito</option>
                  <option>Poppins</option>
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">URL du logo</label>
                <input
                  type="url"
                  value={branding.logoUrl}
                  onChange={(e) => setBranding((b) => ({ ...b, logoUrl: e.target.value }))}
                  placeholder="https://…/logo.svg"
                  className="w-full border border-black/12 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0D2461]/30"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">URL du favicon</label>
                <input
                  type="url"
                  value={branding.faviconUrl}
                  onChange={(e) => setBranding((b) => ({ ...b, faviconUrl: e.target.value }))}
                  placeholder="https://…/favicon.ico"
                  className="w-full border border-black/12 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0D2461]/30"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="mt-5 rounded-xl p-4 border border-dashed border-black/12">
              <p className="text-[11px] font-bold text-gray-400 uppercase mb-3">Aperçu</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: branding.primaryColor }}>
                  <span className="text-white text-[18px] font-black">K</span>
                </div>
                <div>
                  <p className="font-black text-[18px] leading-none" style={{ color: branding.primaryColor, fontFamily: branding.fontHeading }}>
                    {branding.siteName}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: branding.accentColor }}>{branding.tagline}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="px-4 py-1.5 rounded-lg text-white text-[12px] font-bold" style={{ background: branding.primaryColor }}>
                  Bouton principal
                </button>
                <button className="px-4 py-1.5 rounded-lg text-white text-[12px] font-bold" style={{ background: branding.accentColor }}>
                  Bouton accent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* General */}
      {tab === "general" && (
        <div className="bg-white rounded-2xl border border-black/8 p-5">
          <h2 className="font-bold text-[14px] text-[#0D2461] mb-4">Paramètres généraux</h2>
          <div className="space-y-4">
            {[
              { label: "Nom du site", key: "siteName", value: (branding as any).siteName },
              { label: "URL du site", key: "siteUrl", value: general.siteUrl },
              { label: "Email de contact", key: "contactEmail", value: general.contactEmail },
              { label: "Ville par défaut", key: "defaultCity", value: general.defaultCity },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">{f.label}</label>
                <input
                  type="text"
                  defaultValue={f.value}
                  className="w-full border border-black/12 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0D2461]/30"
                />
              </div>
            ))}
            <div className="flex items-center justify-between py-2 border-t border-black/6">
              <div>
                <p className="text-[13px] font-semibold text-gray-700">Autoriser les inscriptions</p>
                <p className="text-[11px] text-gray-400">Désactiver pour mettre la plateforme en mode privé</p>
              </div>
              <button
                onClick={() => setGeneral((g) => ({ ...g, allowRegistration: !g.allowRegistration }))}
                className={`w-11 h-6 rounded-full transition-all relative ${general.allowRegistration ? "bg-[#0D2461]" : "bg-gray-200"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${general.allowRegistration ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-black/6">
              <div>
                <p className="text-[13px] font-semibold text-gray-700">Vérification email obligatoire</p>
                <p className="text-[11px] text-gray-400">Les nouveaux comptes doivent confirmer leur email</p>
              </div>
              <button
                onClick={() => setGeneral((g) => ({ ...g, requireEmailVerification: !g.requireEmailVerification }))}
                className={`w-11 h-6 rounded-full transition-all relative ${general.requireEmailVerification ? "bg-[#0D2461]" : "bg-gray-200"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${general.requireEmailVerification ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {(tab === "notifications" || tab === "security" || tab === "system") && (
        <div className="bg-white rounded-2xl border border-black/8 p-10 text-center">
          <Settings size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-[14px] font-bold text-gray-400">Section en développement</p>
          <p className="text-[12px] text-gray-300 mt-1">Disponible dans une prochaine mise à jour</p>
        </div>
      )}

      {/* Save button */}
      <div className="mt-5">
        <button
          onClick={save}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
            saved ? "bg-green-500 text-white" : "bg-[#0D2461] text-white hover:bg-[#1a3a8a]"
          }`}
        >
          {saved ? <><Check size={14} /> Sauvegardé</> : "Sauvegarder les paramètres"}
        </button>
      </div>
    </div>
  );
}
