import type { Metadata, Viewport } from "next";
import { Nunito, Bebas_Neue } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import KiwoChat from "@/components/kiwo/KiwoChat";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["300", "400", "600", "700", "800"],
  display: "swap",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-bebas",
  weight: "400",
  display: "swap",
});

const BASE_URL = "https://kidsworld-tunisia.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0D2461",
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "KidsWorld Tunisia — L'annuaire des parents",
    template: "%s | KidsWorld Tunisia",
  },
  description:
    "Trouvez les meilleures activités, médecins, écoles et services pour vos enfants en Tunisie. L'annuaire N°1 des parents tunisiens.",
  keywords: [
    "enfants tunisie", "activités enfants tunis", "pédiatre tunis", "école maternelle tunisie",
    "anniversaire enfants tunis", "cours natation tunis", "ateliers enfants", "annuaire parents tunisie",
  ],
  authors: [{ name: "KidsWorld Tunisia" }],
  creator: "KidsWorld Tunisia",
  publisher: "KidsWorld Tunisia",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    title: "KidsWorld Tunisia — L'annuaire des parents",
    description: "L'annuaire complet de l'univers enfant en Tunisie. Médecins, écoles, activités, fêtes.",
    url: BASE_URL,
    siteName: "KidsWorld Tunisia",
    locale: "fr_TN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KidsWorld Tunisia",
    description: "L'annuaire N°1 des parents tunisiens",
  },
  alternates: { canonical: BASE_URL },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "KidsWorld Tunisia",
  url: BASE_URL,
  description: "L'annuaire N°1 des parents tunisiens — Trouvez les meilleurs services pour vos enfants",
  areaServed: { "@type": "Country", name: "Tunisie" },
  sameAs: ["https://www.facebook.com/kidsworldtunisia"],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "KidsWorld Tunisia",
  url: BASE_URL,
  inLanguage: "fr",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/listings?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      </head>
      <body className={`${nunito.variable} ${bebas.variable} font-nunito bg-[#F7F6F2] text-[#111827] antialiased`}>
        {children}
        <Footer />
        <KiwoChat />
      </body>
    </html>
  );
}
