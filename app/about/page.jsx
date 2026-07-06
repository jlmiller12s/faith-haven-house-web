import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import AboutContent from "@/components/about/AboutContent";
import Values from "@/components/Values";
import Footer from "@/components/Footer";

export const metadata = {
  title: "About Us | Faith Haven House",
  description: "Learn about the mission, values, and founder's story of Faith Haven House in St. Charles County.",
};

export default function AboutPage() {
  return (
    <>
      <SmoothScroll />
      <Header />
      <AboutContent />
      <Values />
      <Footer />
    </>
  );
}
