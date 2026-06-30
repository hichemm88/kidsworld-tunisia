import Link from "next/link";
import { Heart, BookOpen, Zap, Palette, Gift, ShoppingBag, ArrowRight } from "lucide-react";

const CATEGORIES = [
  {
    slug: "sante",
    Icon: Heart,
    name: "Santé",
    desc: "Pédiatres, dentistes, ophtalmos, orthophonistes",
    count: "180+",
    color: "#10B981",
    light: "#ECFDF5",
  },
  {
    slug: "education",
    Icon: BookOpen,
    name: "Éducation",
    desc: "Crèches, maternelles, cours de langue, soutien scolaire",
    count: "320+",
    color: "#7C3AED",
    light: "#EDE9FE",
  },
  {
    slug: "loisirs",
    Icon: Zap,
    name: "Loisirs & Sorties",
    desc: "Parcs, espaces de jeux indoor, piscines, zoos, fermes pédagogiques",
    count: "210+",
    color: "#0EA5E9",
    light: "#E0F2FE",
  },
  {
    slug: "ateliers",
    Icon: Palette,
    name: "Ateliers & Sport",
    desc: "Sport, arts, musique, danse, robotique, cuisine créative",
    count: "290+",
    color: "#F43F5E",
    light: "#FFF1F2",
  },
  {
    slug: "fetes",
    Icon: Gift,
    name: "Fêtes & Événements",
    desc: "Organisateurs d'anniversaires, animateurs, photographes enfants",
    count: "95+",
    color: "#EC4899",
    light: "#FDF2F8",
  },
  {
    slug: "shopping",
    Icon: ShoppingBag,
    name: "Shopping",
    desc: "Vêtements, jouets, puériculture, librairies jeunesse",
    count: "140+",
    color: "#F59E0B",
    light: "#FFFBEB",
  },
];

export default function CategoriesGrid() {
  return (
    <section className="bg-white py-[72px]">
      <div className="max-w-[1140px] mx-auto px-5">
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold tracking-widest uppercase text-[#F26522] mb-2">
            Explorer par catégorie
          </p>
          <h2 className="text-[clamp(24px,3.2vw,36px)] font-extrabold text-[#0D2461] leading-tight mb-2">
            Tout ce dont votre enfant a besoin
          </h2>
          <p className="text-[15px] text-gray-400 leading-relaxed max-w-[440px] mx-auto">
            De la santé aux loisirs, les meilleurs établissements près de chez vous.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => {
            const { Icon } = cat;
            return (
              <Link
                key={cat.slug}
                href={`/listings?cat=${cat.slug}`}
                className="group relative overflow-hidden rounded-3xl p-6 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                style={{ background: cat.light }}
              >
                {/* Decorative circle */}
                <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full opacity-15"
                  style={{ background: cat.color }} />

                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{ background: cat.color }}>
                  <Icon size={22} color="white" strokeWidth={2} />
                </div>

                <div className="flex-1 relative z-10">
                  <p className="text-[17px] font-extrabold mb-1" style={{ color: cat.color }}>{cat.name}</p>
                  <p className="text-[12px] text-gray-500 leading-relaxed">{cat.desc}</p>
                </div>

                <div className="flex items-center justify-between relative z-10">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/70"
                    style={{ color: cat.color }}>
                    {cat.count} établissements
                  </span>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white/70 group-hover:bg-white transition-colors">
                    <ArrowRight size={13} style={{ color: cat.color }} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
