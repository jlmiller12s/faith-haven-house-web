import Header from "@/components/Header";
import ResourcesLibraryPage from "@/components/resources/ResourcesLibraryPage";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Resource Library | Faith Haven House",
  description: "A practical support center and library for residents, families, churches, and community partners in St. Charles County.",
};

export default function ResourcesPage() {
  return (
    <>
      <Header />
      <ResourcesLibraryPage />
      <Footer />
    </>
  );
}
