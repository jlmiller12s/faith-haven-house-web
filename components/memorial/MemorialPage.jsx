"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MEMORIAL_DATA } from "./memorialData";

export default function MemorialPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Hero entrance animation
      gsap.fromTo(
        "[data-memorial-hero]",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.12,
          ease: "power2.out",
        }
      );

      // Section reveal animations
      gsap.utils.toArray("[data-memorial-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 22, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              once: true,
            },
          }
        );
      });

      // Staggered card animation
      gsap.utils.toArray("[data-memorial-stagger]").forEach((container) => {
        const children = container.querySelectorAll("[data-memorial-card]");
        if (!children.length) return;

        gsap.fromTo(
          children,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: container,
              start: "top 85%",
              once: true,
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const {
    hero,
    legacy,
    lifeMilestones,
    calling,
    obituary,
    services,
    donation,
    closing,
  } = MEMORIAL_DATA;

  return (
    <div className="memorial-page-wrapper" ref={containerRef}>
      {/* 1. MEMORIAL HERO */}
      <section className="memorial-hero-section" id="hero">
        <div className="container">
          <div className="memorial-hero-grid">
            <div className="memorial-hero-text">
              <span className="memorial-eyebrow" data-memorial-hero>
                {hero.eyebrow}
              </span>
              <h1 className="memorial-hero-title" data-memorial-hero>
                {hero.name}
              </h1>
              <p className="memorial-hero-role" data-memorial-hero>
                {hero.role}
              </p>
              <div className="memorial-date-badge" data-memorial-hero>
                <span>{hero.dates}</span>
              </div>
              <p className="memorial-hero-bio" data-memorial-hero>
                {hero.bio}
              </p>
              <div className="memorial-hero-actions" data-memorial-hero>
                <a href={hero.primaryBtn.href} className="btn btn-primary">
                  {hero.primaryBtn.text}
                </a>
                <a href={hero.secondaryBtn.href} className="btn btn-outline">
                  {hero.secondaryBtn.text}
                </a>
              </div>
            </div>

            <div className="memorial-hero-portrait-wrap" data-memorial-hero>
              <div className="memorial-portrait-frame">
                <img
                  src={hero.image}
                  alt={hero.imageAlt}
                  className="memorial-portrait-img"
                />
                <div className="memorial-portrait-caption">
                  <span className="portrait-name">Dareth Renee Jeffers</span>
                  <span className="portrait-dates">1979 — 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FOUNDER LEGACY SECTION */}
      <section className="memorial-legacy-section" id="legacy" data-memorial-reveal>
        <div className="container">
          <div className="memorial-legacy-grid">
            <div className="legacy-main-content">
              <span className="section-eyebrow">OUR FOUNDER'S VISION</span>
              <h2 className="memorial-section-title">{legacy.heading}</h2>
              <div className="legacy-paragraphs">
                {legacy.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
            <div className="legacy-quote-card">
              <div className="quote-card-inner">
                <div className="quote-icon" aria-hidden="true">
                  “
                </div>
                <blockquote className="legacy-quote-text">
                  {legacy.quote}
                </blockquote>
                <div className="quote-divider" aria-hidden="true" />
                <cite className="legacy-quote-author">
                  Faith Haven House Dedication
                </cite>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. A LIFE OF FAITH, LEARNING, AND SERVICE */}
      <section className="memorial-life-section" id="life" data-memorial-reveal>
        <div className="container">
          <div className="section-header section-header--center">
            <span className="section-eyebrow">HER JOURNEY</span>
            <h2 className="memorial-section-title">
              A Life Rooted in Faith, Learning, and Service
            </h2>
          </div>

          <div className="memorial-timeline-container" data-memorial-stagger>
            <div className="memorial-timeline-track" aria-hidden="true" />
            {lifeMilestones.map((item, index) => (
              <div
                key={index}
                className="memorial-timeline-item"
                data-memorial-card
              >
                <div className="timeline-node">
                  <span className="timeline-node-dot" aria-hidden="true" />
                  <span className="timeline-year">{item.year}</span>
                </div>
                <div className="timeline-card">
                  <h3 className="timeline-card-title">{item.title}</h3>
                  <p className="timeline-card-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FAITH HAVEN HOUSE WAS BORN FROM A CALLING */}
      <section className="memorial-calling-section" data-memorial-reveal>
        <div className="container">
          <div className="calling-header-content">
            <span className="section-eyebrow">CONTINUING THE MISSION</span>
            <h2 className="memorial-section-title">{calling.heading}</h2>
            <div className="calling-lead-paragraphs">
              {calling.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          <div className="calling-pillars-wrapper">
            <h3 className="pillars-section-subtitle">{calling.pillarsTitle}</h3>
            <div className="pillars-grid" data-memorial-stagger>
              {calling.pillars.map((pillar, i) => (
                <div key={i} className="pillar-card" data-memorial-card>
                  <div className="pillar-icon-wrap">
                    <img src={pillar.icon} alt="" aria-hidden="true" />
                  </div>
                  <h4 className="pillar-title">{pillar.title}</h4>
                  <p className="pillar-desc">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. OBITUARY SECTION */}
      <section className="memorial-obituary-section" id="obituary" data-memorial-reveal>
        <div className="container">
          <div className="obituary-container-card">
            <div className="obituary-header">
              <span className="section-eyebrow">IN REMEMBRANCE</span>
              <h2 className="memorial-section-title">{obituary.heading}</h2>
              <div className="obituary-header-rule" aria-hidden="true" />
            </div>

            <div className="obituary-body-content">
              {obituary.paragraphs.map((p, i) => (
                <p key={i} className="obituary-paragraph">
                  {p}
                </p>
              ))}

              <div className="obituary-survived-block">
                <h3 className="survived-heading">{obituary.survivedHeading}</h3>
                <p className="survived-text">{obituary.survivedText}</p>
                <p className="preceded-text">{obituary.precededText}</p>
              </div>

              <div className="obituary-actions-bar">
                <button
                  type="button"
                  className="btn btn-outline print-tribute-btn"
                  onClick={handlePrint}
                  aria-label="Print this tribute page"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                  </svg>
                  Print Tribute
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* 7. GIVE IN HER MEMORY */}
      <section className="memorial-donation-section" id="give" data-memorial-reveal>
        <div className="container">
          <div className="donation-card-banner">
            <span className="donation-eyebrow">{donation.eyebrow}</span>
            <h2 className="donation-heading">{donation.heading}</h2>
            <p className="donation-body">{donation.body}</p>

            <div className="donation-mailing-box">
              <span className="mailing-title">Mailing Address for Memorial Gifts:</span>
              <address className="mailing-address">
                {donation.address.map((line, idx) => (
                  <span key={idx}>
                    {line}
                    {idx < donation.address.length - 1 && <br />}
                  </span>
                ))}
              </address>
            </div>

            <div className="donation-actions">
              <a
                href={donation.primaryBtn.href}
                className="btn btn-primary donation-primary-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                {donation.primaryBtn.text}
              </a>
              <Link href={donation.secondaryBtn.href} className="btn btn-outline donation-secondary-btn">
                {donation.secondaryBtn.text}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CLOSING LEGACY STATEMENT */}
      <section className="memorial-closing-section" data-memorial-reveal>
        <div className="container">
          <div className="closing-content-box">
            <div className="closing-symbol" aria-hidden="true">
              ✝
            </div>
            <h2 className="closing-heading">{closing.heading}</h2>
            <p className="closing-body">{closing.body}</p>
            <div className="closing-divider" aria-hidden="true" />
            <p className="closing-footnote">{closing.footnote}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
