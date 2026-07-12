"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ADMISSIONS_STEPS,
  WELCOME_DAY_STEPS,
  RESIDENT_EXPECTATIONS,
  ADMISSIONS_FAQS
} from "./admissionsData";

/* ─── SVG Icons Helper ────────────────────────────── */
function IconRenderer({ name, className = "icon-svg" }) {
  // Simple custom inline SVG dictionary matching icons requested
  const icons = {
    phone: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    ),
    "clipboard-check": (
      <>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="m9 14 2 2 4-4" />
      </>
    ),
    "file-text": (
      <>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M10 9H8" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
      </>
    ),
    "shield-check": (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 11 2 2 4-4" />
      </>
    ),
    flask: (
      <>
        <path d="M9 3h6" />
        <path d="M10 3v5c0 .5-.2 1-.6 1.4L4.3 15c-.9 1-.2 2.6 1.1 2.6h13.2c1.3 0 2-.1.5-2.6l-5.1-5.6c-.4-.4-.6-.9-.6-1.4V3" />
        <path d="M6 14h12" />
      </>
    ),
    "message-circle": (
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    ),
    "heart-pulse": (
      <>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <path d="M3.22 12H7l2-5 3 8 2-4h3.78" />
      </>
    ),
    users: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    "calendar-check": (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="m9 16 2 2 4-4" />
      </>
    ),
    home: (
      <>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    ),
    "trending-up": (
      <>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="M4.93 4.93l1.41 1.41" />
        <path d="M17.66 17.66l1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="M6.34 17.66l-1.41 1.41" />
        <path d="M19.07 4.93l-1.41 1.41" />
      </>
    ),
    briefcase: (
      <>
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </>
    ),
    compass: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </>
    )
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: "100%", height: "100%" }}
    >
      {icons[name] || <circle cx="12" cy="12" r="10" />}
    </svg>
  );
}

