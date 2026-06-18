"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import {
  FileText, Edit3, Eye, Check, X, Loader2,
  ChevronDown, ChevronUp, Save,
} from "lucide-react";

interface Section {
  key: string;
  label: string;
  type: "text" | "textarea" | "html";
}

interface PageDef {
  slug: string;
  title: string;
  href: string;
  sections: Section[];
}

const PAGES: PageDef[] = [
  {
    slug: "home",
    title: "Page d'accueil",
    href: "/",
    sections: [
      { key: "hero_title", label: "Titre principal", type: "text" },
      { key: "hero_subtitle", label: "Sous-titre", type: "textarea" },
      { key: "hero_cta", label: "Texte du bouton principal", type: "text" },
      { key: "stats_listings", label: "Stat : nombre de listings", type: "text" },
      { key: "stats_cities", label: "Stat : nombre de villes", type: "text" },
      { key: "stats_label", label: "Stat : label principal", type: "text" },
      { key: "how_title", label: "\"Comment ça marche\" — titre", type: "text" },
    ],
  },
  {
    slug: "about",
    title: "À propos",
    href: "/a-propos",
    sections: [
      { key: "title", label: "Titre", type: "text" },
      { key: "mission", label: "Notre mission", type: "textarea" },
      { key: "description", label: "Description", type: "html" },
    ],
  },
  {
    slug: "contact",
    title: "Contact",
    href: "/contact",
    sections: [
      { key: "title", label: "Titre", type: "text" },
      { key: "subtitle", label: "Sous-titre", type: "text" },
      { key: "email", label: "Email de contact", type: "text" },
      { key: "phone", label: "Téléphone", type: "text" },
      { key: "address", label: "Adresse", type: "textarea" },
    ],
  },
  {
    slug: "cgu",
    title: "Conditions générales",
    href: "/cgu",
    sections: [
      { key: "title", label: "Titre", type: "text" },
      { key: "content", label: "Contenu", type: "html" },
    ],
  },
  {
    slug: "privacy",
    title: "Politique de confidentialité",
    href: "/confidentialite",
    sections: [
      { key: "title", label: "Titre", type: "text" },
      { key: "content", label: "Contenu", type: "html" },
    ],
  },
];

export default function AdminPages() {
  const supabase = createClient();
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [expandedPage, setExpandedPage] = useState<string | null>("home");
  const [dbMissing, setDbMissing] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("page_content")
      .select("page_slug, section_key, content");

    if (error?.message?.includes("does not exist")) {
      setDbMissing(true);
      setLoading(false);
      return;
    }

    const map: Record<string, string> = {};
    (data || []).forEach((row) => {
      map[`${row.page_slug}__${row.section_key}`] = row.content || "";
    });
    setContent(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const key = (pageSlug: string, sectionKey: string) => `${pageSlug}__${sectionKey}`;

  const updateField = (pageSlug: string, sectionKey: string, value: string) => {
    setContent((c) => ({ ...c, [key(pageSlug, sectionKey)]: value }));
  };

  const savePage = async (page: PageDef) => {
    setSaving(page.slug);
    const upserts = page.sections.map((s) => ({
      page_slug: page.slug,
      section_key: s.key,
      content: content[key(page.slug, s.key)] || "",
      updated_at: new Date().toISOString(),
    }));
    await supabase.from("page_content").upsert(upserts, { onConflict: "page_slug,section_key" });
    setSaving(null);
    setSaved(page.slug);
    setTimeout(() => setSaved(null), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-[#0D2461]" />
      </div>
    );
  }

  if (dbMissing) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="font-black text-[28px] text-[#0D2461] leading-none">Pages & Contenu</h1>
        </div>
        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <p className="font-bold text-[15px] text-red-600 mb-2">⚠️ Table manquante</p>
          <p className="text-[13px] text-gray-600 mb-4">
            Exécutez le SQL suivant dans l&apos;éditeur SQL de Supabase :
          </p>
          <pre className="bg-[#F7F6F2] rounded-xl p-4 text-[11px] font-mono text-gray-700 overflow-x-auto whitespace-pre-wrap">
{`CREATE TABLE page_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug TEXT NOT NULL,
  section_key TEXT NOT NULL,
  content TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_slug, section_key)
);
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all" ON page_content USING (true) WITH CHECK (true);`}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-black text-[28px] text-[#0D2461] leading-none">Pages & Contenu</h1>
        <p className="text-[13px] text-gray-500 mt-1">Éditez le contenu de chaque page du site</p>
      </div>
      <div className="space-y-3">
        {PAGES{map((page) => {
          const isOpen = expandedPage === page.slug;
          const isSavingPage = saving === page.slug;
          const isSavedPage = saved === page.slug;
          return (
            <div key={page.slug} className="bg-white rounded-2xl border border-gray-150 overflow-hidden">
              {{/* Page header */}}
              <button
                onClick={() => setExpandedPage(isOpen ? null : page.slug)}
                className="w-full flex items-center justify-between p-5 hover:`��� transition"
              >
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-[#0D2461]" />
                  <div>
                    <p className="font-semibold text-[14px] text-[#0D2461]">{page.title}</p>
                    <p className="text-[12px] text-gray-400">{page.href} &mdash; {page.sections.length} sections</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isSavedPage && <span className="text-[12px] text-green-600 font-medium">✓ Enregistré</span>}
                  {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-gray-100 p-5 space-y-4">
                  {page.sections.map((section) => (
                    <div key={section.key}>
                      <label className="block text-[12px] font-semibold text-gray-600 mb-1">
                        {section.label}
                        <span className="ml-1 text-gray-350 font-normal">(+font-mono} {section.type}</span>
                      </label>
                      {section.type === "text" ? (
                        <input
                          value={content[key(page.slug, section.key)] || ""}
                          onChange={e => updateField(page.slug, section.key, e.target.value)}
                          className="width-full border border-gray-200 rounded-xl px-3 py-2 text-[13px]"
                        />
                      ) : (
                        <textarea
                          rows={section.type === "html" ? 8 : 3}
                          value={content[key(page.slug, section.key)] || ""}
                          onChange={e => updateField(page.slug, section.key, e.target.value)}
                          className="width-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] resize-y font-mono text-[12px]"
                        />
                      )}
                    </div>
                  ))}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => savePage(page)}
                      disabled={isSavingPage}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D2461] text-white text-[13px] font-semibold hover:opacity-90 transition disabled:opacity-50">
                        {isSavingPage ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Enregistrer
                      </button>
                    </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
