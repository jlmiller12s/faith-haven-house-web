import Header from "@/components/Header";
import OneAway from "@/components/OneAway";
import Footer from "@/components/Footer";

export const metadata = {
  title: "One Away Perspective | Faith Haven House",
  description: "Understanding homelessness in St. Charles County: Most men are just one crisis away from losing shelter.",
};

export default function OneAwayPage() {
  return (
    <main style={{ paddingTop: "5rem" }}>
      <Header />
      <OneAway />
      <Footer />
    </main>
  );
}
