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
      { key: "how_title", label: "Comment ca marche - titre", type: "text" },
    ],
  },
  {
    slug: "about",
    title: "A propos",
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
      { key: "phone", label: "Telephone", type: "text" },
      { key: "address", label: "Adresse", type: "textarea" },
    ],
  },
  {
    slug: "cgu",
    title: "Conditions generales",
    href: "/cgu",
    sections: [
      { key: "title", label: "Titre", type: "text" },
      { key: "content", label: "Contenu", type: "html" },
    ],
  },
  {
    slug: "privacy",
    title: "Politique de confidentialite",
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
          <h1 className="font-black text-[28px] text-[#0D2461] leading-none">Pages &amp; Contenu</h1>
        </div>
        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <p className="font-bold text-[15px] text-red-600 mb-2">Table manquante</p>
          <p className="text-[13px] text-gray-600 mb-4">
            Executez ce SQL dans Supabase :
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
          <button onClick={load} className="mt-4 px-4 py-2 bg-[#0D2461] text-white rounded-xl text-[13px] font-bold hover:bg-[#1a3a8a] transition-all">
            Reessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-[28px] text-[#0D2461] leading-none">Pages &amp; Contenu</h1>
          <p className="text-gray-400 text-[13px] mt-1">Edition des textes de chaque page</p>
        </div>
      </div>

      <div className="space-y-3">
        {PAGES.map((page) => {
          const isOpen = expandedPage === page.slug;
          const isSaving = saving === page.slug;
          const isSaved = saved === page.slug;

          return (
            <div key={page.slug} className="bg-white rounded-2xl border border-black/8 overflow-hidden">
              <button
                onClick={() => setExpandedPage(isOpen ? null : page.slug)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#F7F6F2] transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-[#0D2461]/8 flex items-center justify-center shrink-0">
                  <FileText size={15} className="text-[#0D2461]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-[14px] text-[#0D2461]">{page.title}</p>
                  <p className="text-[11px] text-gray-400 font-mono">{page.href}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">{page.sections.length} sections</span>
                  <a
                    href={page.href}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="w-7 h-7 rounded-lg bg-[#F7F6F2] flex items-center justify-center text-gray-400 hover:bg-[#0D2461] hover:text-white transition-all"
                  >
                    <Eye size={12} />
                  </a>
                  {isOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-black/6 px-5 py-4">
                  <div className="space-y-4">
                    {page.sections.map((section) => (
                      <div key={section.key}>
                        <label className="text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">
                          {section.label}
                        </label>
                        {section.type === "text" ? (
                          <input
                            type="text"
                            value={content[key(page.slug, section.key)] || ""}
                            onChange={(e) => updateField(page.slug, section.key, e.target.value)}
                            className="w-full border border-black/12 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0D2461]/30"
                          />
                        ) : section.type === "textarea" ? (
                          <textarea
                            value={content[key(page.slug, section.key)] || ""}
                            onChange={(e) => updateField(page.slug, section.key, e.target.value)}
                            rows={3}
                            className="w-full border border-black/12 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#0D2461]/30 resize-none"
                          />
                        ) : (
                          <div>
                            <textarea
                              value={content[key(page.slug, section.key)] || ""}
                              onChange={(e) => updateField(page.slug, section.key, e.target.value)}
                              rows={8}
                              className="w-full border border-black/12 rounded-xl px-3 py-2 text-[12px] font-mono outline-none focus:border-[#0D2461]/30 resize-y"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">HTML supporte</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-black/6">
                    <button
                      onClick={() => savePage(page)}
                      disabled={isSaving}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                        isSaved ? "bg-green-500 text-white" : "bg-[#0D2461] text-white hover:bg-[#1a3a8a]"
                      } disabled:opacity-60`}
                    >
                      {isSaving ? <Loader2 size={13} className="animate-spin" /> : isSaved ? <Check size={13} /> : <Save size={13} />}
                      {isSaved ? "Sauvegarde !" : isSaving ? "Sauvegarde..." : "Sauvegarder"}
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
