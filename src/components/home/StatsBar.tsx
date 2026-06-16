const STATS = [
  { num: "1 200+", label: "Établissements référencés" },
  { num: "24", label: "Catégories couvertes" },
  { num: "8 500+", label: "Avis vérifiés" },
  { num: "100%", label: "Gratuit pour les parents" },
];

export default function StatsBar() {
  return (
    <div className="bg-[#F26522] py-5">
      <div className="max-w-[1140px] mx-auto px-5 grid grid-cols-2 md:grid-cols-4">
        {STATS.map((s, i) => (
          <div
            key={i}
            className={`text-center py-2 ${
              i < STATS.length - 1 ? "border-r border-white/20" : ""
            }`}
          >
            <p className="font-bebas text-4xl text-white tracking-wide leading-none">
              {s.num}
            </p>
            <p className="text-[12px] text-white/80 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