export default function AdmissionsPage() {
  const [openFaqs, setOpenFaqs] = useState({});
  const [docsExpanded, setDocsExpanded] = useState(false);
  const containerRef = useRef(null);

  // Toggle FAQ collapse state
  const toggleFaq = (id) => {
    setOpenFaqs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // GSAP Animations
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Hero Reveal
      gsap.fromTo(
        "[data-hero-reveal]",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.1,
          ease: "power2.out"
        }
      );

      // 2. Timeline Step Reveals (Staggered ScrollTrigger)
      gsap.fromTo(
        ".timeline-node-card",
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".timeline-flow-container",
            start: "top 78%",
            once: true
          }
        }
      );

      // 3. Welcome Day Step Card Reveals
      gsap.fromTo(
        ".wd-step-card",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.65,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".welcome-day-section",
            start: "top 76%",
            once: true
          }
        }
      );

      // 4. Expectations Grid Reveal
      gsap.fromTo(
        ".exp-card",
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.65,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".expectations-section",
            start: "top 80%",
            once: true
          }
        }
      );

      // 5. Generic Section Reveals
      gsap.utils.toArray("[data-scroll-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 84%",
              once: true
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="admissions-page-wrapper" ref={containerRef}>
      
      {/* ─── 1. HERO SECTION ────────────────────────── */}
      <section className="admissions-hero" id="hero">
        <div className="container">
          <div className="admissions-hero-content">
            <span className="hero-eyebrow" data-hero-reveal>
              FAITH HAVEN HOUSE
            </span>
            <h1 className="hero-title" data-hero-reveal>
              Admissions Process
            </h1>
            <p className="hero-lead" data-hero-reveal>
              A clear path from first contact to a fresh start.
            </p>
            <p className="hero-body" data-hero-reveal>
              Faith Haven House provides a structured, faith-centered admissions process designed to help us understand each applicant’s situation, confirm program readiness, and prepare residents for a successful transition into the home.
            </p>
            <p className="hero-disclaimer" data-hero-reveal>
              Every person’s situation is different. Our team reviews each applicant carefully and communicates the next step as clearly as possible.
            </p>
            <div className="hero-actions" data-hero-reveal>
              <Link href="/get-help" className="btn btn-primary">
                Start Your Next Step
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Questions About Admissions?
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. A CLEAR PATH FORWARD ───────────────── */}
      <section className="admissions-path-intro" data-scroll-reveal>
        <div className="container">
          <div className="path-intro-grid">
            <div className="path-intro-text">
              <h2>A Process Built for Clarity, Accountability, and Care</h2>
              <p>
                Faith Haven House is more than a place to stay. It is a structured environment where men can stabilize, build practical skills, grow in faith, and take meaningful steps toward long-term independence.
              </p>
              <p>
                The admissions process helps ensure that each applicant understands the program, that our team has the information needed to provide appropriate support, and that Welcome Day begins with clarity and preparation.
              </p>
            </div>

            <div className="path-intro-cards">
              <div className="value-intro-card">
                <span className="value-card-num">01</span>
                <h3>Clear Next Steps</h3>
                <p>Applicants are guided through each stage of the process and informed about what comes next.</p>
              </div>
              <div className="value-intro-card">
                <span className="value-card-num">02</span>
                <h3>Individual Review</h3>
                <p>Each applicant is reviewed individually through a structured admissions process.</p>
              </div>
              <div className="value-intro-card">
                <span className="value-card-num">03</span>
                <h3>A Stronger Start</h3>
                <p>Welcome Day is designed to help new residents begin the program with support, structure, and a clear plan.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. BEFORE WELCOME DAY WORKFLOW ────────── */}
      <section className="admissions-workflow-timeline" id="workflow">
        <div className="container">
          <div className="section-header section-header--center" data-scroll-reveal>
            <span className="section-eyebrow">THE ADMISSIONS PATHWAY</span>
            <h2>Before Welcome Day</h2>
            <p className="section-subtitle text-center">
              Applicants progress sequentially through these nine stages to verify eligibility and fit.
            </p>
          </div>

          <div className="timeline-flow-container">
            {/* Horizontal timeline connector path for desktop */}
            <div className="timeline-connecting-line" aria-hidden="true" />

            <ol className="timeline-steps-list">
              {ADMISSIONS_STEPS.map((step) => {
                const isStep3 = step.id === "admissions-docs";
                return (
                  <li key={step.id} className="timeline-node-card">
                    <div className="timeline-node-header">
                      <span className={`category-badge badge-${step.category}`}>
                        {step.category.toUpperCase()}
                      </span>
                      <span className="step-count-badge">STEP {step.number}</span>
                    </div>

                    <div className="timeline-node-body">
                      <div className="timeline-icon-box">
                        <IconRenderer name={step.icon} />
                      </div>
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>

                      {/* Interactive Document Accordion on Step 3 */}
                      {isStep3 && (
                        <div className="accordion-details-wrapper">
                          <button
                            type="button"
                            className="btn-details-trigger"
                            aria-expanded={docsExpanded}
                            aria-controls="required-docs-panel"
                            onClick={() => setDocsExpanded(!docsExpanded)}
                          >
                            <span>{step.detailLabel}</span>
                            <span className="trigger-arrow">{docsExpanded ? "▲" : "▼"}</span>
                          </button>

                          <div
                            id="required-docs-panel"
                            role="region"
                            className={`details-accordion-content${docsExpanded ? " expanded" : ""}`}
                          >
                            <ul className="details-checklist">
                              {step.notes.map((note, idx) => (
                                <li key={idx} className="checklist-item">
                                  <span className="chk-bullet" aria-hidden="true">✓</span>
                                  {note}
                                </li>
                              ))}
                            </ul>
                            <p className="docs-disclaimer-note">
                              Note: Documents are completed securely. No sensitive personal information (SSN, medical records) is collected or displayed on the public site.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Generic step note callouts */}
                      {!isStep3 && step.notes && step.notes.map((note, idx) => (
                        <div className="step-note-box" key={idx}>
                          <p>{note}</p>
                        </div>
                      ))}
                    </div>
                  </li>
                );
              })}

              {/* Final Timeline Success Milestone */}
              <li className="timeline-node-card milestone-success-node">
                <div className="timeline-node-header">
                  <span className="category-badge badge-success">SUCCESS</span>
                  <span className="step-count-badge">ARRIVED</span>
                </div>
                <div className="timeline-node-body">
                  <div className="timeline-icon-box success-icon">
                    <IconRenderer name="home" />
                  </div>
                  <h3>Welcome Day</h3>
                  <p>Upon review approval, transition to the home begins. You are welcomed into the program with direct support.</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* ─── 4. WHAT HAPPENS ON WELCOME DAY ────────── */}
      <section className="welcome-day-section" id="welcome-day">
        <div className="container">
          <div className="section-header" data-scroll-reveal>
            <span className="section-eyebrow">ARRIVAL PROCEDURES</span>
            <h2>What Happens on Welcome Day</h2>
            <p className="section-subtitle">
              Welcome Day is designed to help each new resident begin the program with clarity, preparation, and a warm introduction to the Faith Haven House community.
            </p>
          </div>

          <div className="welcome-day-grid">
            {WELCOME_DAY_STEPS.map((wd) => {
              const hasNotes = wd.notes && wd.notes.length > 0;
              return (
                <div className="wd-step-card" key={wd.number}>
                  <div className="wd-card-num">STAGE {wd.number}</div>
                  <h3>{wd.title}</h3>
                  <p>{wd.description}</p>
                  
                  {hasNotes && (
                    <div className="wd-integration-placeholder">
                      <span className="placeholder-tag">System Integration</span>
                      <p>{wd.notes[0]}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="wd-closing-banner" data-scroll-reveal>
            <p>
              The resident’s journey begins with faith, accountability, dignity, purpose, and a plan for moving forward.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 5. WHAT RESIDENTS CAN EXPECT ──────────── */}
      <section className="expectations-section" id="expectations">
        <div className="container">
          <div className="section-header section-header--center" data-scroll-reveal>
            <span className="section-eyebrow">THE LIVING ENVIRONMENT</span>
            <h2>What Residents Can Expect</h2>
            <p className="section-subtitle text-center">
              We provide the framework, but our residents drive their own rebuild. Here is what is expected and supported.
            </p>
          </div>

          <div className="expectations-cards-grid">
            {RESIDENT_EXPECTATIONS.map((exp, idx) => (
              <div className="exp-card" key={idx}>
                <div className="exp-icon-circle">
                  <IconRenderer name={exp.icon} className="exp-icon-svg" />
                </div>
                <h3>{exp.title}</h3>
                <p>{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. PRIVACY & FAIR REVIEW NOTICE ───────── */}
      <section className="privacy-notice-section" data-scroll-reveal>
        <div className="container">
          <div className="privacy-notice-card">
            <div className="privacy-notice-icon-box">
              <IconRenderer name="shield-check" className="privacy-svg" />
            </div>
            <div className="privacy-notice-content">
              <h2>Privacy, Respect, and Individual Review</h2>
              <p>
                Faith Haven House takes privacy seriously. Sensitive admissions information is handled through private staff and professional processes, not through public website pages.
              </p>
              <p>
                The admissions process is designed to review each applicant as an individual. The goal is to understand whether Faith Haven House can provide an appropriate, safe, and supportive environment for the applicant’s next steps.
              </p>
              <ul className="privacy-checklist">
                <li>
                  <span className="check-mark">✓</span> Sensitive information is handled privately.
                </li>
                <li>
                  <span className="check-mark">✓</span> Applications are reviewed individually.
                </li>
                <li>
                  <span className="check-mark">✓</span> Staff communicate next steps as clearly as possible.
                </li>
              </ul>
              <p className="privacy-footnote">
                Note: We handle all submitted documentation in accordance with strict private data practices. We do not make legal-compliance guarantees (such as HIPAA) on this public interface.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. START YOUR NEXT STEP CTA ────────────── */}
      <section className="admissions-closing-cta" data-scroll-reveal>
        <div className="container">
          <div className="closing-cta-box">
            <h2>Ready to Begin?</h2>
            <p>
              Start with a short initial interest form. A Faith Haven House team member will review your information and follow up about the next available step.
            </p>
            <div className="closing-cta-buttons">
              <Link href="/get-help" className="btn btn-primary">
                Start Your Next Step
              </Link>
              <Link href="/contact" className="btn btn-outline-light">
                Contact Faith Haven House
              </Link>
            </div>
            <p className="closing-disclaimer">
              Submitting an initial interest form does not guarantee admission or placement.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 8. FAQ AND CONTACT SUPPORT ─────────────── */}
      <section className="admissions-faq-section" id="faq" data-scroll-reveal>
        <div className="container">
          <div className="section-header section-header--center">
            <span className="section-eyebrow">COMMON INQUIRIES</span>
            <h2>Admissions FAQ</h2>
            <p className="section-subtitle text-center">
              Answers to common questions regarding our process and eligibility.
            </p>
          </div>

          <div className="faq-accordions-list">
            {ADMISSIONS_FAQS.map((faq) => {
              const isOpen = !!openFaqs[faq.id];
              return (
                <div key={faq.id} className={`faq-accordion-item${isOpen ? " active" : ""}`}>
                  <button
                    className="faq-accordion-trigger"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                  >
                    <h3>{faq.question}</h3>
                    <span className="faq-accordion-icon">{isOpen ? "−" : "+"}</span>
                  </button>
                  <div
                    id={`faq-answer-${faq.id}`}
                    role="region"
                    className={`faq-accordion-content${isOpen ? " expanded" : ""}`}
                  >
                    <div className="faq-accordion-inner">
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
