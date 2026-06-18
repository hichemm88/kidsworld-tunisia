import { Metadata } from "next";
import AdminScraper from "@/components/admin/sections/AdminScraper";

export const metadata: Metadata = {
  title: "Import données — Admin KidsWorld",
};

export default function ScraperPage() {
  return <AdminScraper />;
}
