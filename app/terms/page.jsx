import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import TermsPage from "@/components/terms/TermsPage";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms and Conditions | Faith Haven House",
  description:
    "Read the Terms and Conditions for Faith Haven House, outlining terms of use, privacy policies, community standards, and operational guidelines.",
};

export default function TermsRoute() {
  return (
    <>
      <SmoothScroll />
      <Header />
      <TermsPage />
      <Footer />
    </>
  );
}
