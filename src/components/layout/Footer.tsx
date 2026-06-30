import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

const LINKS = {
  parents: [
    { label: "Rechercher un listing", href: "/listings" },
    { label: "Mon profil", href: "/profil" },
    { label: "Mes favoris", href: "/profil" },
    { label: "Parler à Kiwo IA", href: "#kiwo" },
  ],
  pros: [
    { label: "Inscrire mon établissement", href: "/auth/signup?role=pro" },
    { label: "Dashboard professionnel", href: "/dashboard" },
    { label: "Offres Premium", href: "/tarifs" },
    { label: "Gérer mon listing", href: "/dashboard" },
  ],
  kidsworld: [
    { label: "À propos", href: "/a-propos" },
    { label: "Contact", href: "/contact" },
    { label: "Mentions légales", href: "/mentions-legales" },
    { label: "Politique de confidentialité", href: "/confidentialite" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#071640] text-white">
      <div className="max-w-[1140px] mx-auto px-5 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Image src="/logo.svg" alt="KidsWorld Tunisia" width={40} height={40} className="rounded-xl" />
              <div>
                <p className="font-bebas text-[20px] tracking-[2px] leading-none">KidsWorld</p>
                <p className="text-[10px] text-white/40 tracking-wider">Tunisia</p>
              </div>
            </Link>
            <p className="text-[13px] text-white/50 leading-relaxed mb-6">
              L&apos;annuaire N°1 des parents tunisiens. Trouvez les meilleurs services pour vos enfants.
            </p>
            <div className="flex gap-3">
              {[
                { icon: <Facebook size={16} />, href: "https://facebook.com/kidsworldtunisia" },
                { icon: <Instagram size={16} />, href: "https://instagram.com/kidsworldtunisia" },
                { icon: <Youtube size={16} />, href: "https://youtube.com/@kidsworldtunisia" },
              ].map(({ icon, href }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#F26522] flex items-center justify-center transition-colors">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="font-bebas text-[15px] tracking-wider text-white/80 mb-4">Pour les parents</p>
            <ul className="flex flex-col gap-2">
              {LINKS.parents.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[13px] text-white/50 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-bebas text-[15px] tracking-wider text-white/80 mb-4">Pour les pros</p>
            <ul className="flex flex-col gap-2">
              {LINKS.pros.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[13px] text-white/50 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-bebas text-[15px] tracking-wider text-white/80 mb-4">KidsWorld</p>
            <ul className="flex flex-col gap-2 mb-6">
              {LINKS.kidsworld.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[13px] text-white/50 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2">
              <a href="mailto:contact@kidsworldtunisia.tn"
                className="flex items-center gap-2 text-[12px] text-white/40 hover:text-white/70 transition-colors">
                <Mail size={13} /> contact@kidsworldtunisia.tn
              </a>
              <a href="tel:+21671000000"
                className="flex items-center gap-2 text-[12px] text-white/40 hover:text-white/70 transition-colors">
                <Phone size={13} /> +216 71 000 000
              </a>
              <p className="flex items-center gap-2 text-[12px] text-white/40">
                <MapPin size={13} /> Tunis, Tunisie
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-white/30">
            © {new Date().getFullYear()} KidsWorld Tunisia — Tous droits réservés
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[11px] text-white/30">Opérationnel · Hébergé sur Vercel</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
