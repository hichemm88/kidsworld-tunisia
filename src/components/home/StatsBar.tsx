const STATS = [
  { num: "449", label: "Établissements référencés" },
  { num: "6", label: "Catégories couvertes" },
  { num: "1 200+", label: "Avis vérifiés" },
  { num: "100%", label: "Gratuit pour les parents" },
];

export default function StatsBar() {
  return (
    <div className="bg-[#F7F6F2] border-b border-black/6">
      <div className="max-w-[1140px] mx-auto px-5 py-5 grid grid-cols-2 md:grid-cols-4">
        {STATS.map((s, i) => (
          <div
            key={i}
            className={`text-center py-3 ${i < STATS.length - 1 ? "border-r border-black/8" : ""}`}
          >
            <p className="text-[22px] font-extrabold text-[#0D2461] leading-none">
              {s.num}
            </p>
            <p className="text-[12px] text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
