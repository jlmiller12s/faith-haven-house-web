import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import AdmissionsPage from "@/components/admissions/AdmissionsPage";
import Footer from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

export const metadata = {
  title: "Admissions Process | Faith Haven House",
  description:
    "Learn how Faith Haven House guides prospective residents from initial contact through admissions, Welcome Day, and the beginning of a structured path toward stability.",
  alternates: {
    canonical: "https://www.faithhavenhouse.org/admissions",
  },
  openGraph: {
    title: "Admissions Process | Faith Haven House",
    description:
      "Learn how Faith Haven House guides prospective residents from initial contact through admissions and structured transitional care.",
    url: "https://www.faithhavenhouse.org/admissions",
  },
};

export default function AdmissionsRoute() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Admissions", url: "/admissions" },
        ]}
      />
      <SmoothScroll />
      <Header />
      <main className="admissions-route-container">
        <AdmissionsPage />
      </main>
      <Footer />
    </>
  );
}
