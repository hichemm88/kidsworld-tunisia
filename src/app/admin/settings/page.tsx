import { Metadata } from "next";
import AdminSettings from "@/components/admin/sections/AdminSettings";

export const metadata: Metadata = { title: "Paramètres — Admin KidsWorld" };

export default function SettingsPage() {
  return <AdminSettings />;
}
