"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TERMS_DATA } from "./termsData";

export default function TermsPage() {
  const containerRef = useRef(null);
  const [activeSection, setActiveSection] = useState("acceptance");

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo(
        "[data-terms-hero]",
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
        }
      );

      // Section reveals
      gsap.utils.toArray("[data-terms-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 22, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              once: true,
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const { header, toc, sections } = TERMS_DATA;

  return (
    <div className="terms-page-wrapper" ref={containerRef}>
      {/* HERO SECTION */}
      <section className="terms-hero-section">
        <div className="container">
          <div className="terms-hero-content">
            <span className="terms-eyebrow" data-terms-hero>
              {header.eyebrow}
            </span>
            <h1 className="terms-hero-title" data-terms-hero>
              {header.title}
            </h1>
            <div className="terms-meta-badge" data-terms-hero>
              <span>Effective Date: {header.lastUpdated}</span>
            </div>
            <p className="terms-hero-intro" data-terms-hero>
              {header.intro}
            </p>
          </div>
        </div>
      </section>

      {/* MAIN TERMS CONTENT WITH SIDEBAR TOC */}
      <section className="terms-main-section" data-terms-reveal>
        <div className="container">
          <div className="terms-layout-grid">
            {/* Table of Contents Sidebar */}
            <aside className="terms-toc-sidebar">
              <div className="toc-card">
                <h2 className="toc-heading">Table of Contents</h2>
                <nav className="toc-nav">
                  {toc.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`toc-link${
                        activeSection === item.id ? " active" : ""
                      }`}
                      onClick={() => scrollToSection(item.id)}
                    >
                      {item.title}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Terms Body Sections */}
            <div className="terms-body-container">
              {/* Disclaimer Banner Callout */}
              <div className="terms-disclaimer-box">
                <div className="disclaimer-header">
                  <span className="disclaimer-icon" aria-hidden="true">
                    ⚠️
                  </span>
                  <h3>Non-Medical &amp; Non-Clinical Notice</h3>
                </div>
                <p>
                  Faith Haven House provides transitional shelter, life skills coaching,
                  and supportive housing assistance. We do not provide licensed medical,
                  psychiatric, clinical detoxification, or legal services.
                </p>
              </div>

              {sections.map((section) => (
                <article
                  key={section.id}
                  id={section.id}
                  className="terms-section-block"
                >
                  <div className="terms-section-header">
                    <span className="terms-section-num">{section.number}</span>
                    <h2 className="terms-section-title">{section.title}</h2>
                  </div>
                  <div className="terms-section-content">
                    {section.content.map((paragraph, idx) => (
                      <p key={idx} className="terms-paragraph">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </article>
              ))}

              {/* Action Footer Callout */}
              <div className="terms-contact-callout">
                <h3>Have Questions About Our Terms?</h3>
                <p>
                  If you have any questions regarding these terms, policies, or program
                  eligibility, please feel free to reach out to our administration team.
                </p>
                <div className="terms-callout-actions">
                  <Link href="/contact" className="btn btn-primary">
                    Contact Us
                  </Link>
                  <Link href="/about/faq" className="btn btn-outline">
                    Read FAQ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
