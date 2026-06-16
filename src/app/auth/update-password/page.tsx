"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Lock, Eye, EyeOff, Check } from "lucide-react";

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas"); return; }
    if (password.length < 8) { setError("Le mot de passe doit faire au moins 8 caractères"); return; }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); return; }
    setDone(true);
    setTimeout(() => router.push("/profil"), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center px-5">
      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/8">
          <div className="w-12 h-12 rounded-2xl bg-[#0D2461]/8 flex items-center justify-center mb-5">
            <Lock size={22} className="text-[#0D2461]" />
          </div>
          <h1 className="font-bebas text-[28px] tracking-wide text-[#0D2461] mb-1">Nouveau mot de passe</h1>
          <p className="text-[13px] text-gray-500 mb-6">Choisissez un nouveau mot de passe sécurisé.</p>

          {done ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={24} className="text-green-600" />
              </div>
              <p className="font-bold text-[15px] text-[#0D2461] mb-2">Mot de passe mis à jour !</p>
              <p className="text-[13px] text-gray-500">Redirection vers votre profil...</p>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-bold text-gray-500 mb-1.5 block">Nouveau mot de passe</label>
                <div className="relative">
                  <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="8 caractères minimum" required autoFocus
                    className="w-full border border-black/12 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#0D2461]/50 pr-10" />
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[12px] font-bold text-gray-500 mb-1.5 block">Confirmer le mot de passe</label>
                <input type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Répéter le mot de passe" required
                  className="w-full border border-black/12 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#0D2461]/50" />
              </div>
              {error && <p className="text-red-500 text-[12px] font-semibold">{error}</p>}
              <button type="submit" disabled={loading || !password || !confirm}
                className="w-full py-3 bg-[#0D2461] text-white font-bold rounded-xl hover:bg-[#1a3a8a] disabled:opacity-50 transition-all text-[14px]">
                {loading ? "Mise à jour..." : "Mettre à jour"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
