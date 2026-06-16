"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, ChevronDown, Sparkles, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase-client";

interface Message {
  role: "user" | "kiwo";
  text: string;
  listings?: Array<{ nom: string; slug: string; emoji: string; ville: string; note_moyenne: number }>;
}

interface ChildContext {
  surnom: string;
  age: string;
  sexe: string;
}

function calculateAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
  if (months < 12) return `${months} mois`;
  const years = Math.floor(months / 12);
  return `${years} an${years > 1 ? "s" : ""}`;
}

const QUICK_QUESTIONS = [
  "🤒 Mon enfant a de la fièvre",
  "🎂 Organiser un anniversaire",
  "🏊 Cours natation Tunis",
  "📚 Maternelle bilingue",
  "🤖 Atelier robotique",
  "🤸 Activités weekend",
];

export default function KiwoChat() {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "kiwo",
      text: "Salut ! Je suis **Kiwo** 🐧, ton assistant KidsWorld.\n\nPose-moi n'importe quelle question sur tes enfants : activités, santé, écoles, fêtes... Je suis là pour t'aider personnellement !",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);
  const [children, setChildren] = useState<ChildContext[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load user's children on mount
  useEffect(() => {
    async function loadChildren() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("children")
          .select("surnom, date_naissance, sexe")
          .eq("user_id", user.id);
        if (data && data.length > 0) {
          const ctx = data.map((c: any) => ({
            surnom: c.surnom,
            age: calculateAge(c.date_naissance),
            sexe: c.sexe,
          }));
          setChildren(ctx);
          // Update greeting with child names
          const names = ctx.map((c) => c.surnom).join(" et ");
          setMessages([{
            role: "kiwo",
            text: `Salut ! Je suis **Kiwo** 🐧, ton assistant KidsWorld.\n\nJe vois que tu as **${names}** 👶. Je peux t'aider à trouver des activités, médecins, écoles ou idées de fêtes adaptées à eux !`,
          }]);
        }
      } catch {
        // Not logged in, keep default greeting
      }
    }
    loadChildren();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Build history for API (last 6 exchanges)
    const history = newMessages.slice(-12).map((m) => ({
      role: m.role,
      content: m.text,
    }));

    try {
      const res = await fetch("/api/kiwo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: history.slice(0, -1), // exclude the message we just added
          childrenContext: children,
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: "kiwo",
          text: data.reply || "Je n'ai pas compris, peux-tu reformuler ?",
          listings: data.listings,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "kiwo", text: "Désolé, une erreur s'est produite. Réessaie !" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    const greeting = children.length > 0
      ? `Salut ! Je suis **Kiwo** 🐧. Nouvelle conversation ! J'ai toujours les infos sur **${children.map(c => c.surnom).join(" et ")}**. Comment puis-je t'aider ?`
      : "Salut ! Je suis **Kiwo** 🐧. Nouvelle conversation ! Comment puis-je t'aider ?";
    setMessages([{ role: "kiwo", text: greeting }]);
  };

  const renderText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <>
      {/* Floating button — always on top */}
      <button
        onClick={() => { setOpen(true); setPulse(false); }}
        className={`fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-[#0D2461] text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${open ? "hidden" : "flex"}`}
        aria-label="Ouvrir Kiwo"
      >
        <span className="text-2xl">🐧</span>
        {pulse && (
          <span className="absolute inset-0 rounded-full border-4 border-[#F26522] animate-ping opacity-60" />
        )}
        <span className="absolute -top-1 -right-1 bg-[#F26522] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
          IA
        </span>
      </button>

      {/* Chat window — always on top */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-[9999] w-[360px] flex flex-col bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.22)] overflow-hidden border border-black/8"
          style={{ maxWidth: "calc(100vw - 24px)", maxHeight: "min(580px, calc(100vh - 32px))" }}
        >
          {/* Header */}
          <div className="bg-[#0D2461] px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">🐧</div>
            <div className="flex-1">
              <p className="font-extrabold text-white text-[14px] leading-tight">Kiwo</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-[11px] text-white/60">
                  {children.length > 0
                    ? `Connaît ${children.map(c => c.surnom).join(", ")}`
                    : "Assistant IA KidsWorld"}
                </span>
              </div>
            </div>
            <button onClick={clearChat} title="Nouvelle conversation"
              className="text-white/40 hover:text-white/80 transition-colors mr-1">
              <RefreshCw size={14} />
            </button>
            <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "kiwo" && (
                  <div className="w-7 h-7 rounded-full bg-[#0D2461]/10 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">🐧</div>
                )}
                <div className={`max-w-[78%] rounded-2xl px-3 py-2.5 text-[13px] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#0D2461] text-white rounded-br-sm"
                    : "bg-[#F7F6F2] text-[#111827] rounded-bl-sm"
                }`}>
                  <span dangerouslySetInnerHTML={{ __html: renderText(msg.text) }} />
                  {msg.listings && msg.listings.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      {msg.listings.slice(0, 3).map((l) => (
                        <a key={l.slug} href={`/listing/${l.slug}`}
                          className="flex items-center gap-2 bg-white rounded-xl px-2.5 py-2 hover:bg-orange-50 transition-colors border border-black/8 group">
                          <span className="text-base">{l.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold text-[#0D2461] truncate">{l.nom}</p>
                            <p className="text-[10px] text-gray-400">{l.ville} · ⭐ {Number(l.note_moyenne).toFixed(1)}</p>
                          </div>
                          <ChevronDown size={12} className="text-gray-300 group-hover:text-[#F26522] -rotate-90 transition-colors flex-shrink-0" />
                        </a>
                      ))}
                      {msg.listings.length > 3 && (
                        <a href="/listings" className="text-[11px] text-[#F26522] font-semibold text-center py-1 hover:underline">
                          Voir tous les résultats →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#0D2461]/10 flex items-center justify-center text-sm">🐧</div>
                <div className="bg-[#F7F6F2] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#0D2461]/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#0D2461]/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#0D2461]/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions — only at start */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide flex-shrink-0">
              {QUICK_QUESTIONS.map((q) => (
                <button key={q} onClick={() => send(q)}
                  className="flex-shrink-0 bg-[#F7F6F2] hover:bg-[#0D2461] hover:text-white text-[11px] font-semibold text-[#0D2461] px-3 py-1.5 rounded-full transition-all whitespace-nowrap border border-black/8">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-black/8 flex items-center gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Pose ta question à Kiwo..."
              className="flex-1 text-[13px] bg-[#F7F6F2] rounded-xl px-3 py-2.5 outline-none border border-transparent focus:border-[#0D2461]/30 transition-colors placeholder:text-gray-400"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-[#0D2461] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#F26522] transition-colors flex-shrink-0"
            >
              <Send size={15} />
            </button>
          </div>

          <div className="pb-2 flex justify-center flex-shrink-0">
            <span className="text-[10px] text-gray-300 flex items-center gap-1">
              <Sparkles size={9} /> Propulsé par Kiwo IA
            </span>
          </div>
        </div>
      )}
    </>
  );
}
