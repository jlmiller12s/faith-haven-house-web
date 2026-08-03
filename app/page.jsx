import Countdown from "./Countdown";
import styles from "./coming-soon.module.css";
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
import { SiteContentProvider } from "@/components/cms/SiteContentContext";
import { getPublishedSiteContent } from "@/lib/cms/contentService";

const LAUNCH_TIME = new Date("2026-08-03T05:01:00.000Z").getTime();

// This page must evaluate the launch time on every request. Static rendering
// would otherwise freeze whichever state existed when Vercel built the site.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateMetadata() {
  if (Date.now() < LAUNCH_TIME) {
    return {
      title: "New Website Coming Soon | Faith Haven House",
      description:
        "Faith Haven House is preparing a new website, launching August 3, 2026.",
    };
  }

  return {
    title:
      "Faith Haven House | Transitional Shelter for Homeless Men in St. Charles County",
    description:
      "Faith Haven House provides a safe, transitional living facility and supportive services for homeless men in St. Charles County, helping them transition to permanent housing and self-sufficiency.",
    alternates: {
      canonical: "https://www.faithhavenhouse.org",
    },
  };
}

const MISSION_TEXT =
  "Faith Haven House will be a place where residents start the re-building process. We work with homeless men, providing a stable living environment. Throughout transition, they receive a network of support with available resources to meet their physical and spiritual needs.";

const FOUNDER_TEXT =
  "Between 2013 and 2015, Dareth Jeffers served meals to unhoused men and women. The standard answer to shelter requests was no. Dareth prayed, found servant-hearted partners, designed a logo, and made a plan. Faith Haven House became that YES. Today, men have a place to stay and a chance to rebuild.";

function ComingSoon() {
  return (
    <main className={styles.page}>
      <video
        className={styles.video}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      >
        <source src="/assets/hero-video-web.mp4" type="video/mp4" />
        <source src="/assets/hero-video-optimized.mp4" type="video/mp4" />
      </video>
      <div className={styles.overlay} aria-hidden="true" />

      <header className={styles.header}>
        <img
          className={styles.logo}
          src="/assets/FHH-logo-clean.png"
          alt="Faith Haven House"
        />
        <p>
          <span aria-hidden="true" />
          Website refresh underway
        </p>
      </header>

      <section className={styles.hero}>
        <h1>New website coming soon.</h1>
        <p className={styles.intro}>
          We’re building a renewed online home to help more men in St. Charles
          County find shelter, support, and a path forward.
        </p>
        <Countdown />
      </section>

      <footer className={styles.footer}>
        <p>Faith · Hope · Restoration</p>
        <p>Launching Monday, August 3, 2026 · 12:01 a.m. CDT</p>
      </footer>
    </main>
  );
}

function LaunchedWebsite({ content }) {
  return (
    <SiteContentProvider content={content}>
      <SmoothScroll />
      <Header />
      <Hero />
      <Narrative id="about" text={content["home.mission.text"]} />
      <Pyramid />
      <ProcessTimeline />
      <OneAway />
      <Narrative text={content["home.founder.text"]} cardBg />
      <Stats />
      <Volunteer />
      <Stories />
      <Resources />
      <Partners />
      <Blog />
      <Values />
      <DonateBanner />
      <Footer />
    </SiteContentProvider>
  );
}

export default async function Home() {
  const showFullHomepage = process.env.SHOW_FULL_HOMEPAGE === "1";

  if (!showFullHomepage && Date.now() < LAUNCH_TIME) return <ComingSoon />;
  return <LaunchedWebsite content={await getPublishedSiteContent()} />;
}
