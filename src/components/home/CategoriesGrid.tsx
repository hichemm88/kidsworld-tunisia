import Link from "next/link";
import { Heart, BookOpen, Zap, Palette, Gift, ShoppingBag, ArrowRight } from "lucide-react";

const CATEGORIES = [
  {
    slug: "sante",
    Icon: Heart,
    name: "Santé",
    desc: "Pédiatres, dentistes, ophtalmos, orthophonistes",
    count: "180+",
    color: "#16a34a",
    wide: false,
  },
  {
    slug: "education",
    Icon: BookOpen,
    name: "Éducation",
    desc: "Crèches, maternelles, cours de langue, soutien scolaire",
    count: "320+",
    color: "#7C3AED",
    wide: false,
  },
  {
    slug: "loisirs",
    Icon: Zap,
    name: "Loisirs",
    desc: "Parcs, espaces de jeux indoor, piscines, zoos, fermes pédagogiques",
    count: "210+",
    color: "#2563EB",
    wide: true,
  },
  {
    slug: "ateliers",
    Icon: Palette,
    name: "Ateliers & Sport",
    desc: "Sport, arts, musique, danse, robotique, cuisine",
    count: "290+",
    color: "#DC2626",
    wide: false,
  },
  {
    slug: "fetes",
    Icon: Gift,
    name: "Fêtes & Événements",
    desc: "Organisateurs d'anniversaires, animateurs, photographes",
    count: "95+",
    color: "#DB2777",
    wide: false,
  },
  {
    slug: "shopping",
    Icon: ShoppingBag,
    name: "Shopping",
    desc: "Vêtements, jouets, puériculture, librairies jeunesse",
    count: "140+",
    color: "#0891B2",
    wide: false,
  },
];

export default function CategoriesGrid() {
  return (
    <section className="bg-white py-[64px]">
      <div className="max-w-[1140px] mx-auto px-5">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-[#F26522] mb-2">
          Explorer par catégorie
        </p>
        <h2 className="text-[clamp(24px,3.2vw,36px)] font-extrabold text-[#0D2461] leading-tight mb-2">
          Tout ce dont votre enfant a besoin
        </h2>
        <p className="text-[15px] text-gray-500 leading-relaxed max-w-[520px] mb-8">
          De la santé aux loisirs, retrouvez les meilleurs établissements et services près de chez vous.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => {
            const { Icon } = cat;
            return (
              <Link
                key={cat.slug}
                href={`/listings?cat=${cat.slug}`}
                className={`group bg-white border border-black/8 rounded-2xl p-5 hover:border-black/20 hover:shadow-lg transition-all duration-200 flex flex-col gap-3 ${
                  cat.wide ? "col-span-2 md:col-span-2" : ""
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: cat.color + "15" }}
                >
                  <Icon size={20} style={{ color: cat.color }} strokeWidth={1.75} />
                </div>

                <div className="flex-1">
                  <p className="text-[16px] font-bold text-[#111827] mb-0.5">{cat.name}</p>
                  <p className="text-[12px] text-gray-400 leading-relaxed">{cat.desc}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-400">{cat.count} établissements</span>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-[#F26522] group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
