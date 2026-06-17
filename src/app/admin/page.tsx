import { Metadata } from "next";
import AdminHome from "@/components/admin/AdminHome";

export const metadata: Metadata = {
  title: "Dashboard — KidsWorld Admin",
};

export default function AdminPage() {
  return <AdminHome />;
}
