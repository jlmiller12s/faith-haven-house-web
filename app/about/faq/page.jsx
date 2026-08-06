import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import FaqPage from "@/components/faq/FaqPage";
import Footer from "@/components/Footer";
import { FaqJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { FAQ_ITEMS } from "@/components/faq/faqData";

export const metadata = {
  title: "Frequently Asked Questions | Faith Haven House",
  description:
    "Find answers about Faith Haven House, resident support, donations, volunteering, supplies, and the transitional living program for men in St. Charles County.",
};

export default function FaqRoute() {
  return (
    <>
      <FaqJsonLd items={FAQ_ITEMS} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "About", url: "/about" },
          { name: "FAQ", url: "/about/faq" },
        ]}
      />
      <SmoothScroll />
      <Header />
      <FaqPage />
      <Footer />
    </>
  );
}
