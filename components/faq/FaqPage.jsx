"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FAQ_CATEGORIES, FAQ_ITEMS } from "./faqData";

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState("All Questions");
  const [openItems, setOpenItems] = useState({ "prog-1": true }); // First question open by default
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo(
        "[data-faq-hero]",
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
      gsap.utils.toArray("[data-faq-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 20, opacity: 0 },
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

  const toggleItem = (id) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter items based on active chip
  const filteredItems =
    activeCategory === "All Questions"
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((item) => item.category === activeCategory);

  // Group filtered items by category (preserving standard order)
  const categoryOrder = [
    "Program & Residency",
    "Clothing & Supplies",
    "Support & Donations",
    "About Faith Haven House",
    "General Questions",
  ];

  const groupedCategories = categoryOrder.filter((cat) =>
    filteredItems.some((item) => item.category === cat)
  );

  return (
    <div className="faq-page-wrapper" ref={containerRef}>
      {/* 1. HERO SECTION */}
      <section className="faq-hero-section" id="faq-hero">
        <div className="container">
          <div className="faq-hero-content">
            <span className="faq-eyebrow" data-faq-hero>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="faq-eyebrow-icon"
                aria-hidden="true"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              ABOUT FAITH HAVEN HOUSE
            </span>

            <h1 className="faq-hero-title" data-faq-hero>
              Frequently Asked Questions
            </h1>

            <p className="faq-hero-sub" data-faq-hero>
              Find quick answers about Faith Haven House, our residential program,
              ways to support the mission, and how to get involved.
            </p>

            <div className="faq-hero-actions" data-faq-hero>
              <Link href="/get-help" className="btn btn-primary">
                Get Help
              </Link>
              <Link href="/donate" className="btn btn-outline">
                Support Faith Haven House
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FAQ INTRO & QUICK LINK FILTERS */}
      <section className="faq-intro-section" data-faq-reveal>
        <div className="container">
          <div className="faq-intro-card">
            <h2 className="faq-intro-title">Quick Answers. Clear Next Steps.</h2>
            <p className="faq-intro-text">
              Whether you are looking for support, considering volunteering, making a
              donation, or connecting someone to Faith Haven House, this page is here to
              help answer common questions.
            </p>

            <div className="faq-filter-chips" role="tablist" aria-label="FAQ Categories">
              {FAQ_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-pressed={isActive}
                    className={`faq-chip${isActive ? " active" : ""}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. FAQ ACCORDION GROUPS */}
      <section className="faq-accordion-section" data-faq-reveal>
        <div className="container">
          <div className="faq-accordion-container">
            {groupedCategories.map((category) => {
              const categoryItems = filteredItems.filter(
                (item) => item.category === category
              );

              return (
                <div key={category} className="faq-group-block">
                  <div className="faq-group-header">
                    <span className="faq-group-eyebrow">FAITH HAVEN HOUSE FAQ</span>
                    <h2 className="faq-group-title">{category}</h2>
                    <div className="faq-group-rule" aria-hidden="true" />
                  </div>

                  <div className="faq-accordion-list">
                    {categoryItems.map((item) => {
                      const isOpen = Boolean(openItems[item.id]);

                      return (
                        <div
                          key={item.id}
                          className={`faq-accordion-card${isOpen ? " open" : ""}`}
                        >
                          <h3>
                            <button
                              type="button"
                              className="faq-accordion-btn"
                              aria-expanded={isOpen}
                              aria-controls={`faq-answer-${item.id}`}
                              id={`faq-btn-${item.id}`}
                              onClick={() => toggleItem(item.id)}
                            >
                              <span className="faq-question-text">
                                {item.question}
                              </span>
                              <span className="faq-toggle-icon" aria-hidden="true">
                                {isOpen ? "−" : "+"}
                              </span>
                            </button>
                          </h3>

                          <div
                            id={`faq-answer-${item.id}`}
                            role="region"
                            aria-labelledby={`faq-btn-${item.id}`}
                            className={`faq-answer-wrapper${isOpen ? " expanded" : ""}`}
                          >
                            <div className="faq-answer-inner">
                              <p>{item.answer}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. STILL HAVE QUESTIONS CTA */}
      <section className="faq-cta-section" data-faq-reveal>
        <div className="container">
          <div className="faq-cta-card">
            <div className="faq-cta-content">
              <span className="faq-cta-eyebrow">WE'RE HERE TO HELP</span>
              <h2 className="faq-cta-heading">Still Have a Question?</h2>
              <p className="faq-cta-body">
                Reach out to Faith Haven House directly. Our team can help point you
                toward the right next step, whether you are seeking support, looking
                to volunteer, or interested in giving.
              </p>
            </div>

            <div className="faq-cta-actions">
              <Link href="/contact" className="btn btn-primary faq-cta-btn-primary">
                Contact Faith Haven House
              </Link>
              <Link href="/roadmap" className="btn btn-outline faq-cta-btn-secondary">
                Explore the Roadmap
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
