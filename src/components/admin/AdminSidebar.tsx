"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import {
  LayoutDashboard,
  BarChart3,
  Building2,
  Users,
  Briefcase,
  Package,
  Tag,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  {
    group: "Vue d'ensemble",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/stats", label: "Statistiques", icon: BarChart3 },
    ],
  },
  {
    group: "Contenu",
    items: [
      { href: "/admin/listings", label: "Listings", icon: Building2 },
      { href: "/admin/parents", label: "Parents", icon: Users },
      { href: "/admin/pros", label: "Professionnels", icon: Briefcase },
    ],
  },
  {
    group: "Business",
    items: [
      { href: "/admin/packages", label: "Packages & Prix", icon: Package },
      { href: "/admin/promos", label: "Promotions", icon: Tag },
      { href: "/admin/payments", label: "Paiements", icon: CreditCard },
    ],
  },
  {
    group: "Plateforme",
    items: [
      { href: "/admin/pages", label: "Pages & Contenu", icon: FileText },
      { href: "/admin/settings", label: "Paramètres", icon: Settings },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <aside className="w-64 bg-[#0D2461] flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-[#F26522] rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-black text-[15px] leading-none">KidsWorld</p>
            <p className="text-white/40 text-[10px] uppercase tracking-widest mt-0.5">Admin</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_ITEMS.map((group) => (
          <div key={group.group}>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-2 mb-1.5">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href, item.exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all group ${
                      active
                        ? "bg-white/15 text-white"
                        : "text-white/50 hover:bg-white/8 hover:text-white/80"
                    }`}
                  >
                    <Icon size={15} className={active ? "text-[#F26522]" : "text-white/40 group-hover:text-white/60"} />
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight size={12} className="text-white/40" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-white/40 hover:bg-white/8 hover:text-white/60 transition-all mb-1"
        >
          <Building2 size={14} />
          <span>Voir le site</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-white/40 hover:bg-red-500/20 hover:text-red-300 transition-all"
        >
          <LogOut size={14} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
