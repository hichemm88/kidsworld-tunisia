import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";

const VILLES = [
  { slug: "tunis",             nom: "Tunis",          emoji: "🏙️", desc: "Médina, Lafayette, Bab Souika" },
  { slug: "ariana",            nom: "Ariana",         emoji: "🌿", desc: "Ennasr, La Soukra, Borj Louzir" },
  { slug: "les-berges-du-lac", nom: "Berges du Lac",  emoji: "🏊", desc: "Lac 1, Lac 2, Centre Urbain Nord" },
  { slug: "la-marsa",          nom: "La Marsa",       emoji: "🌊", desc: "Sidi Bou Saïd, Gammarth" },
  { slug: "ben-arous",         nom: "Ben Arous",      emoji: "🏭", desc: "Ezzahra, Hammam Lif, Bou Mhel" },
  { slug: "el-menzah",         nom: "El Menzah",      emoji: "🌳", desc: "Menzah 1 à 9, El Manar" },
];

export default function VillesGrid() {
  return (
    <section className="bg-[#F7F6F2] py-[64px]">
      <div className="max-w-[1140px] mx-auto px-5">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-[#F26522] mb-2">
          Explorer par quartier
        </p>
        <h2 className="text-[clamp(22px,2.8vw,32px)] font-extrabold text-[#0D2461] leading-tight mb-2">
          Les activités près de chez vous
        </h2>
        <p className="text-[15px] text-gray-500 mb-8 max-w-[480px]">
          Trouvez rapidement les établissements dans votre secteur du Grand Tunis.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {VILLES.map((v) => (
            <Link
              key={v.slug}
              href={`/activites/${v.slug}`}
              className="group bg-white rounded-2xl border border-black/8 p-4 flex items-center gap-3 hover:border-[#0D2461]/20 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0D2461]/6 flex items-center justify-center text-[20px] flex-shrink-0">
                {v.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p classNama="text-[14px] font-extrabold text-[#0D2461] truncate">{v.nom}</p>
                <p className="text-[11px] text-gray-400 truncate">{v.desc}</p>
              </div>
              <ArrowRight size={14} className="text-gray-200 group-hover:text-[#F26522] transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Link href="/listings" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0D2461] hover:text-[#F26522] transition-colors">
            <MapPin size={13} /> Voir tous les listings sur la carte
          </Link>
        </div>
      </div>
    </section>
  );
}
