import Header from "@/components/Header";
import Volunteer from "@/components/Volunteer";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Volunteer SOP & Opportunities | Faith Haven House",
  description: "Join as a Daytime House Monitor, Meal Train delivery volunteer, life skills coach, or resident mentor.",
};

export default function VolunteerPage() {
  return (
    <main style={{ paddingTop: "5rem" }}>
      <Header />
      <Volunteer />
      <Footer />
    </main>
  );
}
