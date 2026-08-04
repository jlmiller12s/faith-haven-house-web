import Header from "@/components/Header";
import Stories from "@/components/Stories";
import Footer from "@/components/Footer";
import { SiteContentProvider } from "@/components/cms/SiteContentContext";
import { getPublishedSiteContent } from "@/lib/cms/contentService";

export const metadata = {
  title: "Success Graduates & Stories | Faith Haven House",
  description: "Read real accounts from graduates who transitioned to employment and independent housing.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StoriesPage() {
  const content = await getPublishedSiteContent();
  return (
    <SiteContentProvider content={content}>
      <main style={{ paddingTop: "5rem" }}>
        <Header />
        <Stories standalone />
        <Footer />
      </main>
    </SiteContentProvider>
  );
}
