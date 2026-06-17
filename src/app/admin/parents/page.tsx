import { Metadata } from "next";
import AdminParents from "@/components/admin/sections/AdminParents";

export const metadata: Metadata = { title: "Parents — Admin KidsWorld" };

export default function ParentsPage() {
  return <AdminParents />;
}
