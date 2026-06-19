import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import Navbar from "@/components/layout/Navbar";
import { MapPin, Star, ArrowRight, Building2 } from "lucide-react";

const VILLES: Record<string, { nom: string; description: string }> = {
  "tunis":          { nom: "Tunis",         description: "la capitale" },
  "ariana":         { nom: "Ariana",        description: "la ville d'Ariana" },
  "la-marsa":       { nom: "La Marsa",      description: "La Marsa" },
  "ben-arous":      { nom: "Ben Arous",     description: "Ben Arous" },
  "la-soukra":      { nom: "La Soukra",     description: "La Soukra" },
  "ennasr":         { nom: "Ennasr",        description: "Ennasr" },
  "les-berges-du-lac": { nom: "Berges du Lac", description: "les Berges du Lac" },
  "el-menzah":      { nom: "El Menzah",    description: "El Menzah" },
  "manouba":        { nom: "Manouba",       description: "Manouba" },
  "lac-1":          { nom: "Lac 1",         description: "Lac 1" },
};

export async function generateMetadata({ params }: { params: { ville: string } }): Promise<Metadata> {
  const info = VILLES[params.ville];
  if (!info) return {};
  const nom = info.nom;
  return {
    title: `Activités enfants à ${nom} — KidsWorld Tunisia`,
    description: `Trouvez les meilleures activités, cours, médecins et lieux pour enfants à ${nom}. Annuaire complet pour parents à ${nom}, Tunisie.`,
    openGraph: {
      title: `Activités enfants à ${nom} — KidsWorld`,
      description: `Annuaire enfants à ${nom} : loisirs, éducation, santé, fêtes.`,
    },
  };
}

export function generateStaticParams() {
  return Object.keys(VILLES).map((ville) => ({ ville }));
}

export default async function VillePage({ params }: { params: { ville: string } }) {
  const info = VILLES[params.ville];
  if (!info) notFound();

  const supabase = createClient();

  // Fetch listings for this city
  const { data: listings } = await supabase
    .from("listings_with_stats")
    .select("id, slug, nom, ville, quartier, plan, is_verified, category_nom, category_slug, category_couleur, note_moyenne, nb_avis, prix_label, age_min, age_max")
    .ilike("ville", `%${info.nom}%`)
    .eq("is_active", true)
    .order("plan", { ascending: false })
    .order("note_moyenne", { ascending: false })
    .limit(30);

  // Stats per category
  const catCounts: Record<string, number> = {};
  (listings ?? []).forEach((l: any) => {
    const c = l.category_nom ?? "Autre";
    catCounts[c] = (catCounts[c] ?? 0) + 1;
  });

  const CAT_COLORS: Record<string, string> = {
    "Loisirs": "#2563EB", "Santé": "#16a34a", "Éducation": "#7C3AED",
    "Ateliers": "#DC2626", "Fêtes": "#DB2777", "Shopping": "#0891B2",
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F7F6F2]">

        {/* Hero */}
        <div className="bg-[#071640] text-white py-12 px-5">
          <div className="max-w-[760px] mx-auto">
            <div className="flex items-center gap-2 text-[12px] text-white/50 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <span>/</span>
              <Link href="/listings" className="hover:text-white transition-colors">Listings</Link>
              <span>/</span>
              <span className="text-white/80">{info.nom}</span>
            </div>
            <div className="flex items-center gap-2 text-[#F26522] text-[13px] font-bold mb-2">
              <MapPin size={14} /> {info.nom}, Tunisie
            </div>
            <h1 className="text-[32px] font-extrabold leading-tight mb-3">
              Activités enfants à {info.nom}
            </h1>
            <p className="text-[15px] text-white/70 max-w-[560px] leading-relaxed">
              Découvrez les meilleurs établissements pour enfants à {info.description} :
              loisirs, éducation, santé, ateliers et organisation de fêtes.
            </p>

            {/* Category mini counts */}
            {Object.keys(catCounts).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {Object.entries(catCounts).map(([cat, count]) => (
                  <span key={cat} className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-white/10 text-white/80">
                    {cat} ({count})
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[760px] mx-auto px-5 py-8">

          {(listings ?? []).length === 0 ? (
            <div className="text-center py-16">
              <Building2 size={40} className="mx-auto text-gray-300 mb-4" />
              <p className="font-extrabold text-[18px] text-[#0D2461] mb-2">Aucun listing pour l&apos;instant</p>
              <p className="text-gray-400 mb-6">Soyez le premier à référencer votre établissement à {info.nom}.</p>
              <Link href="/dashboard/nouveau-listing"
                className="inline-flex items-center gap-2 bg-[#F26522] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#FF8C4B] transition-all">
                Ajouter mon établissement
              </Link>
            </div>
          ) : (
            <>
              <p className="text-[14px] text-gray-500 mb-5">
                <strong className="text-[#0D2461]">{listings!.length} établissement{listings!.length > 1 ? "s" : ""}</strong> rĩpférencé{listings!.length > 1 ? "s" : ""} à {info.nom}
              </p>

              <div className="flex flex-col gap-3">
                {(listings ?? []).map((l: any) => {
                  const color = CAT_COLORS[l.category_nom] ?? l.category_couleur ?? "#F26522";
                  return (
                    <Link id={l.id} href={`/listing/${l.slug}`}
                      className={`bg-white rounded-2xl border-[1.5px] p-4 flex items-center gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all ${l.plan === "premium" ? "border-amber-300" : "border-black/8"}`}>
                      <div className="w-[52px] h-[52px] rounded-xl flex-shrink-0 flex items-center justify-center text-[22px]"
                        style={{ background: color + "15" }}>
                        <Building2 size={22} style={{ color }} strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase"
                            style={{ background: color + "20", color }}>{l.category_nom}</span>
                          {l.is_verified && <span className="text-[9px] font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded-full">✓ Vérifié</span>}
                          {l.plan === "premium" && <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-full">Premium</span>}
                        </div>
                        <p className="text-[14px] font-extrabold text-[#111827] truncate">{l.nom}</p>
                        <div className="flex items-center gap-3 flex-wrap mt-0.5">
                          <span className="flex items-center gap-1 text-[11px] text-gray-400"><MapPin size={9} />{l.quartier ?? l.ville}</span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-[#F5C518]">
                            <Star size={9} fill="#F5C518" /> {Number(l.note_moyenne).toFixed(1)}
                            <span className="text-gray-400 font-normal">({l.nb_avis})</span>
                          </span>
                          {l.prix_label && <span className="text-[11px] font-bold text-[#F26522]">{l.prix_label}</span>}
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-gray-300 flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>

              {/* CTA pro */}
              <div className="mt-8 bg-[#0D2461] text-white rounded-2xl p-6 text-center">
                <p className="font-extrabold text-[16px] mb-1">Vous avez un établissement à {info.nom} ?</p>
                <p className="text-[13px] text-white/70 mb-4">Référencez-le gratuitement et touchez des milliers de parents.</p>
                <Link href="/dashboard/nouveau-listing"
                  className="inline-flex items-center gap-2 bg-[#F26522] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#FF8C4B] transition-all text-[13px]">
                  Ajouter mon établissement <ArrowRight size={14} />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
