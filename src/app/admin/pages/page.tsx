import { Metadata } from "next";
import AdminPages from "@/components/admin/sections/AdminPages";

export const metadata: Metadata = { title: "Pages & Contenu — Admin KidsWorld" };

export default function PagesPage() {
  return <AdminPages />;
}
