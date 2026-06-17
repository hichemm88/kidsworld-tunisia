import { Metadata } from "next";
import AdminPros from "@/components/admin/sections/AdminPros";

export const metadata: Metadata = { title: "Professionnels — Admin KidsWorld" };

export default function ProsPage() {
  return <AdminPros />;
}
