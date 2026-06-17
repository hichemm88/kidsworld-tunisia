"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import MapView from "@/components/map/MapView";
import {
  ArrowLeft, Heart, Share2, Star, MapPin, Clock, Phone, Globe,
  ChevronDown, ChevronUp, Crown, CheckCircle, Loader2,
  ChevronLeft, ChevronRight, Navigation
} from "lucide-react";

interface Props {
  slug: string;
}

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={13} className={i <= n ? "text-[#F5C518] fill-[#F5C518]" : "text-gray-200 fill-gray-200"} />
      ))}
    </span>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-black/8 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-3.5 text-left gap-3">
        <span className="text-[13px] font-bold text-[#111827]">{q}</span>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <p className="text-[13px] text-gray-500 leading-relaxed pb-4">{a}</p>}
    </div>
  );
}

export default function ListingDetail({ slug }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [hours, setHours] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeImg, setActiveImg] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [favId, setFavId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ note: 5, commentaire: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const [listingRes, userRes] = await Promise.all([
        supabase.from("listings_with_stats").select("*").eq("slug", slug).single(),
        supabase.auth.getUser(),
      ]);

      if (!listingRes.data) { setLoading(false); return; }
      const l = listingRes.data;
      setListing(l);
      setUser(userRes.data.user);

      const [hoursRes, pricesRes, mediaRes, reviewsRes] = await Promise.all([
        supabase.from("listing_hours").select("*").eq("listing_id", l.id).order("jour"),
        supabase.from("listing_prices").select("*").eq("listing_id", l.id),
        supabase.from("listing_media").select("*").eq("listing_id", l.id).eq("type", "image").order("position"),
        supabase.from("reviews").select("*, user:profiles(full_name)").eq("listing_id", l.id).order("created_at", { ascending: false }).limit(10),
      ]);

      setHours(hoursRes.data || []);
      setPrices(pricesRes.data || []);
      setMedia(mediaRes.data || []);
      setReviews(reviewsRes.data || []);

      // Check favori
      if (userRes.data.user) {
        const { data: fav } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", userRes.data.user.id)
          .eq("listing_id", l.id)
          .single();
        if (fav) { setIsFav(true); setFavId(fav.id); }
      }

      setLoading(false);
    }
    load();
  }, [slug]);

  const toggleFav = async () => {
    if (!user) { router.push("/auth/login"); return; }
    if (isFav && favId) {
      await supabase.from("favorites").delete().eq("id", favId);
      setIsFav(false); setFavId(null);
    } else {
      const { data } = await supabase.from("favorites").insert({ user_id: user.id, listing_id: listing.id }).select().single();
      if (data) { setIsFav(true); setFavId(data.id); }
    }
  };

  const submitReview = async () => {
    if (!user) { router.push("/auth/login"); return; }
    if (!reviewForm.commentaire.trim()) return;
    setSubmittingReview(true);
    const { data } = await supabase.from("reviews").insert({
      listing_id: listing.id, user_id: user.id,
      note: reviewForm.note, commentaire: reviewForm.commentaire,
    }).select("*, user:profiles(full_name)").single();
    if (data) {
      setReviews((r) => [data, ...r]);
      setReviewForm({ note: 5, commentaire: "" });
    }
    setSubmittingReview(false);
  };

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: listing?.nom, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Lien copié !");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#0D2461]" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">😕</div>
        <h1 className="font-bebas text-[32px] text-[#0D2461]">Listing introuvable</h1>
        <Link href="/listings" className="bg-[#0D2461] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#1a3a8a] transition-all">
          Retour aux listings
        </Link>
      </div>
    );
  }

  const rating = Number(listing.note_moyenne || 0);
  const pin = listing.lat && listing.lng ? [{
    id: listing.id,
    lat: listing.lat,
    lng: listing.lng,
    name: listing.nom,
    category: listing.category_slug,
    premium: listing.plan === "premium",
    rating,
    slug: listing.slug,
  }] : [];

  const DAY_ORDER = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

  return (
    <div className="min-h-screen bg-[#F7F6F2]">

      {/* Back bar */}
      <div className="bg-white border-b border-black/8 px-5 py-3 flex items-center gap-3 sticky top-16 z-40">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-[#0D2461] transition-colors">
          <ArrowLeft size={15} /> Retour
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-[#0D2461] truncate">{listing.nom}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={share} className="w-8 h-8 rounded-lg bg-[#F7F6F2] flex items-center justify-center text-gray-500 hover:bg-[#0D2461] hover:text-white transition-all">
            <Share2 size={14} />
          </button>
          <button onClick={toggleFav}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isFav ? "bg-red-50 text-red-500" : "bg-[#F7F6F2] text-gray-500 hover:bg-red-50 hover:text-red-400"}`}>
            <Heart size={14} className={isFav ? "fill-red-500" : ""} />
          </button>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-5 py-6">

        {/* Photo gallery */}
        {media.length > 0 && (
          <div className="mb-6">
            {/* Main image */}
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-100">
              <img
                src={media[activeImg]?.url}
                alt={`${listing.nom} - photo ${activeImg + 1}`}
                className="w-full h-full object-cover"
              />
              {media.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((i) => (i - 1 + media.length) % media.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setActiveImg((i) => (i + 1) % media.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {activeImg + 1} / {media.length}
                  </div>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {media.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                {media.map((m: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                      i === activeImg ? "border-[#0D2461] opacity-100" : "border-transparent opacity-60 hover:opacity-90"
                    }`}
                  >
                    <img src={m.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-2xl border border-black/8 p-5 mb-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F7F6F2] flex items-center justify-center text-2xl flex-shrink-0">
              {listing.category_emoji || "📍"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {listing.plan === "premium" && (
                  <span className="inline-flex items-center gap-1 bg-[#F5C518]/15 text-[#B8941A] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <Crown size={10} /> Premium
                  </span>
                )}
                {listing.is_active && (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <CheckCircle size={10} /> Actif
                  </span>
                )}
              </div>
              <h1 className="font-bebas text-[28px] text-[#0D2461] tracking-wide leading-tight">{listing.nom}</h1>
              <div className="flex items-center gap-3 flex-wrap mt-1">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-[#F5C518] fill-[#F5C518]" />
                  <span className="font-bold text-[13px] text-[#111827]">{rating.toFixed(1)}</span>
                  <span className="text-[12px] text-gray-400">({listing.nb_avis || 0} avis)</span>
                </div>
                <div className="flex items-center gap-1 text-[12px] text-gray-500">
                  <MapPin size={12} /> {listing.quartier ? `${listing.quartier}, ` : ""}{listing.ville}
                </div>
                <div className="text-[12px] text-gray-400">{listing.category_nom}</div>
              </div>
            </div>
          </div>

          {listing.description && (
            <p className="text-[14px] text-gray-600 leading-relaxed border-t border-black/8 pt-4 mt-4">
              {listing.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 flex flex-col gap-4">

            {/* Horaires */}
            {hours.length > 0 && (
              <div className="bg-white rounded-2xl border border-black/8 p-5">
                <h2 className="font-bold text-[15px] text-[#0D2461] mb-4 flex items-center gap-2">
                  <Clock size={16} /> Horaires d&apos;ouverture
                </h2>
                <div className="flex flex-col gap-2">
                  {DAY_ORDER.map((day) => {
                    const h = hours.find((x) => x.jour === day);
                    const today = new Date().toLocaleDateString("fr-FR", { weekday: "long" });
                    const isToday = today.charAt(0).toUpperCase() + today.slice(1) === day;
                    const isOpen = h && h.ouvert;
                    return (
                      <div key={day} className={`flex items-center justify-between py-1.5 ${isToday ? "font-bold" : ""}`}>
                        <span className={`text-[13px] ${isToday ? "text-[#0D2461]" : "text-gray-500"}`}>{day}</span>
                        {isOpen ? (
                          <span className={`text-[13px] ${isToday ? "text-[#0D2461]" : "text-gray-600"}`}>
                            {h.heure_ouverture?.slice(0, 5)} – {h.heure_fermeture?.slice(0, 5)}
                          </span>
                        ) : (
                          <span className="text-[12px] text-red-400 font-medium">Fermé</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tarifs */}
            {prices.length > 0 && (
              <div className="bg-white rounded-2xl border border-black/8 p-5">
                <h2 className="font-bold text-[15px] text-[#0D2461] mb-4">Tarifs</h2>
                <div className="flex flex-col gap-2">
                  {prices.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-black/6 last:border-0">
                      <div>
                        <p className="text-[13px] font-semibold text-gray-700">{p.label}</p>
                        {p.description && <p className="text-[11px] text-gray-400">{p.description}</p>}
                      </div>
                      <span className="font-bold text-[14px] text-[#0D2461]">{p.prix} TND</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Avis */}
            <div className="bg-white rounded-2xl border border-black/8 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[15px] text-[#0D2461]">Avis ({listing.nb_avis || 0})</h2>
                <div className="flex items-center gap-1.5">
                  <Star size={16} className="text-[#F5C518] fill-[#F5C518]" />
                  <span className="font-bold text-[15px]">{rating.toFixed(1)}</span>
                  <span className="text-[12px] text-gray-400">/5</span>
                </div>
              </div>

              {/* Formulaire avis */}
              {user ? (
                <div className="mb-5 p-4 bg-[#F7F6F2] rounded-xl border border-black/8">
                  <p className="text-[12px] font-bold text-gray-600 mb-3">Donnez votre avis</p>
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setReviewForm((f) => ({ ...f, note: n }))}>
                        <Star size={20} className={n <= reviewForm.note ? "text-[#F5C518] fill-[#F5C518]" : "text-gray-300"} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewForm.commentaire}
                    onChange={(e) => setReviewForm((f) => ({ ...f, commentaire: e.target.value }))}
                    placeholder="Partagez votre expérience..."
                    rows={3}
                    className="w-full border border-black/12 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0D2461]/50 resize-none mb-3"
                  />
                  <button onClick={submitReview} disabled={submittingReview || !reviewForm.commentaire.trim()}
                    className="bg-[#0D2461] text-white font-bold text-[12px] px-4 py-2 rounded-lg hover:bg-[#1a3a8a] disabled:opacity-50 transition-all">
                    {submittingReview ? "Envoi..." : "Publier mon avis"}
                  </button>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-[#F7F6F2] rounded-xl text-center">
                  <p className="text-[12px] text-gray-500 mb-2">Connectez-vous pour laisser un avis</p>
                  <Link href="/auth/login" className="text-[12px] font-bold text-[#F26522] hover:underline">
                    Se connecter →
                  </Link>
                </div>
              )}

              {reviews.length === 0 ? (
                <p className="text-[13px] text-gray-400 text-center py-4">Soyez le premier à laisser un avis !</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {reviews.map((rev: any) => (
                    <div key={rev.id} className="border-b border-black/6 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-7 h-7 rounded-full bg-[#0D2461]/10 flex items-center justify-center text-[11px] font-bold text-[#0D2461]">
                          {(rev.user?.full_name || "A")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-[#111827]">{rev.user?.full_name || "Anonyme"}</p>
                          <p className="text-[10px] text-gray-400">{new Date(rev.created_at).toLocaleDateString("fr-TN")}</p>
                        </div>
                        <div className="ml-auto">
                          <Stars n={rev.note} />
                        </div>
                      </div>
                      <p className="text-[13px] text-gray-600 leading-relaxed">{rev.commentaire}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">

            {/* Contact */}
            <div className="bg-white rounded-2xl border border-black/8 p-5">
              <h2 className="font-bold text-[14px] text-[#0D2461] mb-3">Contact</h2>
              <div className="flex flex-col gap-2">
                {listing.phone && (
                  <a href={`tel:${listing.phone}`}
                    className="flex items-center gap-2.5 p-3 bg-[#0D2461] text-white rounded-xl hover:bg-[#1a3a8a] transition-all text-[13px] font-bold">
                    <Phone size={15} /> {listing.phone}
                  </a>
                )}
                {listing.adresse && (
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(listing.adresse + ", " + listing.ville)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 bg-[#F7F6F2] rounded-xl text-[12px] text-gray-600 hover:bg-[#0D2461]/8 transition-colors">
                    <MapPin size={13} className="text-[#F26522]" /> {listing.adresse}
                  </a>
                )}
                {listing.website && (
                  <a href={listing.website.startsWith("http") ? listing.website : `https://${listing.website}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 bg-[#F7F6F2] rounded-xl text-[12px] text-[#0D2461] font-semibold hover:bg-[#0D2461]/8 transition-colors">
                    <Globe size={13} /> {listing.website}
                  </a>
                )}
              </div>
            </div>

            {/* Carte */}
            {pin.length > 0 && (
              <div className="bg-white rounded-2xl border border-black/8 p-4">
                <h2 className="font-bold text-[14px] text-[#0D2461] mb-3">Localisation</h2>
                <div className="rounded-xl overflow-hidden">
                  <MapView
                    pins={pin}
                    center={[listing.lat, listing.lng]}
                    zoom={15}
                    height="200px"
                  />
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold text-[13px] rounded-xl transition-all"
                >
                  <Navigation size={14} /> Obtenir l&apos;itinéraire
                </a>
              </div>
            )}

            {/* Favori */}
            <button onClick={toggleFav}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-[13px] border transition-all ${
                isFav
                  ? "bg-red-50 text-red-500 border-red-200 hover:bg-red-100"
                  : "bg-white text-gray-600 border-black/12 hover:border-red-200 hover:text-red-400"
              }`}>
              <Heart size={15} className={isFav ? "fill-red-500" : ""} />
              {isFav ? "Retiré des favoris" : "Ajouter aux favoris"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
            