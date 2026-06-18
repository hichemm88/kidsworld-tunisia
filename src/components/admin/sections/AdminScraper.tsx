"use client";

import { useState } from "react";
import {
  Database,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  Phone,
  MapPin,
  Image,
  Clock,
  BarChart2,
  ExternalLink,
} from "lucide-react";

const CATEGORIES = [
  { slug: "sante",     nom: "SantÃ©",              emoji: "ð¥" },
  { slug: "education", nom: "Ãducation",           emoji: "ð" },
  { slug: "loisirs",   nom: "Loisirs",             emoji: "ðª" },
  { slug: "ateliers",  nom: "Ateliers & Sport",    emoji: "ð¨" },
  { slug: "fetes",     nom: "FÃªtes & ÃvÃ©nements",  emoji: "ð" },
  { slug: "shopping",  nom: "Shopping",            emoji: "ð" },
];

const CITIES = [
  "Tunis", "Ariana", "Ben Arous", "La Marsa", "La Soukra",
  "Sfax", "Sousse", "Nabeul", "Monastir", "Bizerte",
  "Hammamet", "GabÃ¨s", "Gafsa", "Kairouan", "MÃ©denine",
];

const COUNTS = [10, 25, 50];

interface ScrapedListing {
  id: string;
  nom: string;
  slug: string;
  adresse: string | null;
  phone: string | null;
  website: string | null;
  photos: number;
  hasHours: boolean;
}

export default function AdminScraper() {
  const [category, setCategory] = useState("loisirs");
  const [city, setCity] = useState("Tunis");
  const [count, setCount] = useState(50);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScrapedListing[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setResults(null);
    setErrors([]);
    setApiError(null);

    try {
      const res = await fetch("/api/admin/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, city, count }),
      });
      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || "Erreur serveur");
      } else {
        setResults(data.inserted || []);
        setErrors(data.errors || []);
      }
    } catch (e: any) {
      setApiError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedCat = CATEGORIES.find((c) => c.slug === category);

  return (
    <div className="p-8 space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-[#F26522]/10 flex items-center justify-center">
            <Database size={18} className="text-[#F26522]" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Import de donnÃ©es</h1>
        </div>
        <p className="text-sm text-gray-500 ml-12">
          Scrape des Ã©tablissements rÃ©els via Google Places et les insÃ¨re automatiquement dans la base de donnÃ©es.
        </p>
      </div>

      {/* Config card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-gray-700 mb-5 uppercase tracking-wider">
          ParamÃ¨tres de recherche
        </h2>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              CatÃ©gorie
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F26522]/30 focus:border-[#F26522] disabled:opacity-50"
            >
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.emoji} {c.nom}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Ville
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F26522]/30 focus:border-[#F26522] disabled:opacity-50"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Count */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Nombre de fiches
            </label>
            <div className="flex gap-2">
              {COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  disabled={loading}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all disabled:opacity-50 ${
                    count === n
                      ? "bg-[#F26522] text-white border-[#F26522]"
                      : "border-gray-200 text-gray-600 hover:border-[#F26522]/50"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview badge */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-lg">{selectedCat?.emoji}</span>
            <span>
              Recherche <strong>{count} fiches</strong> dans{" "}
              <strong>{selectedCat?.nom}</strong> Ã  <strong>{city}</strong>
            </span>
          </div>
          <span className="text-xs text-gray-400">via Google Places API</span>
        </div>

        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={loading}
          className="flex items-center gap-2 bg-[#F26522] hover:bg-[#d9551a] disabled:bg-gray-300 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Scraping en coursâ¦
            </>
          ) : (
            <>
              <Play size={16} />
              Lancer le scraping
            </>
          )}
        </button>
      </div>

      {/* API error */}
      {apiError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
          <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">Erreur</p>
            <p className="text-sm text-red-600 mt-0.5">{apiError}</p>
            {apiError.includes("GOOGLE_PLACES_API_KEY") && (
              <p className="text-xs text-red-500 mt-2">
                Ajoutez <code className="bg-red-100 px-1 rounded">GOOGLE_PLACES_API_KEY</code> dans vos variables d&apos;environnement Vercel.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Errors list */}
      {errors.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-amber-700 mb-2">
            {errors.length} erreur(s) partielles
          </p>
          <ul className="text-xs text-amber-600 space-y-0.5 max-h-32 overflow-y-auto">
            {errors.map((e, i) => (
              <li key={i} className="font-mono">â¢ {e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Results */}
      {results !== null && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Stats bar */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" />
              <span className="text-sm font-bold text-gray-900">{results.length} insÃ©rÃ©s</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Image size={14} />
              <span className="text-sm">{results.reduce((s, r) => s + r.photos, 0)} photos</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Phone size={14} />
              <span className="text-sm">{results.filter((r) => r.phone).length} avec tÃ©l</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Clock size={14} />
              <span className="text-sm">{results.filter((r) => r.hasHours).length} avec horaires</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Globe size={14} />
              <span className="text-sm">{results.filter((r) => r.website).length} avec site web</span>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              Aucun rÃ©sultat trouvÃ© pour cette combinaison catÃ©gorie / ville.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Ãtablissement</th>
                    <th className="px-4 py-3 text-left font-semibold">Adresse</th>
                    <th className="px-4 py-3 text-center font-semibold">TÃ©l</th>
                    <th className="px-4 py-3 text-center font-semibold">Site</th>
                    <th className="px-4 py-3 text-center font-semibold">Photos</th>
                    <th className="px-4 py-3 text-center font-semibold">Horaires</th>
                    <th className="px-4 py-3 text-center font-semibold">Lien</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 leading-tight">{r.nom}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{r.slug}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-1.5 text-gray-500">
                          <MapPin size={12} className="mt-0.5 shrink-0" />
                          <span className="text-xs leading-tight line-clamp-2 max-w-[180px]">
                            {r.adresse || "â"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.phone ? (
                          <span className="text-xs text-gray-700 font-mono">{r.phone}</span>
                        ) : (
                          <span className="text-gray-300">â</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.website ? (
                          <CheckCircle2 size={14} className="text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">â</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.photos > 0 ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            <Image size={10} />
                            {r.photos}
                          </span>
                        ) : (
                          <span className="text-gray-300">â</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.hasHours ? (
                          <CheckCircle2 size={14} className="text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">â</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <a
                          href={`/listing/${r.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#F26522] hover:underline"
                        >
                          <ExternalLink size={12} />
                          Voir
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Instructions when no run yet */}
      {results === null && !loading && !apiError && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <BarChart2 size={18} className="text-blue-400 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-700 space-y-1">
              <p className="font-semibold">DonnÃ©es rÃ©cupÃ©rÃ©es pour chaque fiche :</p>
              <ul className="text-blue-600 space-y-0.5 list-disc list-inside text-xs">
                <li>Nom, adresse complÃ¨te, coordonnÃ©es GPS (lat/lng)</li>
                <li>NumÃ©ro de tÃ©lÃ©phone (nul si introuvable)</li>
                <li>Site web, horaires d&apos;ouverture (7 jours)</li>
                <li>Jusqu&apos;Ã  5 photos rÃ©elles</li>
                <li>Description Ã©ditoriale si disponible</li>
              </ul>
              <p className="text-xs text-blue-500 mt-2">
                Requiert <code className="bg-blue-100 px-1 rounded">GOOGLE_PLACES_API_KEY</code> dans les variables d&apos;environnement Vercel.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
