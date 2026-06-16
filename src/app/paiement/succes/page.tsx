import { Metadata } from "next";
import { Suspense } from "react";
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
      <Suspense fallback={<div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center"><div className="w-10 h-10 rounded-full border-4 border-[#0D2461] border-t-transparent animate-spin" /></div>}>
        <PaymentSuccess />
      </Suspense>
    </>
  );
}
