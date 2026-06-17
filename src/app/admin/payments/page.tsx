import { Metadata } from "next";
import AdminPayments from "@/components/admin/sections/AdminPayments";

export const metadata: Metadata = { title: "Paiements — Admin KidsWorld" };

export default function PaymentsPage() {
  return <AdminPayments />;
}
