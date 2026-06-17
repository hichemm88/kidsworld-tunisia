import { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: "Administration — KidsWorld Tunisia",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#F7F6F2] overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
