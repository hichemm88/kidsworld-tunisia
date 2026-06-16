import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import PaymentFailure from "@/components/payment/PaymentFailure";

export const metadata: Metadata = {
  title: "Paiement échoué — KidsWorld Tunisia",
  robots: { index: false, follow: false },
};

export default function EchecPage() {
  return (
    <>
      <Navbar />
      <PaymentFailure />
    </>
  );
}
