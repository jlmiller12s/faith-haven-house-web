import Header from "@/components/Header";
import Partners from "@/components/Partners";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Community Partners | Faith Haven House",
  description: "Our partner organizations in St. Charles County including First Step Back Home and Veterans United Foundation.",
};

export default function PartnersPage() {
  return (
    <main style={{ paddingTop: "5rem" }}>
      <Header />
      <Partners />
      <Footer />
    </main>
  );
}
