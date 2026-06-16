"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "pro" ? "pro" : "parent";

  const supabase = createClient();
  const [role, setRole] = useState<"parent" | "pro">(defaultRole as "parent" | "pro");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nom, role },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Créer le profil
      if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          nom,
          role,
        });
      }
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">📧</div>
        <h2 className="font-bebas text-[24px] text-[#0D2461] mb-2">Vérifiez votre email</h2>
        <p className="text-[14px] text-gray-500 leading-relaxed">
          Un email de confirmation a été envoyé à <strong>{email}</strong>.<br />
          Cliquez sur le lien pour activer votre compte.
        </p>
        <Link href="/auth/login" className="inline-block mt-6 text-[#F26522] font-bold text-[14px] hover:underline">
          Retour à la connexion →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="font-bebas text-[32px] tracking-wide text-[#0D2461] mb-1">Créer un compte</h1>
        <p className="text-[14px] text-gray-500">Rejoignez la communauté KidsWorld</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/8">
        {/* Toggle Parent / Pro */}
        <div className="flex bg-[#F7F6F2] rounded-xl p-1 mb-5">
          {(["parent", "pro"] as const).map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 text-[13px] font-bold py-2 rounded-lg transition-all ${role === r ? "bg-white shadow-sm text-[#0D2461]" : "text-gray-400"}`}
            >
              {r === "parent" ? "👨‍👩‍👧 Je suis parent" : "🏢 Je suis professionnel"}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] font-semibold px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
              {role === "pro" ? "Nom de l'établissement" : "Prénom et nom"}
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={nom}
                onChange={e => setNom(e.target.value)}
                required
                placeholder={role === "pro" ? "JumPark Tunis" : "Hichem Mathlouthi"}
                className="w-full pl-9 pr-4 py-3 border border-black/15 rounded-xl text-[14px] font-nunito outline-none focus:border-[#0D2461] transition-colors"
              />
            </div>
          </div>

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
                minLength={6}
                placeholder="Minimum 6 caractères"
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
            className="w-full bg-[#F26522] text-white font-extrabold text-[14px] py-3.5 rounded-xl hover:bg-[#FF8C4B] transition-colors disabled:opacity-60 mt-1"
          >
            {loading ? "Création..." : role === "pro" ? "Inscrire mon établissement" : "Créer mon compte"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-[13px] text-gray-500">
            Déjà inscrit ?{" "}
            <Link href="/auth/login" className="text-[#F26522] font-bold hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      <div className="bg-[#071640] px-5 py-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[11px] font-extrabold text-[#0D2461] italic">
            K<span className="text-[#F26522]">W</span>
          </div>
          <span className="font-bebas text-[16px] tracking-[2px] text-white">KidsWorld</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[400px]">
          <Suspense>
            <SignupForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
