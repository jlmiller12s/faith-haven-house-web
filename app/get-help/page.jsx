import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PreScreenHero from "@/components/prescreen/PreScreenHero";
import PrivacyNotice from "@/components/prescreen/PrivacyNotice";
import PreScreenForm from "@/components/prescreen/PreScreenForm";

export const metadata = {
  title: "Get Help | Initial Housing Pre-Screening | Faith Haven House",
  description:
    "Start your next step with Faith Haven House. Complete our initial housing and program interest pre-screening form for transitional living support in Saint Peters, MO.",
};

export default function GetHelpPage() {
  return (
    <>
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
