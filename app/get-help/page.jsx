import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PreScreenHero from "@/components/prescreen/PreScreenHero";
import PrivacyNotice from "@/components/prescreen/PrivacyNotice";
import PreScreenForm from "@/components/prescreen/PreScreenForm";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

export const metadata = {
  title: "Get Help | Initial Housing Pre-Screening | Faith Haven House",
  description:
    "Start your next step with Faith Haven House. Complete our initial housing and program interest pre-screening form for transitional living support in St. Charles County, MO.",
  alternates: {
    canonical: "https://www.faithhavenhouse.org/get-help",
  },
  openGraph: {
    title: "Get Help | Initial Housing Pre-Screening | Faith Haven House",
    description:
      "Complete our initial housing pre-screening form for transitional living support in St. Charles County.",
    url: "https://www.faithhavenhouse.org/get-help",
  },
};

export default function GetHelpPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Get Help", url: "/get-help" },
        ]}
      />
      <Header />
      <main className="prescreen-page-wrapper">
        <div className="prescreen-container">
          <PreScreenHero />
          <PrivacyNotice />
          <PreScreenForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
