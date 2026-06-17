"use client";

import { useState } from "react";
import { FileText, Edit3, Eye, Check, X } from "lucide-react";

const PAGES = [
  {
    id: "home",
    title: "Page d'accueil",
    slug: "/",
    sections: ["Hero", "Catégories", "Listings mis en avant", "Comment ça marche", "CTA inscription"],
    lastEdited: "2025-01-10",
    status: "published",
  },
  {
    id: "about",
    title: "À propos",
    slug: "/a-propos",
    sections: ["Mission", "Équipe", "Chiffres clés"],
    lastEdited: "2025-01-05",
    status: "published",
  },
  {
    id: "contact",
    title: "Contact",
    slug: "/contact",
    sections: ["Formulaire", "Coordonnées", "FAQ"],
    lastEdited: "2025-01-03",
    status: "published",
  },
  {
    id: "cgu",
    title: "Conditions générales",
    slug: "/cgu",
    sections: ["Texte légal"],
    lastEdited: "2024-12-20",
    status: "published",
  },
  {
    id: "privacy",
    title: "Politique de confidentialité",
    slug: "/confidentialite",
    sections: ["Texte légal", "Cookies"],
    lastEdited: "2024-12-20",
    status: "published",
  },
];

export default function AdminPages() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const startEdit = (page: typeof PAGES[0]) => {
    setEditingId(page.id);
    setEditTitle(page.title);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-black text-[28px] text-[#0D2461] leading-none">Pages & Contenu</h1>
        <p className="text-gray-400 text-[13px] mt-1">Gestion des pages de la plateforme</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 text-[13px] text-blue-700">
        💡 L&apos;éditeur visuel de contenu est en cours de développement. Vous pourrez modifier les sections de chaque page directement depuis cette interface.
      </div>

      <div className="grid gap-3">
        {PAGES.map((page) => (
          <div key={page.id} className="bg-white rounded-2xl border border-black/8 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#0D2461]/8 flex items-center justify-center shrink-0">
              <FileText size={18} className="text-[#0D2461]" />
            </div>

            <div className="flex-1 min-w-0">
              {editingId === page.id ? (
                <div className="flex items-center gap-2 mb-1">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="border border-black/15 rounded-lg px-2 py-1 text-[14px] font-bold outline-none focus:border-[#0D2461]/30"
                    autoFocus
                  />
                  <button onClick={() => setEditingId(null)} className="text-green-600"><Check size={14} /></button>
                  <button onClick={() => setEditingId(null)} className="text-gray-400"><X size={14} /></button>
                </div>
              ) : (
                <p className="font-bold text-[14px] text-[#0D2461] mb-0.5">{page.title}</p>
              )}
              <p className="text-[11px] text-gray-400 font-mono">{page.slug}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {page.sections.map((s) => (
                  <span key={s} className="text-[10px] bg-[#F7F6F2] text-gray-500 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-gray-400">{new Date(page.lastEdited).toLocaleDateString("fr-FR")}</span>
              <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Publié</span>
              <a
                href={page.slug}
                target="_blank"
                className="w-8 h-8 rounded-xl bg-[#F7F6F2] flex items-center justify-center text-gray-400 hover:bg-[#0D2461] hover:text-white transition-all"
                title="Voir"
              >
                <Eye size={13} />
              </a>
              <button
                onClick={() => startEdit(page)}
                className="w-8 h-8 rounded-xl bg-[#F7F6F2] flex items-center justify-center text-gray-400 hover:bg-[#F26522] hover:text-white transition-all"
                title="Modifier"
              >
                <Edit3 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
