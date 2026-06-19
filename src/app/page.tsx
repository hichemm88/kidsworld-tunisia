import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import StatsBar from "@/components/home/StatsBar";
import CategoriesGrid from "@/components/home/CategoriesGrid";
import FeaturedListings from "@/components/home/FeaturedListings";
import VillesGrid from "@/components/home/VillesGrid";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <CategoriesGrid />
        <VillesGrid />
        <FeaturedListings />
      </main>
    </>
  );
}
