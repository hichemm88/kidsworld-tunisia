import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import ListingsPage from "@/components/listings/ListingsPage";

export const metadata = {
  title: "Recherche — KidsWorld Tunisia",
  description: "Trouvez les meilleures activités, médecins et services pour enfants en Tunisie.",
};

export default function Page() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-4 border-[#0D2461] border-t-transparent animate-spin" />
          </div>
        }
      >
        <ListingsPage />
      </Suspense>
    </>
  );
}
