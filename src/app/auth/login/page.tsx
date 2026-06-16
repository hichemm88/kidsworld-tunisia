"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      const role = profile?.role;
      if (role === "admin") router.push("/admin");
      else if (role === "pro") router.push("/dashboard");
      else router.push("/profil");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      {/* Header */}
      <div className="bg-[#071640] px-5 py-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[11px] font-extrabold text-[#0D2461] italic">
            K<span className="text-[#F26522]">W</span>
          </div>
          <span className="font-bebas text-[16px] tracking-[2px] text-white">KidsWorld</span>
        </Link>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <h1 className="font-bebas text-[32px] tracking-wide text-[#0D2461] mb-1">Connexion</h1>
            <p className="text-[14px] text-gray-500">Accédez à votre espace KidsWorld</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] font-semibold px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="votre@email.com"
                    className="w-full pl-9 pr-4 py-3 border border-black/15 rounded-xl text-[14px] font-nunito outline-none focus:border-[#0D2461] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Mot de passe</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-3 border border-black/15 rounded-xl text-[14px] font-nunito outline-none focus:border-[#0D2461] transition-colors"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0D2461] text-white font-extrabold text-[14px] py-3.5 rounded-xl hover:bg-[#1A3A8F] transition-colors disabled:opacity-60 mt-1"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>

            <div className="mt-4 flex flex-col items-center gap-2">
              <Link href="/auth/reset" className="text-[12px] text-gray-400 hover:text-[#0D2461] transition-colors">
                Mot de passe oublié ?
              </Link>
              <p className="text-[13px] text-gray-500">
                Pas encore de compte ?{" "}
                <Link href="/auth/signup" className="text-[#F26522] font-bold hover:underline">S'inscrire</Link>
              </p>
            </div>
          </div>

          {/* Accès pro */}
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <p className="text-[13px] font-bold text-amber-800 mb-1">Vous êtes un professionnel ?</p>
            <p className="text-[12px] text-amber-700 mb-3">Inscrivez votre établissement gratuitement</p>
            <Link href="/auth/signup?role=pro" className="inline-block bg-[#F26522] text-white text-[12px] font-bold px-4 py-2 rounded-xl hover:bg-[#FF8C4B] transition-colors">
              Inscrire mon établissement →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
