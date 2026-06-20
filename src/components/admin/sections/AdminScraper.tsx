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
  { slug: "sante",     nom: "Santé",              emoji: "🏥" },
  { slug: "education", nom: "Éducation",           emoji: "🎓" },
  { slug: "loisirs",   nom: "Loisirs",             emoji: "🎪" },
  { slug: "ateliers",  nom: "Ateliers & Sport",    emoji: "🎨" },
  { slug: "fetes",     nom: "Fêtes & Événements",  emoji: "🎂" },
  { slug: "shopping",  nom: "Shopping",            emoji: "🛍" },
];

const CITIES = [
  "Tunis", "Ariana", "Ben Arous", "La Marsa", "La Soukra",
  "Manouba", "Sfax", "Sousse", "Nabeul", "Monastir",
  "Bizerte", "Hammamet", "Gabès", "Kairouan",
];

const COUNTS = [10, 25, 50, 100];

interface ScrapedListing {
  id: string;
  nom: string;
  slug: string;
  adresse: string | null;
  phone: string | null;
  website: string | null;
  hasHours: boolean;
  lat: number | null;
  lng: number | null;
}

export default function AdminScraper() {
  const [category, setCategory] = useState("loisirs");
  const [city, setCity] = useState("Tunis");
  const [count, setCount] = useState(50);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScrapedListing[] | null>(null);
  const [skippedCount, setSkippedCount] = useState(0);
  const [totalFound, setTotalFound] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setResults(null);
    setErrors([]);
    setApiError(null);
    setSkippedCount(0);
    setTotalFound(0);

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
        setSkippedCount(data.skipped_count || 0);
        setTotalFound(data.total_found || 0);
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
          <h1 className="text-2xl font-black text-gray-900">Import de données</h1>
        </div>
        <p className="text-sm text-gray-500 ml-12">
          Scrape des établissements réels via Google Places et les insère automatiquement dans la base de données.
        </p>
      </div>

      {/* Config card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-gray-700 mb-5 uppercase tracking-wider">
          Paramètres de recherche
        </h2>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Catégorie
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
              <strong>{selectedCat?.nom}</strong> à <strong>{city}</strong>
            </span>
          </div>
          <span className="text-xs text-gray-400 flex items-center gap-1"><Globe size={11} /> OpenStreetMap — gratuit, aucune clé</span>
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
              Scraping en cours…
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
              <li key={i} className="font-mono">• {e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Results */}
      {results !== null && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Stats bar */}
          <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" />
              <span className="text-sm font-bold text-gray-900">{results.length} insérés</span>
            </div>
            {skippedCount > 0 && (
              <div className="flex items-center gap-2 text-amber-500">
                <AlertCircle size={14} />
                <span className="text-sm">{skippedCount} doublons ignorés</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-400">
              <BarChart2 size={14} />
              <span className="text-sm">{totalFound} trouvés dans OSM</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Phone size={14} />
              <span className="text-sm">{results.filter((r) => r.phone).length} avec tél</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Clock size={14} />
              <span className="text-sm">{results.filter((r) => r.hasHours).length} avec horaires</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Globe size={14} />
              <span className="text-sm">{results.filter((r) => r.website).length} avec site</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <MapPin size={14} />
              <span className="text-sm">{results.filter((r) => r.lat).length} avec GPS</span>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              Aucun résultat trouvé pour cette combinaison catégorie / ville.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Établissement</th>
                    <th className="px-4 py-3 text-left font-semibold">Adresse</th>
                    <th className="px-4 py-3 text-center font-semibold">Tél</th>
                    <th className="px-4 py-3 text-center font-semibold">Site</th>
                    <th className="px-4 py-3 text-center font-semibold">GPS</th>
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
                            {r.adresse || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.phone ? (
                          <span className="text-xs text-gray-700 font-mono">{r.phone}</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.website ? (
                          <CheckCircle2 size={14} className="text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.lat ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            <MapPin size={10} /> GPS
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.hasHours ? (
                          <CheckCircle2 size={14} className="text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
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
              <p className="font-semibold">Source : OpenStreetMap via Overpass API</p>
              <ul className="text-blue-600 space-y-0.5 list-disc list-inside text-xs">
                <li>Aucune cle API requise — 100% gratuit</li>
                <li>Nom officiel, adresse, coordonnees GPS</li>
                <li>Numero de telephone (null si absent dans OSM)</li>
                <li>Site web quand disponible</li>
                <li>Horaires d&apos;ouverture (7 jours) si renseignes dans OSM</li>
                <li>Doublons automatiquement ignores</li>
              </ul>
              <p className="text-xs text-blue-500 mt-2">
                Astuce : Lancez plusieurs fois avec differentes categories pour enrichir la base.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
