import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TeamPage from "@/components/team/TeamPage";

export const metadata = {
  title: "Meet the Team | Faith Haven House",
  description:
    "Meet the dedicated leadership, staff, and mentors driving the mission of Faith Haven House to rebuild lives and restore hope for homeless men in our community.",
  openGraph: {
    title: "Meet the Team | Faith Haven House",
    description:
      "Meet the dedicated leadership, staff, and mentors driving the mission of Faith Haven House to rebuild lives and restore hope.",
  },
};

export default function Page() {
  return (
    <>
      <Header />
      <TeamPage />
      <Footer />
    </>
  );
}
