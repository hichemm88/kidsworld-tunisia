import { Metadata } from "next";
import AdminStats from "@/components/admin/sections/AdminStats";

export const metadata: Metadata = { title: "Statistiques — Admin KidsWorld" };

export default function StatsPage() {
  return <AdminStats />;
}
