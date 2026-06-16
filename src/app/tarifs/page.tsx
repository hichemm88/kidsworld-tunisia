import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import PricingPage from "@/components/payment/PricingPage";

export const metadata: Metadata = {
  title: "Tarifs Premium — KidsWorld Tunisia",
  description: "Boostez la visibilité de votre établissement avec KidsWorld Premium. Apparaissez en tête des résultats et gagnez plus de familles.",
  openGraph: {
    title: "Tarifs Premium — KidsWorld Tunisia",
    description: "Plans Premium pour établissements : mensuel 49 TND/mois, annuel 399 TND/an.",
  },
};

export default function TarifsPage() {
  return (
    <>
      <Navbar />
      <PricingPage />
    </>
  );
}
