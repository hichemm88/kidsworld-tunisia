"use client";

import { useState, useRef } from "react";
import { Settings, Palette, Globe, Bell, Shield, Database, Check, Upload, X, Image, Key, RefreshCw, Download, AlertTriangle, LogOut, Monitor, Smartphone, Trash2 } from "lucide-react";

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
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoDragOver, setLogoDragOver] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoFile = (file: File) => {
    if (!file) return;
    const allowed = ["image/png", "image/svg+xml", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type)) return;
    if (file.size > 1024 * 1024) { alert("Logo trop lourd — max 1 MB"); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLogoPreview(result);
      setBranding((b) => ({ ...b, logoUrl: result }));
    };
    reader.readAsDataURL(file);
  };

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

  const [notifs, setNotifs] = useState({
    newListing: true,
    newUser: true,
    paymentReceived: true,
    contactMessage: false,
    weeklyReport: true,
    alertEmail: "hichemmathlouthi@gmail.com",
    frequency: "immediate",
  });

  const [security, setSecurity] = useState({
    sessionTimeout: "4h",
    maxLoginAttempts: 5,
    twoFactorEnabled: false,
  });
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  const [system, setSystem] = useState({
    maintenanceMode: false,
    cacheCleared: false,
  });

  const handlePasswordSave = () => {
    if (!pwForm.current || !pwForm.next) { setPwError("Tous les champs sont requis"); return; }
    if (pwForm.next.length < 8) { setPwError("Min 8 caractères"); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError("Les mots de passe ne correspondent pas"); return; }
    setPwError("");
    setPwSaved(true);
    setPwForm({ current: "", next: "", confirm: "" });
    setTimeout(() => setPwSaved(false), 3000);
  };

  const clearCache = () => {
    setSystem((s) => ({ ...s, cacheCleared: true }));
    setTimeout(() => setSystem((s) => ({ ...s, cacheCleared: false })), 3000);
  };

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
              {/* Logo upload */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">Logo</label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept=".png,.svg,.jpg,.jpeg,.webp,image/png,image/svg+xml,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoFile(f); }}
                />
                {logoPreview ? (
                  <div className="border border-black/12 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-32 h-12 rounded-lg border border-black/8 bg-[#F7F6F2] flex items-center justify-center overflow-hidden shrink-0">
                      <img src={logoPreview} alt="logo" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] font-semibold text-[#0D2461]">Logo chargé</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Aperçu ci-dessous dans la section preview</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3 py-1.5 bg-[#F7F6F2] text-[#0D2461] rounded-lg text-[11px] font-bold hover:bg-[#0D2461]/10 transition-all"
                      >
                        Changer
                      </button>
                      <button
                        onClick={() => { setLogoPreview(null); setBranding((b) => ({ ...b, logoUrl: "" })); if (logoInputRef.current) logoInputRef.current.value = ""; }}
                        className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => logoInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setLogoDragOver(true); }}
                    onDragLeave={() => setLogoDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setLogoDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleLogoFile(f); }}
                    className={`border-2 border-dashed rounded-xl px-4 py-5 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                      logoDragOver ? "border-[#0D2461] bg-[#0D2461]/5" : "border-black/12 hover:border-[#0D2461]/40 hover:bg-[#F7F6F2]"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#0D2461]/8 flex items-center justify-center">
                      <Upload size={18} className="text-[#0D2461]" />
                    </div>
                    <div className="text-center">
                      <p className="text-[13px] font-semibold text-[#0D2461]">Cliquez ou glissez votre logo ici</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">PNG · SVG · JPG · WebP — max 1 MB</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 px-3 py-1.5 bg-[#F7F6F2] rounded-lg">
                      <Image size={11} className="text-gray-400" />
                      <p className="text-[10px] text-gray-500 font-mono">
                        Taille idéale : <strong className="text-[#0D2461]">400 × 100 px</strong> — ratio 4:1, fond transparent de préférence
                      </p>
                    </div>
                  </div>
                )}
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
                <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: logoPreview ? "transparent" : branding.primaryColor }}>
                  {logoPreview
                    ? <img src={logoPreview} alt="logo" className="max-w-full max-h-full object-contain" />
                    : <span className="text-white text-[18px] font-black">K</span>
                  }
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

      {/* Notifications */}
      {tab === "notifications" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-black/8 p-5">
            <h2 className="font-bold text-[14px] text-[#0D2461] mb-4">Alertes email</h2>
            <div className="space-y-3">
              {[
                { key: "newListing", label: "Nouveau listing soumis", desc: "Quand un professionnel soumet une fiche" },
                { key: "newUser", label: "Nouvelle inscription", desc: "Quand un parent crée un compte" },
                { key: "paymentReceived", label: "Paiement reçu", desc: "Confirmation de paiement premium" },
                { key: "contactMessage", label: "Message de contact", desc: "Via le formulaire du site" },
                { key: "weeklyReport", label: "Rapport hebdomadaire", desc: "Récapitulatif activité chaque lundi" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2.5 border-b border-black/5 last:border-0">
                  <div>
                    <p className="text-[13px] font-semibold text-gray-700">{item.label}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifs((n) => ({ ...n, [item.key]: !n[item.key as keyof typeof n] }))}
                    className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${(notifs as any)[item.key] ? "bg-[#0D2461]" : "bg-gray-200"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${(notifs as any)[item.key] ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-black/8 p-5">
            <h2 className="font-bold text-[14px] text-[#0D2461] mb-4">Destination & fréquence</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">Email de destination</label>
                <input
                  type="email"
                  value={notifs.alertEmail}
                  onChange={(e) => setNotifs((n) => ({ ...n, alertEmail: e.target.value }))}
                  className="w-full border border-black/12 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0D2461]/30"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">Fréquence des rapports</label>
                <select
                  value={notifs.frequency}
                  onChange={(e) => setNotifs((n) => ({ ...n, frequency: e.target.value }))}
                  className="w-full border border-black/12 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0D2461]/30 bg-white"
                >
                  <option value="immediate">Immédiat (dès l&apos;événement)</option>
                  <option value="daily">Résumé quotidien</option>
                  <option value="weekly">Résumé hebdomadaire</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security */}
      {tab === "security" && (
        <div className="space-y-4">
          {/* Password change */}
          <div className="bg-white rounded-2xl border border-black/8 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Key size={14} className="text-[#0D2461]" />
              <h2 className="font-bold text-[14px] text-[#0D2461]">Changer le mot de passe</h2>
            </div>
            <div className="space-y-3 max-w-sm">
              {[
                { key: "current", label: "Mot de passe actuel", placeholder: "••••••••" },
                { key: "next", label: "Nouveau mot de passe", placeholder: "Min. 8 caractères" },
                { key: "confirm", label: "Confirmer le nouveau", placeholder: "••••••••" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">{f.label}</label>
                  <input
                    type="password"
                    value={(pwForm as any)[f.key]}
                    onChange={(e) => setPwForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-black/12 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0D2461]/30"
                  />
                </div>
              ))}
              {pwError && <p className="text-[12px] text-red-500 font-medium">{pwError}</p>}
              <button
                onClick={handlePasswordSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all ${pwSaved ? "bg-green-500 text-white" : "bg-[#0D2461] text-white hover:bg-[#1a3a8a]"}`}
              >
                {pwSaved ? <><Check size={13} /> Mot de passe mis à jour</> : "Mettre à jour"}
              </button>
            </div>
          </div>

          {/* Session & access */}
          <div className="bg-white rounded-2xl border border-black/8 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={14} className="text-[#0D2461]" />
              <h2 className="font-bold text-[14px] text-[#0D2461]">Accès & sessions</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">Expiration de session</label>
                  <select
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity((s) => ({ ...s, sessionTimeout: e.target.value }))}
                    className="w-full border border-black/12 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0D2461]/30 bg-white"
                  >
                    <option value="30m">30 minutes</option>
                    <option value="1h">1 heure</option>
                    <option value="4h">4 heures</option>
                    <option value="24h">24 heures</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">Tentatives max avant blocage</label>
                  <input
                    type="number"
                    min={3} max={10}
                    value={security.maxLoginAttempts}
                    onChange={(e) => setSecurity((s) => ({ ...s, maxLoginAttempts: Number(e.target.value) }))}
                    className="w-full border border-black/12 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0D2461]/30"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-black/6">
                <div>
                  <p className="text-[13px] font-semibold text-gray-700">Authentification à 2 facteurs</p>
                  <p className="text-[11px] text-gray-400">Vérification par email à chaque connexion</p>
                </div>
                <button
                  onClick={() => setSecurity((s) => ({ ...s, twoFactorEnabled: !s.twoFactorEnabled }))}
                  className={`w-11 h-6 rounded-full transition-all relative ${security.twoFactorEnabled ? "bg-[#0D2461]" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${security.twoFactorEnabled ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Active sessions */}
          <div className="bg-white rounded-2xl border border-black/8 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Monitor size={14} className="text-[#0D2461]" />
              <h2 className="font-bold text-[14px] text-[#0D2461]">Sessions actives</h2>
            </div>
            <div className="space-y-2">
              {[
                { device: "Chrome · Windows", location: "Tunis, TN", time: "Maintenant", icon: Monitor, current: true },
                { device: "Safari · iPhone", location: "Tunis, TN", time: "Il y a 2h", icon: Smartphone, current: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-black/8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F7F6F2] flex items-center justify-center">
                      <s.icon size={14} className="text-[#0D2461]" />
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-gray-700">{s.device}</p>
                      <p className="text-[11px] text-gray-400">{s.location} · {s.time}</p>
                    </div>
                  </div>
                  {s.current
                    ? <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">Cette session</span>
                    : <button className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-all"><LogOut size={11} /></button>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* System */}
      {tab === "system" && (
        <div className="space-y-4">
          {/* Maintenance */}
          <div className="bg-white rounded-2xl border border-black/8 p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={14} className="text-[#0D2461]" />
              <h2 className="font-bold text-[14px] text-[#0D2461]">Maintenance</h2>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-[13px] font-semibold text-gray-700">Mode maintenance</p>
                <p className="text-[11px] text-gray-400">Le site affiche une page de maintenance aux visiteurs</p>
              </div>
              <button
                onClick={() => setSystem((s) => ({ ...s, maintenanceMode: !s.maintenanceMode }))}
                className={`w-11 h-6 rounded-full transition-all relative ${system.maintenanceMode ? "bg-red-500" : "bg-gray-200"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${system.maintenanceMode ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
            {system.maintenanceMode && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2.5 bg-orange-50 border border-orange-200 rounded-xl">
                <AlertTriangle size={13} className="text-orange-500 shrink-0" />
                <p className="text-[12px] text-orange-700 font-medium">Le site est actuellement inaccessible aux visiteurs</p>
              </div>
            )}
          </div>

          {/* Cache & performance */}
          <div className="bg-white rounded-2xl border border-black/8 p-5">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw size={14} className="text-[#0D2461]" />
              <h2 className="font-bold text-[14px] text-[#0D2461]">Cache & performance</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-gray-700">Vider le cache applicatif</p>
                <p className="text-[11px] text-gray-400">Force le rechargement des données depuis la base</p>
              </div>
              <button
                onClick={clearCache}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition-all ${system.cacheCleared ? "bg-green-500 text-white" : "bg-[#F7F6F2] text-[#0D2461] hover:bg-[#0D2461]/10"}`}
              >
                {system.cacheCleared ? <><Check size={12} /> Vidé</> : <><RefreshCw size={12} /> Vider le cache</>}
              </button>
            </div>
          </div>

          {/* Data export */}
          <div className="bg-white rounded-2xl border border-black/8 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Download size={14} className="text-[#0D2461]" />
              <h2 className="font-bold text-[14px] text-[#0D2461]">Export des données</h2>
            </div>
            <div className="space-y-2">
              {[
                { label: "Exporter tous les listings", desc: "CSV avec toutes les fiches professionnelles" },
                { label: "Exporter les utilisateurs", desc: "CSV des comptes parents inscrits" },
                { label: "Exporter les transactions", desc: "CSV des paiements premium" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-black/8">
                  <div>
                    <p className="text-[12px] font-semibold text-gray-700">{item.label}</p>
                    <p className="text-[11px] text-gray-400">{item.desc}</p>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F6F2] text-[#0D2461] rounded-lg text-[11px] font-bold hover:bg-[#0D2461]/10 transition-all">
                    <Download size={11} /> CSV
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* System info */}
          <div className="bg-white rounded-2xl border border-black/8 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Database size={14} className="text-[#0D2461]" />
              <h2 className="font-bold text-[14px] text-[#0D2461]">Informations système</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Version app", value: "1.0.0" },
                { label: "Framework", value: "Next.js 14" },
                { label: "Base de données", value: "Supabase (PostgreSQL)" },
                { label: "Hébergement", value: "Vercel" },
                { label: "Emails", value: "Resend" },
                { label: "Déploiement", value: "Auto (GitHub → Vercel)" },
              ].map((info, i) => (
                <div key={i} className="px-3 py-2.5 rounded-xl bg-[#F7F6F2]">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{info.label}</p>
                  <p className="text-[12px] font-semibold text-[#0D2461] mt-0.5 font-mono">{info.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-white rounded-2xl border border-red-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trash2 size={14} className="text-red-500" />
              <h2 className="font-bold text-[14px] text-red-500">Zone de danger</h2>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-red-100 bg-red-50/50">
                <div>
                  <p className="text-[12px] font-semibold text-red-700">Supprimer les listings inactifs</p>
                  <p className="text-[11px] text-red-400">Efface définitivement tous les listings désactivés</p>
                </div>
                <button className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-[11px] font-bold hover:bg-red-200 transition-all">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
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
