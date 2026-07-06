import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import FaqPage from "@/components/faq/FaqPage";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Frequently Asked Questions | Faith Haven House",
  description:
    "Find answers about Faith Haven House, resident support, donations, volunteering, supplies, and the transitional living program for men in St. Charles County.",
};

export default function FaqRoute() {
  return (
    <>
      <SmoothScroll />
      <Header />
      <FaqPage />
      <Footer />
    </>
  );
}
