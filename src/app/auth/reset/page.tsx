"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { Mail, ArrowLeft, Check } from "lucide-react";

export default function ResetPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center px-5">
      <div className="w-full max-w-[400px]">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-[#0D2461] mb-8 transition-colors">
          <ArrowLeft size={15} /> Retour à la connexion
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/8">
          <div className="w-12 h-12 rounded-2xl bg-[#0D2461]/8 flex items-center justify-center mb-5">
            <Mail size={22} className="text-[#0D2461]" />
          </div>
          <h1 className="font-bebas text-[28px] tracking-wide text-[#0D2461] mb-1">Mot de passe oublié</h1>
          <p className="text-[13px] text-gray-500 mb-6">
            Entrez votre email et nous vous enverrons un lien de réinitialisation.
          </p>

          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={24} className="text-green-600" />
              </div>
              <p className="font-bold text-[15px] text-[#0D2461] mb-2">Email envoyé !</p>
              <p className="text-[13px] text-gray-500">
                Consultez votre boîte mail et cliquez sur le lien de réinitialisation.
              </p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-bold text-gray-500 mb-1.5 block">Adresse email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com" required autoFocus
                  className="w-full border border-black/12 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#0D2461]/50 transition-colors" />
              </div>
              {error && <p className="text-red-500 text-[12px] font-semibold">{error}</p>}
              <button type="submit" disabled={loading || !email.trim()}
                className="w-full py-3 bg-[#0D2461] text-white font-bold rounded-xl hover:bg-[#1a3a8a] disabled:opacity-50 transition-all text-[14px]">
                {loading ? "Envoi en cours..." : "Envoyer le lien"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
