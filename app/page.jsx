import Countdown from "./Countdown";
import styles from "./coming-soon.module.css";

export const metadata = {
  title: "New Website Coming Soon | Faith Haven House",
  description:
    "Faith Haven House is preparing a new website, launching August 3, 2026.",
};

export default function Home() {
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
        <h1>
          New website coming soon.
        </h1>

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
