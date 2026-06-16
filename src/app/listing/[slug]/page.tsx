import Navbar from "@/components/layout/Navbar";
import ListingDetail from "@/components/listings/ListingDetail";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <>
      <Navbar />
      <ListingDetail slug={params.slug} />
    </>
  );
}
