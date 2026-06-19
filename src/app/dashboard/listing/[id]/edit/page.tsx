"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import Navbar from "@/components/layout/Navbar";
import {
  Save, ArrowLeft, Info, Clock, DollarSign, Image, MapPin,
  Plus, Trash2, Check, X, Loader2, Upload
} from "lucide-react";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const TABS = [
  { id: "infos", label: "Infos", icon: <Info size={15} /> },
  { id: "horaires", label: "Horaires", icon: <Clock size={15} /> },
  { id: "tarifs", label: "Tarifs", icon: <DollarSign size={15} /> },
  { id: "photos", label: "Photos", icon: <Image size={15} /> },
  { id: "gps", label: "Contact & GPS", icon: <MapPin size={15} /> },
];

interface ListingForm {
  nom: string;
  description: string;
  category_id: string;
  ville: string;
  quartier: string;
  adresse: string;
  phone: string;
  email: string;
  website: string;
  is_active: boolean;
}

interface HoraireRow {
  jour: string;
  ouvert: boolean;
  heure_ouverture: string;
  heure_fermeture: string;
}

interface TarifRow {
  id?: string;
  label: string;
  prix: string;
  description: string;
}

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const isNew = id === "nouveau";

  const [tab, setTab] = useState("infos");
  const [listing, setListing] = useState<ListingForm>({
    nom: "", description: "", category_id: "", ville: "Tunis", quartier: "",
    adresse: "", phone: "", email: "", website: "", is_active: true,
  });
  const [horaires, setHoraires] = useState<HoraireRow[]>(
    DAYS.map((jour) => ({ jour, ouvert: jour !== "Dimanche", heure_ouverture: "09:00", heure_fermeture: "18:00" }))
  );
  const [tarifs, setTarifs] = useState<TarifRow[]>([{ label: "", prix: "", description: "" }]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [listingId, setListingId] = useState<string | null>(isNew ? null : id);

  useEffect(() => {
    async function load() {
      const { data: cats } = await supabase.from("categories").select("*").order("nom");
      setCategories(cats || []);

      if (!isNew && id) {
        const { data: l } = await supabase.from("listings").select("*").eq("id", id).single();
        if (!l) { router.push("/dashboard"); return; }
        setListing({
          nom: l.nom || "", description: l.description || "", category_id: l.category_id || "",
          ville: l.ville || "Tunis", quartier: l.quartier || "", adresse: l.adresse || "",
          phone: l.phone || "", email: l.email || "", website: l.website || "",
          is_active: l.is_active ?? true,
        });
        setLat(l.lat?.toString() || "");
        setLng(l.lng?.toString() || "");

        const [hoursRes, pricesRes, mediaRes] = await Promise.all([
          supabase.from("listing_hours").select("*").eq("listing_id", id),
          supabase.from("listing_prices").select("*").eq("listing_id", id),
          supabase.from("listing_media").select("*").eq("listing_id", id).eq("type", "image").order("position"),
        ]);

        if (hoursRes.data && hoursRes.data.length > 0) {
          setHoraires(DAYS.map((jour) => {
            const existing = hoursRes.data.find((h: any) => h.jour === jour);
            return existing || { jour, ouvert: false, heure_ouverture: "09:00", heure_fermeture: "18:00" };
          }));
        }
        if (pricesRes.data && pricesRes.data.length > 0) {
          setTarifs(pricesRes.data.map((p: any) => ({ id: p.id, label: p.label, prix: p.prix?.toString() || "", description: p.description || "" })));
        }
        if (mediaRes.data) {
          setPhotos(mediaRes.data.map((m: any) => m.url));
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const saveAll = async () => {
    if (!listing.nom.trim()) { alert("Le nom est obligatoire"); setTab("infos"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const payload = {
        ...listing,
        category_id: listing.category_id || null,
        plan: "free" as const,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        owner_id: user.id,
        slug: listing.nom.toLowerCase()
          .replace(/[àáâãä]/g, "a").replace(/[èéêë]/g, "e").replace(/[ìíîï]/g, "i")
          .replace(/[òóôõö]/g, "o").replace(/[ùúûü]/g, "u").replace(/[ç]/g, "c")
          .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      };

      let lid = listingId;
      if (isNew || !lid) {
        const { data, error } = await supabase.from("listings").insert(payload).select().single();
        if (error) throw error;
        lid = data.id;
        setListingId(lid);
      } else {
        const { error } = await supabase.from("listings").update(payload).eq("id", lid);
        if (error) throw error;
      }

      // Save horaires
      if (lid) {
        await supabase.from("listing_hours").delete().eq("listing_id", lid);
        const hoursToInsert = horaires.filter((h) => h.ouvert).map((h) => ({ listing_id: lid, ...h }));
        if (hoursToInsert.length > 0) await supabase.from("listing_hours").insert(hoursToInsert);

        // Save tarifs
        await supabase.from("listing_prices").delete().eq("listing_id", lid);
        const prices = tarifs.filter((t) => t.label.trim()).map((t) => ({
          listing_id: lid,
          label: t.label,
          prix: parseFloat(t.prix) || 0,
          description: t.description,
        }));
        if (prices.length > 0) await supabase.from("listing_prices").insert(prices);

        // Save photos
        await supabase.from("listing_media").delete().eq("listing_id", lid).eq("type", "image");
        const media = photos.filter(Boolean).map((url, i) => ({ listing_id: lid, url, type: "image", position: i }));
        if (media.length > 0) await supabase.from("listing_media").insert(media);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (isNew && lid) router.push(`/dashboard/listing/${lid}/edit`);
    } catch (err: any) {
      alert("Erreur : " + (err.message || "Inconnue"));
    } finally {
      setSaving(false);
    }
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F7F6F2]">
        <div className="max-w-[760px] mx-auto px-5 py-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push("/dashboard")}
                className="w-9 h-9 rounded-xl bg-white border border-black/8 flex items-center justify-center text-gray-500 hover:bg-[#0D2461] hover:text-white transition-all">
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="font-bold text-[18px] text-[#0D2461]">
                  {isNew ? "Nouveau listing" : `Modifier : ${listing.nom || "..."}`}
                </h1>
                <p className="text-[12px] text-gray-400">
                  {isNew ? "Créez votre fiche établissement" : "Modifiez les informations"}
                </p>
              </div>
            </div>
            <button onClick={saveAll} disabled={saving}
              className="flex items-center gap-2 bg-[#F26522] text-white font-bold text-[13px] px-5 py-2.5 rounded-xl hover:bg-[#FF8C4B] disabled:opacity-60 transition-all">
              {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
              {saving ? "Enregistrement..." : saved ? "Enregistré !" : "Enregistrer"}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-black/8 mb-6 overflow-x-auto">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all ${
                  tab === t.id ? "bg-[#0D2461] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-black/8 p-6">

            {/* Infos générales */}
            {tab === "infos" && (
              <div className="flex flex-col gap-5">
                <div>
                  <label className="text-[12px] font-bold text-gray-500 mb-1.5 block">Nom de l&apos;établissement *</label>
                  <input type="text" value={listing.nom} onChange={(e) => setListing((l) => ({ ...l, nom: e.target.value }))}
                    placeholder="Ex: Jumpark Trampoline Tunis"
                    className="w-full border border-black/12 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#0D2461]/50" />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-500 mb-1.5 block">Catégorie</label>
                  <select value={listing.category_id} onChange={(e) => setListing((l) => ({ ...l, category_id: e.target.value }))}
                    className="w-full border border-black/12 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#0D2461]/50 bg-white">
                    <option value="">Choisir une catégorie</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-500 mb-1.5 block">Description</label>
                  <textarea value={listing.description} onChange={(e) => setListing((l) => ({ ...l, description: e.target.value }))}
                    rows={5} placeholder="Décrivez votre établissement..."
                    className="w-full border border-black/12 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#0D2461]/50 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-bold text-gray-500 mb-1.5 block">Ville</label>
                    <input type="text" value={listing.ville} onChange={(e) => setListing((l) => ({ ...l, ville: e.target.value }))}
                      className="w-full border border-black/12 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#0D2461]/50" />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-gray-500 mb-1.5 block">Quartier</label>
                    <input type="text" value={listing.quartier} onChange={(e) => setListing((l) => ({ ...l, quartier: e.target.value }))}
                      placeholder="Ex: Les Berges du Lac"
                      className="w-full border border-black/12 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#0D2461]/50" />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#F7F6F2] rounded-xl">
                  <div className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${listing.is_active ? "bg-green-500" : "bg-gray-300"}`}
                    onClick={() => setListing((l) => ({ ...l, is_active: !l.is_active }))}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${listing.is_active ? "left-4" : "left-0.5"}`} />
                  </div>
                  <span className="text-[13px] font-semibold text-gray-700">
                    {listing.is_active ? "Listing actif et visible" : "Listing masqué"}
                  </span>
                </div>
              </div>
            )}

            {/* Horaires */}
            {tab === "horaires" && (
              <div className="flex flex-col gap-3">
                <p className="text-[13px] text-gray-500 mb-2">Définissez les jours et heures d&apos;ouverture</p>
                {horaires.map((h, i) => (
                  <div key={h.jour} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${h.ouvert ? "border-[#0D2461]/20 bg-[#F7F6F2]" : "border-black/8"}`}>
                    <div className={`w-8 h-5 rounded-full relative cursor-pointer transition-colors ${h.ouvert ? "bg-[#0D2461]" : "bg-gray-200"}`}
                      onClick={() => setHoraires((hrs) => hrs.map((x, j) => j === i ? { ...x, ouvert: !x.ouvert } : x))}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${h.ouvert ? "left-3" : "left-0.5"}`} />
                    </div>
                    <span className={`text-[13px] font-bold w-24 ${h.ouvert ? "text-[#0D2461]" : "text-gray-400"}`}>{h.jour}</span>
                    {h.ouvert ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input type="time" value={h.heure_ouverture}
                          onChange={(e) => setHoraires((hrs) => hrs.map((x, j) => j === i ? { ...x, heure_ouverture: e.target.value } : x))}
                          className="border border-black/12 rounded-lg px-2 py-1.5 text-[13px] outline-none focus:border-[#0D2461]/50" />
                        <span className="text-gray-400 text-[12px]">→</span>
                        <input type="time" value={h.heure_fermeture}
                          onChange={(e) => setHoraires((hrs) => hrs.map((x, j) => j === i ? { ...x, heure_fermeture: e.target.value } : x))}
                          className="border border-black/12 rounded-lg px-2 py-1.5 text-[13px] outline-none focus:border-[#0D2461]/50" />
                      </div>
                    ) : (
                      <span className="text-[12px] text-gray-400 flex-1">Fermé</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tarifs */}
            {tab === "tarifs" && (
              <div className="flex flex-col gap-4">
                <p className="text-[13px] text-gray-500">Ajoutez vos tarifs (entrée, abonnement, cours...)</p>
                {tarifs.map((t, i) => (
                  <div key={i} className="flex gap-2 items-start p-3 bg-[#F7F6F2] rounded-xl border border-black/8">
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" value={t.label} placeholder="Ex: Entrée enfant"
                          onChange={(e) => setTarifs((ts) => ts.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                          className="border border-black/12 rounded-lg px-2.5 py-2 text-[13px] outline-none focus:border-[#0D2461]/50 bg-white" />
                        <input type="number" value={t.prix} placeholder="Prix (TND)"
                          onChange={(e) => setTarifs((ts) => ts.map((x, j) => j === i ? { ...x, prix: e.target.value } : x))}
                          className="border border-black/12 rounded-lg px-2.5 py-2 text-[13px] outline-none focus:border-[#0D2461]/50 bg-white" />
                      </div>
                      <input type="text" value={t.description} placeholder="Description (optionnel)"
                        onChange={(e) => setTarifs((ts) => ts.map((x, j) => j === i ? { ...x, description: e.target.value } : x))}
                        className="border border-black/12 rounded-lg px-2.5 py-2 text-[13px] outline-none focus:border-[#0D2461]/50 bg-white" />
                    </div>
                    <button onClick={() => setTarifs((ts) => ts.filter((_, j) => j !== i))}
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center mt-1">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <button onClick={() => setTarifs((ts) => [...ts, { label: "", prix: "", description: "" }])}
                  className="flex items-center gap-2 text-[13px] font-bold text-[#0D2461] hover:bg-[#F7F6F2] px-3 py-2 rounded-xl transition-all border-2 border-dashed border-[#0D2461]/20">
                  <Plus size={14} /> Ajouter un tarif
                </button>
              </div>
            )}

            {/* Photos */}
            {tab === "photos" && (
              <div className="flex flex-col gap-4">
                <p className="text-[13px] text-gray-500">Importez des photos depuis votre appareil (JPG, PNG, WebP — max 5 Mo chacune)</p>

                {/* Upload zone */}
                <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${uploading ? "border-[#0D2461]/40 bg-[#F7F6F2]" : "border-black/12 hover:border-[#0D2461]/40 hover:bg-[#F7F6F2]"}`}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (!files.length) return;
                      setUploading(true);
                      try {
                        const urls: string[] = [];
                        for (const file of files) {
                          const fd = new FormData();
                          fd.append("file", file);
                          const res = await fetch("/api/upload", { method: "POST", body: fd });
                          const data = await res.json();
                          if (data.url) urls.push(data.url);
                          else alert(`Erreur upload ${file.name}: ${data.error}`);
                        }
                        setPhotos((p) => [...p, ...urls]);
                      } finally {
                        setUploading(false);
                        e.target.value = "";
                      }
                    }}
                  />
                  {uploading ? (
                    <><Loader2 size={22} className="animate-spin text-[#0D2461]" /><span className="text-[13px] text-[#0D2461] font-semibold">Upload en cours...</span></>
                  ) : (
                    <><Upload size={22} className="text-gray-400" /><span className="text-[13px] text-gray-500 font-semibold">Cliquez pour importer des photos</span><span className="text-[11px] text-gray-400">ou glissez-déposez ici</span></>
                  )}
                </label>

                {/* Grid */}
                {photos.length === 0 ? (
                  <div className="text-center text-[12px] text-gray-400 py-2">Aucune photo ajoutée</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photos.map((url, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
                        <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as any).style.opacity = "0.3"; }} />
                        <button onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={11} />
                        </button>
                        <div className="absolute bottom-1.5 left-1.5 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-md font-mono">{i + 1}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Contact & GPS */}
            {tab === "gps" && (
              <div className="flex flex-col gap-5">
                <div>
                  <label className="text-[12px] font-bold text-gray-500 mb-1.5 block">Téléphone</label>
                  <input type="tel" value={listing.phone} onChange={(e) => setListing((l) => ({ ...l, phone: e.target.value }))}
                    placeholder="+216 XX XXX XXX"
                    className="w-full border border-black/12 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#0D2461]/50" />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-500 mb-1.5 block">Email</label>
                  <input type="email" value={listing.email} onChange={(e) => setListing((l) => ({ ...l, email: e.target.value }))}
                    placeholder="contact@etablissement.tn"
                    className="w-full border border-black/12 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#0D2461]/50" />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-500 mb-1.5 block">Site web</label>
                  <input type="url" value={listing.website} onChange={(e) => setListing((l) => ({ ...l, website: e.target.value }))}
                    placeholder="https://www.votresite.tn"
                    className="w-full border border-black/12 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#0D2461]/50" />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-500 mb-1.5 block">Adresse complète</label>
                  <input type="text" value={listing.adresse} onChange={(e) => setListing((l) => ({ ...l, adresse: e.target.value }))}
                    placeholder="Ex: Rue de Marseille, Les Berges du Lac II"
                    className="w-full border border-black/12 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#0D2461]/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-bold text-gray-500 mb-1.5 block">Latitude GPS</label>
                    <input type="number" step="0.000001" value={lat} onChange={(e) => setLat(e.target.value)}
                      placeholder="Ex: 36.8065"
                      className="w-full border border-black/12 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#0D2461]/50" />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-gray-500 mb-1.5 block">Longitude GPS</label>
                    <input type="number" step="0.000001" value={lng} onChange={(e) => setLng(e.target.value)}
                      placeholder="Ex: 10.1815"
                      className="w-full border border-black/12 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#0D2461]/50" />
                  </div>
                </div>
                <div className="bg-[#F7F6F2] rounded-xl p-3 text-[12px] text-gray-500">
                  💡 Pour obtenir les coordonnées GPS : ouvrez Google Maps, cliquez sur votre adresse, et notez les coordonnées affichées.
                </div>
              </div>
            )}
          </div>

          {/* Bottom save */}
          <button onClick={saveAll} disabled={saving}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-[#0D2461] text-white font-bold text-[14px] py-3.5 rounded-2xl hover:bg-[#1a3a8a] disabled:opacity-60 transition-all">
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
            {saving ? "Enregistrement en cours..." : saved ? "Enregistré avec succès !" : "Enregistrer toutes les modifications"}
          </button>
        </div>
      </div>
    </>
  );
}
