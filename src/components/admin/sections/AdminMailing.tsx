"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import {
  Mail, Users, Briefcase, Send, Loader2,
  CheckCircle2, AlertCircle, Search, RefreshCw,
  ChevronDown, ChevronUp,
} from "lucide-react";

type Segment = "all" | "parents" | "pros" | "custom";

interface UserRow {
  id: string;
  nom: string | null;
  prenom: string | null;
  email: string | null;
  role: string;
  selected: boolean;
}

export default function AdminMailing() {
  const supabase = createClient();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState<Segment>("all");
  const [showList, setShowList] = useState(false);

  // Email form
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, nom, prenom, email, role")
        .order("created_at", { ascending: false });
      setUsers((data || []).map((u) => ({ ...u, selected: true })));
      setLoading(false);
    })();
  }, []);

  const filtered = users.filter((u) => {
    if (segment === "parents" && u.role !== "parent") return false;
    if (segment === "pros" && u.role !== "pro") return false;
    if (search) {
      const q = search.toLowerCase();
      const name = `${u.nom || ""} ${u.prenom || ""}`.toLowerCase();
      return name.includes(q) || u.email?.toLowerCase().includes(q);
    }
    return true;
  });

  const selectedCount = filtered.filter((u) => u.selected).length;
  const toggleUser = (id: string) =>
    setUsers((us) => us.map((u) => u.id === id ? { ...u, selected: !u.selected } : u));
  const toggleAll = () => {
    const allSelected = filtered.every((u) => u.selected);
    setUsers((us) =>
      us.map((u) => filtered.find((f) => f.id === u.id) ? { ...u, selected: !allSelected } : u)
    );
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !body) return;

    const recipients = filtered.filter((u) => u.selected && u.email);
    if (recipients.length === 0) {
      setResult({ ok: false, message: "Aucun destinataire sélectionné avec un email valide." });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipients.map((u) => ({
            email: u.email,
            name: `${u.prenom || ""} ${u.nom || ""}`.trim() || u.email,
          })),
          subject,
          html: body.replace(/\n/g, "<br>"),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, message: `Email envoyé à ${recipients.length} destinataire(s) avec succès.` });
        setSubject("");
        setBody("");
      } else {
        setResult({ ok: false, message: data.error || "Erreur lors de l'envoi." });
      }
    } catch {
      setResult({ ok: false, message: "Erreur réseau." });
    } finally {
      setSending(false);
    }
  };

  const SEGMENTS: { id: Segment; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "all", label: "Tous", icon: <Users size={14} />, count: users.length },
    { id: "parents", label: "Parents", icon: <Users size={14} />, count: users.filter((u) => u.role === "parent").length },
    { id: "pros", label: "Pros", icon: <Briefcase size={14} />, count: users.filter((u) => u.role === "pro").length },
    { id: "custom", label: "Personnalisé", icon: <Search size={14} />, count: filtered.filter((u) => u.selected).length },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-[28px] text-[#0D2461] leading-none">Mailing</h1>
          <p className="text-gray-400 text-[13px] mt-1">
            {users.length} utilisateurs · {users.filter((u) => u.email).length} avec email
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-black/8 rounded-xl text-[13px] font-semibold text-gray-500 hover:text-[#0D2461] transition-all"
        >
          <RefreshCw size={13} /> Actualiser
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Left — recipients */}
        <div className="lg:col-span-2 space-y-4">
          {/* Segment selector */}
          <div className="bg-white rounded-2xl border border-black/8 p-4">
            <p className="text-[11px] font-bold text-gray-500 uppercase mb-3">Segment</p>
            <div className="grid grid-cols-2 gap-2">
              {SEGMENTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSegment(s.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-all border ${
                    segment === s.id
                      ? "border-[#0D2461] bg-[#0D2461]/5 text-[#0D2461]"
                      : "border-black/8 text-gray-500 hover:border-[#0D2461]/20"
                  }`}
                >
                  {s.icon}
                  <span className="flex-1 text-left">{s.label}</span>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${segment === s.id ? "bg-[#0D2461] text-white" : "bg-gray-100 text-gray-500"}`}>
                    {s.id === "custom" ? selectedCount : s.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* User list */}
          <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
            <button
              onClick={() => setShowList((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 border-b border-black/6 hover:bg-[#F7F6F2] transition-colors"
            >
              <span className="text-[13px] font-bold text-[#0D2461]">
                {selectedCount} destinataire{selectedCount > 1 ? "s" : ""} sélectionné{selectedCount > 1 ? "s" : ""}
              </span>
              {showList ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>

            {showList && (
              <>
                <div className="px-3 py-2 border-b border-black/5">
                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Filtrer…"
                      className="w-full pl-7 pr-3 py-1.5 text-[12px] border border-black/8 rounded-lg outline-none focus:border-[#0D2461]/30"
                    />
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 size={16} className="animate-spin text-[#0D2461]" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-black/5">
                        <input
                          type="checkbox"
                          checked={filtered.every((u) => u.selected)}
                          onChange={toggleAll}
                          className="w-3.5 h-3.5 accent-[#0D2461]"
                        />
                        <span className="text-[11px] font-bold text-gray-500 uppercase">Tout sélectionner</span>
                      </div>
                      {filtered.map((u) => (
                        <label
                          key={u.id}
                          className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#F7F6F2] cursor-pointer transition-colors border-b border-black/4 last:border-0"
                        >
                          <input
                            type="checkbox"
                            checked={u.selected}
                            onChange={() => toggleUser(u.id)}
                            className="w-3.5 h-3.5 accent-[#0D2461] shrink-0"
                          />
                          <div className="w-6 h-6 rounded-full bg-[#0D2461]/10 flex items-center justify-center text-[#0D2461] text-[10px] font-bold shrink-0">
                            {((u.prenom || u.email || "?")[0]).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-[#0D2461] truncate">
                              {u.prenom && u.nom ? `${u.prenom} ${u.nom}` : u.email || "Sans nom"}
                            </p>
                            {u.email && <p className="text-[10px] text-gray-400 truncate">{u.email}</p>}
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                            u.role === "pro" ? "bg-[#0891B2]/10 text-[#0891B2]" : "bg-[#7C3AED]/10 text-[#7C3AED]"
                          }`}>
                            {u.role}
                          </span>
                        </label>
                      ))}
                      {filtered.length === 0 && (
                        <p className="text-[12px] text-gray-400 text-center py-6">Aucun utilisateur</p>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right — composer */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-black/8 p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-[#0D2461]/8 flex items-center justify-center">
                <Mail size={16} className="text-[#0D2461]" />
              </div>
              <h2 className="font-bold text-[15px] text-[#0D2461]">Composer un email</h2>
            </div>

            <form onSubmit={handleSend} className="space-y-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-[#F7F6F2] rounded-xl text-[12px] text-gray-600">
                <Users size={12} className="text-[#0D2461]" />
                <span>
                  À : <strong className="text-[#0D2461]">{selectedCount} destinataire{selectedCount > 1 ? "s" : ""}</strong>
                  {segment !== "custom" && ` (${SEGMENTS.find((s) => s.id === segment)?.label})`}
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">Objet</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Découvrez les nouveautés KidsWorld Tunisia !"
                  required
                  className="w-full border border-black/12 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#0D2461]/30"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">Corps du message</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={`Bonjour,\n\nNous sommes heureux de vous annoncer...\n\nL'équipe KidsWorld Tunisia`}
                  required
                  rows={10}
                  className="w-full border border-black/12 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#0D2461]/30 resize-none font-mono"
                />
                <p className="text-[10px] text-gray-400 mt-1">Vous pouvez utiliser du HTML. Les retours à la ligne sont automatiquement convertis en &lt;br&gt;.</p>
              </div>

              {result && (
                <div className={`flex items-start gap-2 p-3 rounded-xl text-[12px] ${
                  result.ok ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
                }`}>
                  {result.ok ? <CheckCircle2 size={14} className="shrink-0 mt-0.5" /> : <AlertCircle size={14} className="shrink-0 mt-0.5" />}
                  {result.message}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={sending || selectedCount === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0D2461] text-white rounded-xl text-[13px] font-bold hover:bg-[#1a3a8a] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {sending ? "Envoi en cours…" : `Envoyer à ${selectedCount} destinataire${selectedCount > 1 ? "s" : ""}`}
                </button>
                <button
                  type="button"
                  onClick={() => { setSubject(""); setBody(""); setResult(null); }}
                  className="px-4 py-2.5 bg-[#F7F6F2] text-gray-500 rounded-xl text-[13px] font-semibold hover:bv-gray-200 transition-all"
                >
                  Effacer
                </button>
              </div>
            </form>
          </div>

          {/* Setup instructions */}
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="font-bold text-[13px] text-amber-800 mb-2">⚙️ Configuration requise — Resend</p>
            <p className="text-[12px] text-amber-700 mb-3">
              Pour activer l&apos;envoi d&apos;emails, connectez <strong>Resend</strong> (gratuit jusqu&apos;à 3000 emails/mois) :
            </p>
            <ol className="text-[12px] text-amber-700 space-y-1 list-decimal list-inside">
              <li>Créez un compte sur <a href="https://resend.com" target="_blank" className="underline">resend.com</a></li>
              <li>Créez une clé API et ajoutez <code className="bg-amber-100 px-1 rounded font-mono">RESEND_API_KEY=re_xxx</code> dans Vercel → Settings → Environment Variables</li>
              <li>Ajoutez votre domaine d&apos;envoi dans Resend (ou utilisez <code className="bg-amber-100 px-1 rounded font-mono">onboarding@resend.dev</code> pour les tests)</li>
              <li>Redeployez sur Vercel</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
