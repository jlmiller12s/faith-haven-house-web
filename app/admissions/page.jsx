import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import AdmissionsPage from "@/components/admissions/AdmissionsPage";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Admissions Process | Faith Haven House",
  description:
    "Learn how Faith Haven House guides prospective residents from initial contact through admissions, Welcome Day, and the beginning of a structured path toward stability.",
};

export default function AdmissionsRoute() {
  return (
    <>
      <SmoothScroll />
      <Header />
      <main className="admissions-route-container">
        <AdmissionsPage />
      </main>
      <Footer />
    </>
  );
}
