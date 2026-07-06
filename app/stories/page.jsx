import Header from "@/components/Header";
import Stories from "@/components/Stories";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Success Graduates & Stories | Faith Haven House",
  description: "Read real accounts from graduates who transitioned to employment and independent housing.",
};

export default function StoriesPage() {
  return (
    <main style={{ paddingTop: "5rem" }}>
      <Header />
      <Stories />
      <Footer />
    </main>
  );
}
