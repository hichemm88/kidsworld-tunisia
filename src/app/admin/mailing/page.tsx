import { Metadata } from "next";
import AdminMailing from "@/components/admin/sections/AdminMailing";

export const metadata: Metadata = { title: "Mailing — Admin KidsWorld" };

export default function MailingPage() {
  return <AdminMailing />;
}
