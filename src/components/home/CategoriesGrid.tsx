import Link from "next/link";

const CATEGORIES = [
  {
    slug: "sante",
    emoji: "🏥",
    name: "Santé",
    desc: "Pédiatres, dentistes, ophtalmos, orthophonistes",
    count: "180+",
    bg: "from-[#E1F5EE] to-[#C6EDE0]",
    wide: false,
  },
  {
    slug: "education",
    emoji: "🎓",
    name: "Éducation",
    desc: "Crèches, maternelles, cours de langue, soutien scolaire",
    count: "320+",
    bg: "from-[#FEF9E4] to-[#FAEAC6]",
    wide: false,
  },
  {
    slug: "loisirs",
    emoji: "🎪",
    name: "Loisirs",
    desc: "Parcs, espaces de jeux indoor, piscines, zoos, fermes pédagogiques",
    count: "210+",
    bg: "from-[#DBEAFE] to-[#BFDBFE]",
    wide: true,
  },
  {
    slug: "ateliers",
    emoji: "🎨",
    name: "Ateliers & Sport",
    desc: "Sport, arts, musique, danse, robotique, cuisine",
    count: "290+",
    bg: "from-[#EDE9FE] to-[#DDD6FE]",
    wide: false,
  },
  {
    slug: "fetes",
    emoji: "🎂",
    name: "Fêtes & Événements",
    desc: "Organisateurs d'anniversaires, animateurs, photographes",
    count: "95+",
    bg: "from-[#FCE7F3] to-[#FBCFE8]",
    wide: false,
  },
  {
    slug: "shopping",
    emoji: "🛍",
    name: "Shopping",
    desc: "Vêtements, jouets, puériculture, librairies jeunesse",
    count: "140+",
    bg: "from-[#E4EFFE] to-[#C7D2FE]",
    wide: false,
  },
];

export default function CategoriesGrid() {
  return (
    <section className="bg-white py-[72px]">
      <div className="max-w-[1140px] mx-auto px-5">
        <p className="text-[11px] font-extrabold tracking-[0.12em] uppercase text-[#F26522] mb-2">
          Explorer par catégorie
        </p>
        <h2 className="font-bebas text-[clamp(28px,4vw,42px)] text-[#0D2461] tracking-wide leading-tight mb-2">
          Tout ce dont votre enfant a besoin
        </h2>
        <p className="text-[15px] text-gray-500 leading-relaxed max-w-[560px] mb-9">
          De la santé aux loisirs, retrouvez les meilleurs établissements et
          services sélectionnés pour vous.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/listings?cat=${cat.slug}`}
              className={`bg-gradient-to-br ${cat.bg} rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 border-[1.5px] border-transparent hover:border-black/10 relative overflow-hidden ${
                cat.wide ? "col-span-2 md:col-span-2" : ""
              }`}
            >
              <span className="text-4xl block mb-3">{cat.emoji}</span>
              <p className="text-[17px] font-extrabold text-[#111827] mb-1">
                {cat.name}
              </p>
              <p className="text-[12px] text-gray-500 mb-2 leading-relaxed">
                {cat.desc}
              </p>
              <p className="text-[11px] font-bold text-gray-400">
                {cat.count} établissements
              </p>
              <span className="absolute right-4 bottom-4 text-[22px] opacity-30">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
