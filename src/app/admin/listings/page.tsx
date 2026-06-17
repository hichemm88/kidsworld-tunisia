import { Metadata } from "next";
import AdminListings from "@/components/admin/sections/AdminListings";

export const metadata: Metadata = { title: "Listings — Admin KidsWorld" };

export default function ListingsPage() {
  return <AdminListings />;
}
