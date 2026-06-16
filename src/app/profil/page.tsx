"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import Navbar from "@/components/layout/Navbar";
import {
  Heart, Star, History, Baby, Plus, Edit2, Trash2, LogOut,
  X, Save, ChevronRight, Clock, MapPin
} from "lucide-react";

interface Child {
  id: string;
  surnom: string;
  date_naissance: string;
  sexe: "garçon" | "fille" | "autre";
}

interface Favori {
  id: string;
  listing: {
    slug: string;
    nom: string;
    category_emoji: string;
    ville: string;
    note_moyenne: number;
  };
}

function calculateAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
  if (months < 12) return `${months} mois`;
  const years = Math.floor(months / 12);
  return `${years} an${years > 1 ? "s" : ""}`;
}

const SEXE_EMOJI: Record<string, string> = { "garçon": "👦", "fille": "👧", "autre": "🧒" };
const TABS = [
  { id: "enfants", label: "Mes enfants", icon: <Baby size={16} /> },
  { id: "favoris", label: "Favoris", icon: <Heart size={16} /> },
  { id: "avis", label: "Mes avis", icon: <Star size={16} /> },
  { id: "historique", label: "Historique", icon: <History size={16} /> },
];

export default function ProfilPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [tab, setTab] = useState("enfants");
  const [children, setChildren] = useState<Child[]>([]);
  const [favoris, setFavoris] = useState<Favori[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [form, setForm] = useState({ surnom: "", date_naissance: "", sexe: "garçon" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUser(user);

      const [profileRes, childrenRes, favorisRes, reviewsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("children").select("*").eq("user_id", user.id).order("date_naissance"),
        supabase.from("favorites").select("id, listing:listings(slug, nom, category_emoji, ville, note_moyenne)").eq("user_id", user.id).limit(20),
        supabase.from("reviews").select("*, listing:listings(nom, slug, category_emoji)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      ]);

      setProfile(profileRes.data);
      setChildren((childrenRes.data || []) as Child[]);
      setFavoris((favorisRes.data || []) as any);
      setReviews(reviewsRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const openModal = (child?: Child) => {
    if (child) {
      setEditingChild(child);
      setForm({ surnom: child.surnom, date_naissance: child.date_naissance, sexe: child.sexe });
    } else {
      setEditingChild(null);
      setForm({ surnom: "", date_naissance: "", sexe: "garçon" });
    }
    setModalOpen(true);
  };

  const saveChild = async () => {
    if (!form.surnom.trim() || !form.date_naissance) return;
    setSaving(true);
    try {
      if (editingChild) {
        const { data } = await supabase
          .from("children")
          .update({ surnom: form.surnom, date_naissance: form.date_naissance, sexe: form.sexe })
          .eq("id", editingChild.id)
          .select()
          .single();
        if (data) setChildren((c) => c.map((ch) => ch.id === editingChild.id ? data as Child : ch));
      } else {
        const { data } = await supabase
          .from("children")
          .insert({ user_id: user.id, surnom: form.surnom, date_naissance: form.date_naissance, sexe: form.sexe })
          .select()
          .single();
        if (data) setChildren((c) => [...c, data as Child]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const deleteChild = async (id: string) => {
    if (!confirm("Supprimer cet enfant ?")) return;
    await supabase.from("children").delete().eq("id", id);
    setChildren((c) => c.filter((ch) => ch.id !== id));
  };

  const removeFavori = async (id: string) => {
    await supabase.from("favorites").delete().eq("id", id);
    setFavoris((f) => f.filter((fav) => fav.id !== id));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-[#F7F6F2]">
          <div className="w-10 h-10 rounded-full border-4 border-[#0D2461] border-t-transparent animate-spin" />
        </div>
      </>
    );
  }

  const initiale = (user?.email?.[0] || "U").toUpperCase();
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Parent";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F7F6F2]">

        {/* Header */}
        <div className="bg-[#0D2461] px-5 pt-8 pb-20">
          <div className="max-w-[640px] mx-auto text-center">
            <div className="w-16 h-16 bg-[#F26522] rounded-full flex items-center justify-center text-2xl font-extrabold text-white mx-auto mb-3">
              {initiale}
            </div>
            <h1 className="font-bebas text-[26px] tracking-wide text-white mb-1">{displayName}</h1>
            <p className="text-[13px] text-white/50">{user?.email}</p>
            <div className="flex items-center justify-center gap-6 mt-5">
              <div className="text-center">
                <p className="font-bebas text-[24px] text-white">{children.length}</p>
                <p className="text-[10px] text-white/40">Enfants</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="font-bebas text-[24px] text-white">{favoris.length}</p>
                <p className="text-[10px] text-white/40">Favoris</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="font-bebas text-[24px] text-white">{reviews.length}</p>
                <p className="text-[10px] text-white/40">Avis</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[640px] mx-auto px-5 -mt-12">

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-black/8 p-1.5 flex gap-1 mb-6">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-bold transition-all ${
                  tab === t.id ? "bg-[#0D2461] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
                }`}>
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Mes enfants */}
          {tab === "enfants" && (
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[16px] text-[#0D2461]">Mes enfants ({children.length})</h2>
                <button onClick={() => openModal()}
                  className="flex items-center gap-1.5 bg-[#F26522] text-white text-[12px] font-bold px-4 py-2 rounded-xl hover:bg-[#FF8C4B] transition-all">
                  <Plus size={14} /> Ajouter
                </button>
              </div>

              {children.length === 0 ? (
                <div className="bg-white rounded-2xl border border-black/8 p-8 text-center">
                  <div className="text-4xl mb-3">👶</div>
                  <p className="font-bold text-[15px] text-gray-700 mb-1">Aucun enfant ajouté</p>
                  <p className="text-[13px] text-gray-400 mb-4">Ajoutez vos enfants pour personnaliser votre expérience</p>
                  <button onClick={() => openModal()}
                    className="bg-[#0D2461] text-white text-[13px] font-bold px-5 py-2 rounded-xl hover:bg-[#1a3a8a] transition-all">
                    Ajouter mon premier enfant
                  </button>
                </div>
              ) : (
                children.map((child) => (
                  <div key={child.id} className="bg-white rounded-2xl border border-black/8 p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F7F6F2] flex items-center justify-center text-2xl">
                      {SEXE_EMOJI[child.sexe] || "🧒"}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[15px] text-[#0D2461]">{child.surnom}</p>
                      <p className="text-[12px] text-gray-400">
                        {calculateAge(child.date_naissance)} · {child.sexe}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openModal(child)}
                        className="w-8 h-8 rounded-lg bg-[#F7F6F2] text-gray-500 hover:bg-[#0D2461] hover:text-white flex items-center justify-center transition-all">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => deleteChild(child.id)}
                        className="w-8 h-8 rounded-lg bg-[#F7F6F2] text-gray-500 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Favoris */}
          {tab === "favoris" && (
            <div className="flex flex-col gap-3 mb-8">
              <h2 className="font-bold text-[16px] text-[#0D2461]">Mes favoris ({favoris.length})</h2>
              {favoris.length === 0 ? (
                <div className="bg-white rounded-2xl border border-black/8 p-8 text-center">
                  <div className="text-4xl mb-3">❤️</div>
                  <p className="font-bold text-[15px] text-gray-700 mb-1">Aucun favori pour l&apos;instant</p>
                  <p className="text-[13px] text-gray-400 mb-4">Parcourez les listings et cliquez sur ❤️ pour les sauvegarder</p>
                  <Link href="/listings"
                    className="bg-[#0D2461] text-white text-[13px] font-bold px-5 py-2 rounded-xl hover:bg-[#1a3a8a] transition-all inline-block">
                    Explorer les listings
                  </Link>
                </div>
              ) : (
                favoris.map((fav) => (
                  <div key={fav.id} className="bg-white rounded-2xl border border-black/8 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F7F6F2] flex items-center justify-center text-xl">
                      {fav.listing?.category_emoji || "📍"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[14px] text-[#0D2461] truncate">{fav.listing?.nom}</p>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400">
                        <MapPin size={10} /> {fav.listing?.ville}
                        <span>·</span>
                        <Star size={10} className="text-[#F5C518] fill-[#F5C518]" /> {Number(fav.listing?.note_moyenne || 0).toFixed(1)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/listing/${fav.listing?.slug}`}
                        className="w-8 h-8 rounded-lg bg-[#F7F6F2] text-[#0D2461] hover:bg-[#0D2461] hover:text-white flex items-center justify-center transition-all">
                        <ChevronRight size={14} />
                      </Link>
                      <button onClick={() => removeFavori(fav.id)}
                        className="w-8 h-8 rounded-lg bg-[#F7F6F2] text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all">
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Avis */}
          {tab === "avis" && (
            <div className="flex flex-col gap-3 mb-8">
              <h2 className="font-bold text-[16px] text-[#0D2461]">Mes avis ({reviews.length})</h2>
              {reviews.length === 0 ? (
                <div className="bg-white rounded-2xl border border-black/8 p-8 text-center">
                  <div className="text-4xl mb-3">⭐</div>
                  <p className="font-bold text-[15px] text-gray-700 mb-1">Aucun avis encore</p>
                  <p className="text-[13px] text-gray-400">Partagez votre expérience sur les établissements visités</p>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="bg-white rounded-2xl border border-black/8 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{rev.listing?.category_emoji || "📍"}</span>
                      <Link href={`/listing/${rev.listing?.slug}`}
                        className="font-bold text-[14px] text-[#0D2461] hover:underline">
                        {rev.listing?.nom}
                      </Link>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={14} className={n <= rev.note ? "text-[#F5C518] fill-[#F5C518]" : "text-gray-200"} />
                      ))}
                    </div>
                    {rev.commentaire && (
                      <p className="text-[13px] text-gray-600 leading-relaxed">{rev.commentaire}</p>
                    )}
                    <p className="text-[11px] text-gray-400 mt-2">
                      {new Date(rev.created_at).toLocaleDateString("fr-TN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Historique */}
          {tab === "historique" && (
            <div className="bg-white rounded-2xl border border-black/8 p-8 text-center mb-8">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-bold text-[15px] text-gray-700 mb-1">Historique de recherche</p>
              <p className="text-[13px] text-gray-400 mb-4">Retrouvez vos recherches récentes ici bientôt</p>
              <Link href="/listings"
                className="bg-[#0D2461] text-white text-[13px] font-bold px-5 py-2 rounded-xl hover:bg-[#1a3a8a] transition-all inline-flex items-center gap-1.5">
                <Clock size={14} /> Nouvelle recherche
              </Link>
            </div>
          )}

          <button onClick={signOut}
            className="w-full flex items-center justify-center gap-2 py-3 text-[13px] font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all mb-8 border border-red-100">
            <LogOut size={15} /> Déconnexion
          </button>
        </div>
      </div>

      {/* Modal enfant */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-3xl w-full max-w-[420px] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[17px] text-[#0D2461]">
                {editingChild ? "Modifier l'enfant" : "Ajouter un enfant"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-full bg-[#F7F6F2] flex items-center justify-center text-gray-500">
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-bold text-gray-500 mb-1.5 block">Surnom *</label>
                <input
                  type="text"
                  value={form.surnom}
                  onChange={(e) => setForm((f) => ({ ...f, surnom: e.target.value }))}
                  placeholder="Ex: Petit monstre, Princesse..."
                  className="w-full border border-black/12 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#0D2461]/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-gray-500 mb-1.5 block">Date de naissance *</label>
                <input
                  type="date"
                  value={form.date_naissance}
                  onChange={(e) => setForm((f) => ({ ...f, date_naissance: e.target.value }))}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full border border-black/12 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#0D2461]/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-gray-500 mb-1.5 block">Sexe</label>
                <div className="flex gap-2">
                  {(["garçon", "fille", "autre"] as const).map((s) => (
                    <button key={s} onClick={() => setForm((f) => ({ ...f, sexe: s }))}
                      className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold border transition-all capitalize ${
                        form.sexe === s
                          ? "bg-[#0D2461] text-white border-[#0D2461]"
                          : "border-black/12 text-gray-500 hover:border-[#0D2461]/40"
                      }`}>
                      {SEXE_EMOJI[s]} {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-black/12 text-[13px] font-bold text-gray-500 hover:bg-[#F7F6F2] transition-all">
                Annuler
              </button>
              <button onClick={saveChild} disabled={!form.surnom.trim() || !form.date_naissance || saving}
                className="flex-1 py-2.5 rounded-xl bg-[#F26522] text-white text-[13px] font-bold disabled:opacity-40 hover:bg-[#FF8C4B] transition-all flex items-center justify-center gap-1.5">
                <Save size={14} /> {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
