import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Narrative from "@/components/Narrative";
import ProcessTimeline from "@/components/ProcessTimeline";
import Stats from "@/components/Stats";
import Pyramid from "@/components/Pyramid";
import Volunteer from "@/components/Volunteer";
import Stories from "@/components/Stories";
import OneAway from "@/components/OneAway";
import Resources from "@/components/Resources";
import Partners from "@/components/Partners";
import Blog from "@/components/Blog";
import Values from "@/components/Values";
import DonateBanner from "@/components/DonateBanner";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Faith Haven House | Transitional Shelter for Homeless Men in St. Charles County",
  description: "Faith Haven House provides a safe, transitional living facility and supportive services for homeless men in St. Charles County, helping them transition to permanent housing and self-sufficiency.",
  alternates: {
    canonical: "https://www.faithhavenhouse.org",
  },
};

const MISSION_TEXT =
  "Faith Haven House will be a place where residents start the re-building process. We work with homeless men, providing a stable living environment. Throughout transition, they receive a network of support with available resources to meet their physical and spiritual needs.";

const FOUNDER_TEXT =
  "Between 2013 and 2015, Dareth Jeffers served meals to unhoused men and women. The standard answer to shelter requests was no. Dareth prayed, found servant-hearted partners, designed a logo, and made a plan. Faith Haven House became that YES. Today, men have a place to stay and a chance to rebuild.";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Header />
      <Hero />
      <Narrative id="about" text={MISSION_TEXT} />
      <Pyramid />
      <ProcessTimeline />
      <OneAway />
      <Narrative text={FOUNDER_TEXT} cardBg />
      <Stats />
      <Volunteer />
      <Stories />
      <Resources />
      <Partners />
      <Blog />
      <Values />
      <DonateBanner />
      <Footer />
    </>
  );
}
