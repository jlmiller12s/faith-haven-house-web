import Header from "@/components/Header";
import Blog from "@/components/Blog";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Blog & Journal Updates | Faith Haven House",
  description: "Updates and journal entries from Dareth Jeffers, Executive Director of Faith Haven House.",
};

export default function BlogPage() {
  return (
    <main style={{ paddingTop: "5rem" }}>
      <Header />
      <Blog />
      <Footer />
    </main>
  );
}
