"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, User, LayoutDashboard, Heart, LogOut, Crown, Plus,
  Zap, BookOpen, Palette, Gift, ShoppingBag, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const NAV_LINKS = [
  { label: "Loisirs",     href: "/listings?cat=loisirs",   color: "#0EA5E9", dot: "bg-sky-400" },
  { label: "Santé",       href: "/listings?cat=sante",     color: "#10B981", dot: "bg-emerald-400" },
  { label: "Éducation",   href: "/listings?cat=education", color: "#7C3AED", dot: "bg-violet-400" },
  { label: "Ateliers",    href: "/listings?cat=ateliers",  color: "#F43F5E", dot: "bg-rose-400" },
  { label: "Fêtes",       href: "/listings?cat=fetes",     color: "#EC4899", dot: "bg-pink-400" },
  { label: "Shopping",    href: "/listings?cat=shopping",  color: "#F59E0B", dot: "bg-amber-400" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 bg-white transition-all ${scrolled ? "shadow-[0_2px_20px_rgba(0,0,0,0.08)]" : "border-b border-black/6"}`}>
      <div className="max-w-[1180px] mx-auto px-5 flex items-center gap-3 py-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 mr-2">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-extrabold text-[13px] italic"
            style={{ background: "linear-gradient(135deg, #0D2461 0%, #F26522 100%)" }}>
            K<span className="text-white/80">W</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bebas text-[19px] tracking-[2px] text-[#0D2461] leading-none">KidsWorld</span>
            <span className="text-[8px] text-gray-400 tracking-wider uppercase">Tunisie</span>
          </div>
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden md:flex gap-0.5 ml-2">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href}
              className="group flex items-center gap-1.5 text-[12.5px] font-semibold text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-all whitespace-nowrap">
              <span className={`w-1.5 h-1.5 rounded-full ${link.dot} group-hover:scale-125 transition-transform flex-shrink-0`} />
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="ml-auto flex items-center gap-2">
          <Link href="/listings"
            className="hidden md:flex items-center gap-1.5 text-[12.5px] font-semibold text-gray-500 hover:text-[#0D2461] px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-all">
            <Search size={13} />
            <span>Rechercher</span>
          </Link>

          <Link href="/tarifs"
            className="hidden md:flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-full border-2 border-[#F5C518]/50 text-[#B8941A] bg-[#FFFBEB] hover:bg-[#FEF3C7] transition-all">
            <Crown size={12} /> Premium
          </Link>

          {!loading && (
            <>
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 bg-[#0D2461] hover:bg-[#1a3a8a] px-3 py-1.5 rounded-full transition-all">
                    <div className="w-6 h-6 rounded-full bg-[#F26522] flex items-center justify-center text-[11px] font-extrabold text-white">
                      {user.email?.[0].toUpperCase() ?? "U"}
                    </div>
                    <span className="hidden md:block text-[12px] font-semibold text-white max-w-[90px] truncate">
                      {user.email?.split("@")[0]}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-black/6 overflow-hidden z-50">
                      <div className="px-4 py-3 bg-gradient-to-r from-[#0D2461]/5 to-[#F26522]/5 border-b border-black/6">
                        <p className="text-[12px] font-bold text-[#111827] truncate">{user.email}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Compte connecté</p>
                      </div>
                      {[
                        { icon: <User size={14} />,            label: "Mon profil",         href: "/profil",                   color: "#7C3AED" },
                        { icon: <LayoutDashboard size={14} />, label: "Dashboard pro",       href: "/dashboard",                color: "#0EA5E9" },
                        { icon: <Heart size={14} />,           label: "Mes favoris",         href: "/favoris",                  color: "#F43F5E" },
                        { icon: <Plus size={14} />,            label: "Ajouter un listing",  href: "/dashboard/nouveau-listing", color: "#10B981" },
                      ].map((item, i) => (
                        <Link key={i} href={item.href} onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                            style={{ background: item.color + "15", color: item.color }}>
                            {item.icon}
                          </div>
                          <span className="text-[13px] font-semibold text-gray-600 group-hover:text-gray-900">{item.label}</span>
                        </Link>
                      ))}
                      <button onClick={signOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-red-500 border-t border-black/6">
                        <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                          <LogOut size={14} />
                        </div>
                        <span className="text-[13px] font-semibold">Déconnexion</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/auth/login"
                    className="hidden md:flex text-[12px] font-bold text-[#0D2461] border-2 border-[#0D2461]/20 px-4 py-1.5 rounded-full hover:border-[#0D2461]/50 hover:bg-[#0D2461]/5 transition-all">
                    Connexion
                  </Link>
                  <Link href="/auth/signup?role=pro"
                    className="hidden md:flex text-[12px] font-bold text-white bg-[#F26522] px-4 py-1.5 rounded-full hover:bg-[#e05a1a] transition-all whitespace-nowrap shadow-[0_4px_12px_rgba(242,101,34,0.3)]">
                    Inscrire mon établissement
                  </Link>
                </>
              )}
            </>
          )}

          <button className="md:hidden text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-black/6 px-4 py-4 flex flex-col gap-1.5">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              <span className={`w-2 h-2 rounded-full ${link.dot}`} />
              {link.label}
            </Link>
          ))}
          <Link href="/tarifs" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[14px] font-semibold text-[#B8941A] bg-[#FFFBEB]">
            <Crown size={14} /> Premium
          </Link>
          <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-black/6">
            {user ? (
              <>
                <Link href="/profil" onClick={() => setMenuOpen(false)}
                  className="text-[13px] font-bold text-[#0D2461] border-2 border-[#0D2461]/20 py-2.5 rounded-2xl text-center">
                  Mon profil
                </Link>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                  className="text-[13px] font-bold text-white bg-[#0D2461] py-2.5 rounded-2xl text-center">
                  Dashboard
                </Link>
                <button onClick={signOut}
                  className="text-[13px] font-bold text-red-500 border-2 border-red-200 py-2.5 rounded-2xl">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMenuOpen(false)}
                  className="text-[13px] font-bold text-[#0D2461] border-2 border-[#0D2461]/20 py-2.5 rounded-2xl text-center">
                  Connexion
                </Link>
                <Link href="/auth/signup?role=pro" onClick={() => setMenuOpen(false)}
                  className="text-[13px] font-bold text-white bg-[#F26522] py-2.5 rounded-2xl text-center shadow-[0_4px_12px_rgba(242,101,34,0.3)]">
                  Inscrire mon établissement
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
