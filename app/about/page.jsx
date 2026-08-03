import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import AboutContent from "@/components/about/AboutContent";
import Values from "@/components/Values";
import Footer from "@/components/Footer";
import { SiteContentProvider } from "@/components/cms/SiteContentContext";
import { getPublishedSiteContent } from "@/lib/cms/contentService";

export const metadata = {
  title: "About Us | Faith Haven House",
  description: "Learn about the mission, values, and founder's story of Faith Haven House in St. Charles County.",
};

// Content editors should see published CMS changes on the next request.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AboutPage() {
  const content = await getPublishedSiteContent();
  return (
    <SiteContentProvider content={content}>
      <SmoothScroll />
      <Header />
      <AboutContent />
      <Values />
      <Footer />
    </SiteContentProvider>
  );
}
