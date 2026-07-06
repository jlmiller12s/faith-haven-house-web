import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import RoadmapPage from "@/components/roadmap/RoadmapPage";
import Footer from "@/components/Footer";

export const metadata = {
  title: "The Faith Haven Roadmap | Faith Haven House",
  description:
    "Explore the structured, faith-centered pathway Faith Haven House offers — from immediate stabilization through homeownership readiness.",
};

export default function RoadmapRoute() {
  return (
    <>
      <SmoothScroll />
      <Header />
      <RoadmapPage />
      <Footer />
    </>
  );
}
