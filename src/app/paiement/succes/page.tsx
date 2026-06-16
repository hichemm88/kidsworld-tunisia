import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import PaymentSuccess from "@/components/payment/PaymentSuccess";

export const metadata: Metadata = {
  title: "Paiement réussi — KidsWorld Tunisia",
  robots: { index: false, follow: false },
};

export default function SuccesPage() {
  return (
    <>
      <Navbar />
      <PaymentSuccess />
    </>
  );
}
