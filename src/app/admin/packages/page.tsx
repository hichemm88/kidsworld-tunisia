import { Metadata } from "next";
import AdminPackages from "@/components/admin/sections/AdminPackages";

export const metadata: Metadata = { title: "Packages & Prix — Admin KidsWorld" };

export default function PackagesPage() {
  return <AdminPackages />;
}
