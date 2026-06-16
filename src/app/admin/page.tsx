import { Metadata } from "next";
import AdminDashboard from "@/components/admin/AdminDashboard";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Administration — KidsWorld Tunisia",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <>
      <Navbar />
      <AdminDashboard />
    </>
  );
}
