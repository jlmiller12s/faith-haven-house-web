import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TeamPage from "@/components/team/TeamPage";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

export const metadata = {
  title: "Meet the Team | Faith Haven House",
  description:
    "Meet the dedicated leadership, staff, and mentors driving the mission of Faith Haven House to rebuild lives and restore hope for homeless men in our community.",
  alternates: {
    canonical: "https://www.faithhavenhouse.org/team",
  },
  openGraph: {
    title: "Meet the Team | Faith Haven House",
    description:
      "Meet the dedicated leadership, staff, and mentors driving the mission of Faith Haven House to rebuild lives and restore hope.",
    url: "https://www.faithhavenhouse.org/team",
  },
};

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Team", url: "/team" },
        ]}
      />
      <Header />
      <TeamPage />
      <Footer />
    </>
  );
}
