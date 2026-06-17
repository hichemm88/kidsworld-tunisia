import { Metadata } from "next";
import AdminPromos from "@/components/admin/sections/AdminPromos";

export const metadata: Metadata = { title: "Promotions — Admin KidsWorld" };

export default function PromosPage() {
  return <AdminPromos />;
}
