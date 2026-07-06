import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import MemorialPage from "@/components/memorial/MemorialPage";
import Footer from "@/components/Footer";

export const metadata = {
  title: "In Loving Memory of Dareth Renee Jeffers | Faith Haven House",
  description:
    "A tribute to Dareth Renee Jeffers, founder of Faith Haven House, whose faith and compassion continue to inspire the organization’s mission.",
};

export default function DarethJeffersMemorialRoute() {
  return (
    <>
      <SmoothScroll />
      <Header />
      <MemorialPage />
      <Footer />
    </>
  );
}
