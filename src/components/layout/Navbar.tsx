"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, User, LayoutDashboard, Heart, LogOut, Crown, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const NAV_LINKS = [
  { label: "Activités", href: "/listings?cat=ateliers" },
  { label: "Santé", href: "/listings?cat=sante" },
  { label: "Éducation", href: "/listings?cat=education" },
  { label: "Fêtes", href: "/listings?cat=fetes" },
  { label: "Shopping", href: "/listings?cat=shopping" },
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
    <nav className={`sticky top-0 z-50 bg-[#071640] transition-shadow ${scrolled ? "shadow-[0_4px_20px_rgba(0,0,0,0.25)]" : ""}`}>
      <div className="max-w-[1140px] mx-auto px-5 flex items-center gap-4 py-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-[11px] font-extrabold text-[#0D2461] italic">
            K<span className="text-[#F26522]">W</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bebas text-[18px] tracking-[2px] text-white leading-none">KidsWorld</span>
            <span className="text-[9px] text-white/40 tracking-wider">L&apos;annuaire des parents</span>
          </div>
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden md:flex gap-1 ml-6">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href}
              className="text-[13px] font-semibold text-white/70 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap">
              {link.label}
            </Link>
          ))}
          <Link href="/tarifs"
            className="text-[13px] font-semibold text-[#F5C518] hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1">
            <Crown size={12} /> Premium
          </Link>
        </div>

        {/* Right */}
        <div className="ml-auto flex items-center gap-2">
          {!loading && (
            <>
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all">
                    <div className="w-6 h-6 rounded-full bg-[#F26522] flex items-center justify-center text-[11px] font-extrabold text-white">
                      {user.email?.[0].toUpperCase() ?? "U"}
                    </div>
                    <span className="hidden md:block text-[13px] font-semibold text-white max-w-[100px] truncate">
                      {user.email?.split("@")[0]}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-black/8 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-black/8">
                        <p className="text-[12px] font-bold text-[#111827] truncate">{user.email}</p>
                        <p className="text-[11px] text-gray-400">Compte connecté</p>
                      </div>
                      {[
                        { icon: <User size={14} />, label: "Mon profil", href: "/profil" },
                        { icon: <LayoutDashboard size={14} />, label: "Dashboard pro", href: "/dashboard" },
                        { icon: <Heart size={14} />, label: "Mes favoris", href: "/profil" },
                        { icon: <Plus size={14} />, label: "Ajouter un listing", href: "/dashboard/nouveau-listing" },
                      ].map((item, i) => (
                        <Link key={i} href={item.href} onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#F7F6F2] transition-colors text-[13px] font-semibold text-gray-600">
                          <span className="text-gray-400">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                      <button onClick={signOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 transition-colors text-[13px] font-semibold text-red-500 border-t border-black/8">
                        <LogOut size={14} /> Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/auth/login"
                    className="hidden md:flex text-[12px] font-bold text-white border border-white/30 px-4 py-1.5 rounded-lg hover:bg-white/10 transition-all">
                    Connexion
                  </Link>
                  <Link href="/auth/signup?role=pro"
                    className="hidden md:flex text-[12px] font-bold text-white bg-[#F26522] px-4 py-1.5 rounded-lg hover:bg-[#FF8C4B] transition-all whitespace-nowrap">
                    Inscrire mon établissement
                  </Link>
                </>
              )}
            </>
          )}

          <button className="md:hidden text-white p-1" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#071640] border-t border-white/10 px-5 py-4 flex flex-col gap-2">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
              className="text-[14px] font-semibold text-white/80 py-2 border-b border-white/10">
              {link.label}
            </Link>
          ))}
          <Link href="/tarifs" onClick={() => setMenuOpen(false)}
            className="text-[14px] font-semibold text-[#F5C518] py-2 border-b border-white/10 flex items-center gap-1">
            <Crown size={14} /> Premium
          </Link>
          <div className="flex flex-col gap-2 mt-2">
            {user ? (
              <>
                <Link href="/profil" onClick={() => setMenuOpen(false)}
                  className="text-[13px] font-bold text-white border border-white/30 py-2 rounded-lg text-center">
                  Mon profil
                </Link>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                  className="text-[13px] font-bold text-white border border-white/30 py-2 rounded-lg text-center">
                  Dashboard
                </Link>
                <button onClick={signOut}
                  className="text-[13px] font-bold text-red-400 border border-red-400/30 py-2 rounded-lg">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMenuOpen(false)}
                  className="text-[13px] font-bold text-white border border-white/30 py-2 rounded-lg text-center">
                  Connexion
                </Link>
                <Link href="/auth/signup?role=pro" onClick={() => setMenuOpen(false)}
                  className="text-[13px] font-bold text-white bg-[#F26522] py-2 rounded-lg text-center">
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
