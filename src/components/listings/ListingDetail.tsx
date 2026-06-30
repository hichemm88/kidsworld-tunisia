"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import MapView from "@/components/map/MapView";
import {
  ArrowLeft, Heart, Share2, Star, MapPin, Clock, Phone, Globe,
  ChevronDown, ChevronUp, Crown, CheckCircle, Loader2,
  Navigation, Images, Building2, Zap, BookOpen, Palette, Gift, ShoppingBag,
  MessageCircle, Copy, Check, ShieldCheck,
} from "lucide-react";

const CAT_ICONS: Record<string, { Icon: React.ComponentType<any>; color: string }> = {
  sante:     { Icon: Heart,        color: "#10B981" },
  education: { Icon: BookOpen,     color: "#7C3AED" },
  loisirs:   { Icon: Zap,          color: "#0EA5E9" },
  ateliers:  { Icon: Palette,      color: "#F43F5E" },
  fetes:     { Icon: Gift,         color: "#EC4899" },
  shopping:  { Icon: ShoppingBag,  color: "#F59E0B" },
};

interface Props {
  slug: string;
}

function Stars({ n, size = 13 }: { n: number; size?: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= n ? "text-[#F5C518] fill-[#F5C518]" : "text-gray-200 fill-gray-200"} />
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

const AVATAR_COLORS = [
  "#0EA5E9", "#10B981", "#7C3AED", "#F43F5E",
  "#EC4899", "#F59E0B", "#0D2461", "#F26522",
];

function Avatar({ name }: { name: string }) {
  const initial = (name || "A")[0].toUpperCase();
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  const bg = AVATAR_COLORS[idx];
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-extrabold text-white flex-shrink-0"
      style={{ background: bg }}>
      {initial}
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
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [favId, setFavId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ note: 5, commentaire: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimDone, setClaimDone] = useState(false);

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
        supabase.from("listing_hours").select("*").eq("listing_id", l.id).order("day_of_week"),
        supabase.from("listing_prices").select("*").eq("listing_id", l.id),
        supabase.from("listing_media").select("*").eq("listing_id", l.id).eq("type", "image").order("ordre"),
        supabase.from("reviews").select("*, user:profiles(full_name)").eq("listing_id", l.id).order("created_at", { ascending: false }).limit(10),
      ]);

      setHours(hoursRes.data || []);
      setPrices(pricesRes.data || []);
      setMedia(mediaRes.data || []);
      setReviews(reviewsRes.data || []);

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

  const claimListing = async () => {
    if (!user) { router.push("/auth/login"); return; }
    if (!listing || listing.owner_id) return;
    setClaimLoading(true);
    const { error } = await supabase.from("listings").update({ owner_id: user.id }).eq("id", listing.id);
    if (!error) {
      setListing((l: any) => ({ ...l, owner_id: user.id }));
      setClaimDone(true);
    }
    setClaimLoading(false);
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent((listing?.nom ?? "") + " — " + shareUrl)}`, "_blank");
    setShareMenuOpen(false);
  };
  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
    setShareMenuOpen(false);
  };
  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    setShareMenuOpen(false);
  };

  const DOW_TO_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={36} className="animate-spin text-[#0D2461] mx-auto mb-3" />
          <p className="text-[13px] text-gray-400 font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex flex-col items-center justify-center gap-4">
        <div className="w-20 h-20 rounded-3xl bg-[#0D2461]/8 flex items-center justify-center">
          <Building2 size={36} className="text-[#0D2461]/40" />
        </div>
        <h1 className="text-[22px] font-extrabold text-[#0D2461]">Listing introuvable</h1>
        <Link href="/listings" className="bg-[#0D2461] text-white font-bold px-6 py-3 rounded-2xl hover:bg-[#1a3a8a] transition-all shadow-lg">
          Retour aux listings
        </Link>
      </div>
    );
  }

  const rating = Number(listing.note_moyenne || 0);
  const catInfo = CAT_ICONS[listing.category_slug];
  const catColor = catInfo?.color ?? "#F26522";
  const CatIcon = catInfo?.Icon ?? Building2;

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

  return (
    <div className="min-h-screen bg-[#F8F9FF]">

      {/* Back bar */}
      <div className="bg-white border-b border-black/8 px-5 py-3 flex items-center gap-3 sticky top-[60px] z-40 shadow-sm">
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[13px] font-bold text-gray-500 hover:text-[#0D2461] transition-colors group">
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" /> Retour
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-extrabold text-[#0D2461] truncate">{listing.nom}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setShareMenuOpen((v) => !v)}
              className="w-9 h-9 rounded-xl bg-gray-50 border border-black/8 flex items-center justify-center text-gray-500 hover:bg-[#0D2461] hover:text-white hover:border-[#0D2461] transition-all">
              <Share2 size={14} />
            </button>
            {shareMenuOpen && (
              <div className="absolute right-0 top-11 bg-white border border-black/10 rounded-2xl shadow-2xl z-50 min-w-[190px] overflow-hidden">
                <button onClick={shareWhatsApp} className="flex items-center gap-2.5 w-full px-4 py-3 text-[13px] font-semibold text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors">
                  <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center"><MessageCircle size={13} className="text-white" /></div> WhatsApp
                </button>
                <button onClick={shareFacebook} className="flex items-center gap-2.5 w-full px-4 py-3 text-[13px] font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center"><Globe size={13} className="text-white" /></div> Facebook
                </button>
                <button onClick={copyLink} className="flex items-center gap-2.5 w-full px-4 py-3 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors border-t border-black/8">
                  <div className="w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center">
                    {copiedLink ? <Check size={13} className="text-green-600" /> : <Copy size={13} className="text-gray-500" />}
                  </div>
                  {copiedLink ? "Lien copié !" : "Copier le lien"}
                </button>
              </div>
            )}
          </div>
          <button onClick={toggleFav}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
              isFav ? "bg-red-50 text-red-500 border-red-200" : "bg-gray-50 border-black/8 text-gray-500 hover:bg-red-50 hover:text-red-400 hover:border-red-200"
            }`}>
            <Heart size={14} className={isFav ? "fill-red-500" : ""} />
          </button>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 py-6">

        {/* Photo Gallery */}
        {media.length === 0 && (
          <div className="mb-6 rounded-3xl h-52 flex flex-col items-center justify-center gap-3 relative overflow-hidden"
            style={{ background: catColor + "10" }}>
            <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full opacity-15" style={{ background: catColor }} />
            <div className="absolute -left-3 -top-3 w-16 h-16 rounded-full opacity-10" style={{ background: catColor }} />
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: catColor + "20" }}>
              <CatIcon size={32} style={{ color: catColor }} strokeWidth={1.5} />
            </div>
            <p className="text-[13px] font-semibold" style={{ color: catColor }}>Aucune photo disponible</p>
          </div>
        )}

        {media.length > 0 && (
          <div className="mb-6">
            {media.length === 1 ? (
              <button onClick={() => setLightboxIdx(0)} className="w-full rounded-3xl overflow-hidden aspect-video block">
                <img src={media[0].url} alt={listing.nom} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </button>
            ) : media.length === 2 ? (
              <div className="grid grid-cols-2 gap-2 rounded-3xl overflow-hidden h-64">
                {media.map((m: any, i: number) => (
                  <button key={i} onClick={() => setLightboxIdx(i)} className="overflow-hidden">
                    <img src={m.url} alt={`${listing.nom} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl overflow-hidden">
                <div className="grid grid-cols-3 gap-1.5 h-72">
                  <button onClick={() => setLightboxIdx(0)} className="col-span-2 overflow-hidden">
                    <img src={media[0].url} alt={listing.nom} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </button>
                  <div className="flex flex-col gap-1.5">
                    {media.slice(1, 3).map((m: any, i: number) => (
                      <div key={i} className="relative flex-1 overflow-hidden">
                        <button onClick={() => setLightboxIdx(i + 1)} className="w-full h-full">
                          <img src={m.url} alt={`${listing.nom} ${i + 2}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        </button>
                        {i === 1 && media.length > 3 && (
                          <button onClick={() => setLightboxIdx(2)}
                            className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white font-bold hover:bg-black/40 transition-colors">
                            <Images size={20} className="mb-1" />
                            <span className="text-[13px]">+{media.length - 3} photos</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {media.length > 3 && (
                  <div className="flex gap-1.5 mt-1.5">
                    {media.slice(3).map((m: any, i: number) => (
                      <button key={i} onClick={() => setLightboxIdx(i + 3)} className="flex-1 h-20 overflow-hidden rounded-xl">
                        <img src={m.url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Lightbox */}
        {lightboxIdx !== null && (
          <div className="fixed inset-0 bg-black/92 z-[200] flex items-center justify-center" onClick={() => setLightboxIdx(null)}>
            <button onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => i !== null ? (i - 1 + media.length) % media.length : 0); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/15 hover:bg-white/30 text-white rounded-full flex items-center justify-center text-xl font-bold transition-all">‹</button>
            <img src={media[lightboxIdx]?.url} alt="" className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()} />
            <button onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => i !== null ? (i + 1) % media.length : 0); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/15 hover:bg-white/30 text-white rounded-full flex items-center justify-center text-xl font-bold transition-all">›</button>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/80 text-[13px] font-bold bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-full">
              {lightboxIdx + 1} / {media.length}
            </div>
            <button onClick={() => setLightboxIdx(null)} className="absolute top-4 right-4 text-white/70 hover:text-white text-xl font-bold w-10 h-10 flex items-center justify-center bg-black/30 rounded-full">✕</button>
          </div>
        )}

        {/* Header card */}
        <div className="bg-white rounded-3xl border border-black/8 p-5 mb-4 shadow-sm relative overflow-hidden">
          {/* Subtle category color accent top bar */}
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: `linear-gradient(90deg, ${catColor}, ${catColor}80)` }} />
          <div className="flex items-start gap-4 mb-3 pt-1">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: catColor + "18" }}>
              <CatIcon size={28} style={{ color: catColor }} strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide" style={{ background: catColor + "15", color: catColor }}>
                  {listing.category_nom}
                </span>
                {listing.plan === "premium" && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                    <Crown size={9} /> Premium
                  </span>
                )}
                {listing.is_verified && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle size={9} /> Vérifié
                  </span>
                )}
              </div>
              <h1 className="text-[22px] font-extrabold text-[#0D2461] leading-tight">{listing.nom}</h1>
              <div className="flex items-center gap-3 flex-wrap mt-1.5">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-[#F5C518] fill-[#F5C518]" />
                  <span className="font-extrabold text-[13px] text-[#111827]">{rating.toFixed(1)}</span>
                  <span className="text-[12px] text-gray-400">({listing.nb_avis || 0} avis)</span>
                </div>
                <div className="flex items-center gap-1 text-[12px] text-gray-500">
                  <MapPin size={11} style={{ color: catColor }} />
                  {listing.quartier ? `${listing.quartier}, ` : ""}{listing.ville}
                </div>
              </div>
            </div>
          </div>

          {listing.description && (
            <p className="text-[14px] text-gray-600 leading-relaxed border-t border-black/8 pt-4 mt-4">
              {listing.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div className="md:col-span-2 flex flex-col gap-4 order-2 md:order-1">

            {/* Horaires */}
            {hours.length > 0 && (
              <div className="bg-white rounded-3xl border border-black/8 p-5 shadow-sm">
                <h2 className="font-extrabold text-[15px] text-[#0D2461] mb-4 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: catColor + "15" }}>
                    <Clock size={14} style={{ color: catColor }} />
                  </div>
                  Horaires d&apos;ouverture
                </h2>
                <div className="flex flex-col gap-1">
                  {DOW_TO_FR.map((dayName, dow) => {
                    const h = hours.find((x: any) => x.day_of_week === dow);
                    const todayDow = new Date().getDay();
                    const isToday = dow === todayDow;
                    const isOpen = h && !h.is_closed && h.open_time;
                    return (
                      <div key={dow} className={`flex items-center justify-between px-3 py-2 rounded-2xl transition-colors ${
                        isToday ? "font-bold" : ""
                      }`}
                        style={isToday ? { background: catColor + "10" } : {}}>
                        <span className={`text-[13px] flex items-center gap-2 ${isToday ? "font-extrabold" : "text-gray-500"}`}
                          style={isToday ? { color: catColor } : {}}>
                          {isToday && (
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: isOpen ? "#10B981" : "#EF4444" }} />
                          )}
                          {dayName}
                          {isToday && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: catColor }}>
                              Aujourd&apos;hui
                            </span>
                          )}
                        </span>
                        {isOpen ? (
                          <span className={`text-[13px] font-semibold ${isToday ? "font-extrabold" : "text-gray-600"}`}
                            style={isToday ? { color: catColor } : {}}>
                            {h.open_time?.slice(0, 5)} – {h.close_time?.slice(0, 5)}
                          </span>
                        ) : (
                          <span className="text-[12px] text-red-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            Fermé
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tarifs */}
            {prices.length > 0 && (
              <div className="bg-white rounded-3xl border border-black/8 p-5 shadow-sm">
                <h2 className="font-extrabold text-[15px] text-[#0D2461] mb-4">Tarifs</h2>
                <div className="flex flex-col gap-2">
                  {prices.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F9FF] border border-black/6">
                      <div>
                        <p className="text-[13px] font-bold text-gray-700">{p.label}</p>
                        {p.description && <p className="text-[11px] text-gray-400 mt-0.5">{p.description}</p>}
                      </div>
                      <span className="font-extrabold text-[15px] px-3 py-1 rounded-xl" style={{ color: catColor, background: catColor + "12" }}>
                        {p.prix} TND
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Avis */}
            <div className="bg-white rounded-3xl border border-black/8 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-extrabold text-[15px] text-[#0D2461]">Avis ({listing.nb_avis || 0})</h2>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50">
                  <Star size={15} className="text-[#F5C518] fill-[#F5C518]" />
                  <span className="font-extrabold text-[14px] text-amber-700">{rating.toFixed(1)}</span>
                  <span className="text-[11px] text-amber-500">/5</span>
                </div>
              </div>

              {user ? (
                <div className="mb-5 p-4 rounded-2xl border border-black/8" style={{ background: catColor + "06" }}>
                  <p className="text-[12px] font-extrabold mb-3" style={{ color: catColor }}>Donnez votre avis</p>
                  <div className="flex gap-1.5 mb-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setReviewForm((f) => ({ ...f, note: n }))}>
                        <Star size={24} className={n <= reviewForm.note ? "text-[#F5C518] fill-[#F5C518]" : "text-gray-300 fill-gray-100"} />
                      </button>
                    ))}
                    <span className="ml-2 text-[12px] font-bold text-gray-500 self-center">{reviewForm.note}/5</span>
                  </div>
                  <textarea
                    value={reviewForm.commentaire}
                    onChange={(e) => setReviewForm((f) => ({ ...f, commentaire: e.target.value }))}
                    placeholder="Partagez votre expérience..."
                    rows={3}
                    className="w-full border border-black/10 rounded-2xl px-3.5 py-2.5 text-[13px] outline-none focus:border-[#0D2461]/40 resize-none mb-3 bg-white"
                  />
                  <button onClick={submitReview} disabled={submittingReview || !reviewForm.commentaire.trim()}
                    className="font-extrabold text-[12px] px-5 py-2.5 rounded-2xl text-white transition-all disabled:opacity-50 shadow-sm"
                    style={{ background: catColor }}>
                    {submittingReview ? "Envoi..." : "Publier mon avis"}
                  </button>
                </div>
              ) : (
                <div className="mb-4 p-4 bg-[#F8F9FF] rounded-2xl text-center border border-black/6">
                  <p className="text-[12px] text-gray-500 mb-2.5">Connectez-vous pour laisser un avis</p>
                  <Link href="/auth/login" className="text-[12px] font-extrabold text-[#F26522] hover:underline">
                    Se connecter →
                  </Link>
                </div>
              )}

              {reviews.length === 0 ? (
                <p className="text-[13px] text-gray-400 text-center py-6">Soyez le premier à laisser un avis !</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {reviews.map((rev: any) => (
                    <div key={rev.id} className="border-b border-black/6 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-2.5 mb-2">
                        <Avatar name={rev.user?.full_name || "Anonyme"} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-extrabold text-[#111827]">{rev.user?.full_name || "Anonyme"}</p>
                          <p className="text-[10px] text-gray-400">{new Date(rev.created_at).toLocaleDateString("fr-TN")}</p>
                        </div>
                        <Stars n={rev.note} size={12} />
                      </div>
                      <p className="text-[13px] text-gray-600 leading-relaxed">{rev.commentaire}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-3 order-1 md:order-2">

            {/* Contact */}
            <div className="bg-white rounded-3xl border border-black/8 p-4 shadow-sm">
              <h2 className="font-extrabold text-[14px] text-[#0D2461] mb-3">Contact</h2>
              <div className="flex flex-col gap-2">
                {listing.phone && (
                  <a href={`tel:${listing.phone}`}
                    className="flex items-center gap-2.5 p-3.5 text-white rounded-2xl font-extrabold text-[13px] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    style={{ background: `linear-gradient(135deg, #F26522, #FF8C42)` }}>
                    <div className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center">
                      <Phone size={14} />
                    </div>
                    {listing.phone}
                  </a>
                )}
                {listing.adresse && (
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(listing.adresse + ", " + listing.ville)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 bg-[#F8F9FF] rounded-2xl text-[12px] text-gray-600 hover:bg-gray-100 transition-colors border border-black/6">
                    <MapPin size={13} style={{ color: catColor }} className="flex-shrink-0" />
                    <span className="truncate">{listing.adresse}</span>
                  </a>
                )}
                {listing.website && (
                  <a href={listing.website.startsWith("http") ? listing.website : `https://${listing.website}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 bg-[#F8F9FF] rounded-2xl text-[12px] text-[#0D2461] font-semibold hover:bg-gray-100 transition-colors border border-black/6">
                    <Globe size={13} className="flex-shrink-0 text-[#0D2461]" />
                    <span className="truncate">{listing.website}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Carte */}
            {pin.length > 0 && (
              <div className="bg-white rounded-3xl border border-black/8 p-4 shadow-sm">
                <h2 className="font-extrabold text-[14px] text-[#0D2461] mb-3">Localisation</h2>
                <div className="rounded-2xl overflow-hidden">
                  <MapView pins={pin} center={[listing.lat, listing.lng]} zoom={15} height="190px" />
                </div>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`}
                  target="_blank" rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-[#4285F4] hover:bg-[#3367D6] text-white font-extrabold text-[12px] rounded-2xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                  <Navigation size={13} /> Obtenir l&apos;itinéraire
                </a>
              </div>
            )}

            {/* Favori */}
            <button onClick={toggleFav}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-extrabold text-[13px] border-2 transition-all ${
                isFav
                  ? "bg-red-50 text-red-500 border-red-200 hover:bg-red-100"
                  : "bg-white text-gray-500 border-black/10 hover:border-red-200 hover:text-red-400 hover:bg-red-50"
              }`}>
              <Heart size={15} className={isFav ? "fill-red-500" : ""} />
              {isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
            </button>

            {/* Claim */}
            {!listing.owner_id && (
              claimDone ? (
                <div className="flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-extrabold text-emerald-700 bg-emerald-50 border-2 border-emerald-200">
                  <CheckCircle size={14} /> Établissement réclamé !
                </div>
              ) : (
                <button onClick={claimListing} disabled={claimLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-extrabold text-[13px] border-2 border-dashed border-[#0D2461]/25 text-[#0D2461]/60 hover:bg-[#0D2461] hover:text-white hover:border-solid hover:border-[#0D2461] transition-all disabled:opacity-50">
                  {claimLoading ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                  C&apos;est mon établissement
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
