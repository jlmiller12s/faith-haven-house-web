"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ROADMAP_STAGES, SUPPORT_ITEMS } from "./roadmapData";

/* ─── Helper: SVG Icons ─────────────────────────────── */
function PathIcon({ className }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21l6-6m0 0l6-6m-6 6l6 6m6-18l-6 6" />
    </svg>
  );
}

function ChevronRight({ className }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ─── 1. Hero ────────────────────────────────────────── */
function RoadmapHero() {
  const ref = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-hero-reveal]",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out", delay: 0.1 }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="rm-hero" ref={ref}>
      {/* Decorative path motif */}
      <div className="rm-hero-path" aria-hidden="true">
        <div className="rm-hero-path-line" />
        <div className="rm-hero-path-dots">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className="rm-hero-path-dot" />
          ))}
        </div>
      </div>

      <div className="container rm-hero-content">
        <span className="section-eyebrow" data-hero-reveal>
          FROM UNHOUSED TO HOMEOWNERSHIP
        </span>
        <h1 className="rm-hero-title" data-hero-reveal>
          The Faith Haven <span className="rm-hero-accent">Roadmap</span>
        </h1>
        <p className="rm-hero-lead" data-hero-reveal>
          Faith Haven House provides a structured, faith-centered pathway for men seeking stability,
          accountability, practical support, and a stronger foundation for long-term independence.
        </p>
        <p className="rm-hero-sub" data-hero-reveal>
          Every resident arrives with a different story. The roadmap gives each man a clear set of
          next steps while allowing the journey to be personalized around his needs, goals, and
          readiness.
        </p>
        <div className="rm-hero-actions" data-hero-reveal>
          <Link href="/get-help" className="btn btn-primary">
            Start Your Next Step
          </Link>
          <Link href="/donate" className="btn btn-outline">
            Support the Roadmap
          </Link>
        </div>
      </div>

      {/* Five-step teaser strip */}
      <div className="rm-hero-strip" aria-hidden="true">
        {ROADMAP_STAGES.map((s, i) => (
          <div key={s.number} className="rm-hero-strip-step">
            <span className="rm-strip-num">{s.number}</span>
            <span className="rm-strip-title">{s.title}</span>
            {i < ROADMAP_STAGES.length - 1 && <ChevronRight className="rm-strip-chevron" />}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── 2. Timeline Overview ───────────────────────────── */
function RoadmapTimeline() {
  const ref = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".rm-timeline-step",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 82%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="rm-timeline-section" ref={ref}>
      <div className="container">
        <div className="section-header section-header--center">
          <span className="section-eyebrow">THE JOURNEY</span>
          <h2 className="section-title">Five Stages of the Roadmap</h2>
          <p className="section-subtitle">
            The Faith Haven Roadmap is designed to help residents move from immediate instability
            toward practical readiness, personal growth, and a sustainable future.
          </p>
        </div>

        <nav className="rm-timeline" aria-label="Roadmap stages overview">
          {ROADMAP_STAGES.map((stage, i) => (
            <a
              key={stage.number}
              href={`#stage-${stage.number}`}
              className="rm-timeline-step"
            >
              <div className="rm-timeline-node">
                <span className="rm-timeline-node-num">{stage.number}</span>
              </div>
              <div className="rm-timeline-step-label">
                <p className="rm-timeline-step-title">{stage.title}</p>
              </div>
              {i < ROADMAP_STAGES.length - 1 && (
                <div className="rm-timeline-connector" aria-hidden="true" />
              )}
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}

/* ─── 3. Stage Card ──────────────────────────────────── */
function RoadmapStage({ stage, index }) {
  const ref = useRef(null);
  const isEven = index % 2 === 0;

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const card = ref.current?.querySelector(".rm-stage-card");
      const detail = ref.current?.querySelector(".rm-stage-detail");

      if (card) {
        gsap.fromTo(
          card,
          { x: isEven ? -80 : 80, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
          }
        );
      }
      if (detail) {
        gsap.fromTo(
          detail,
          { x: isEven ? 80 : -80, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            delay: 0.12,
            scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
          }
        );
      }
    }, ref);
    return () => ctx.revert();
  }, [isEven]);

  return (
    <article
      className={`rm-stage${isEven ? " rm-stage--even" : " rm-stage--odd"}`}
      id={`stage-${stage.number}`}
      ref={ref}
    >
      <div className="container rm-stage-grid">
        {/* Card Side */}
        <div className="rm-stage-card">
          <div className="rm-stage-card-inner">
            <div className="rm-stage-badge">
              <span className="rm-stage-num">{stage.number} — {stage.title.toUpperCase()}</span>
            </div>

            <div className="rm-stage-icon-wrap">
              <img
                src={stage.icon}
                alt={stage.iconAlt}
                className="rm-stage-icon"
                loading="lazy"
              />
            </div>

            <h2 className="rm-stage-headline">{stage.headline}</h2>
            <p className="rm-stage-desc">{stage.description}</p>

            {/* Example mini-card */}
            <div className="rm-stage-example">
              <span className="rm-example-label">What this can look like</span>
              <p className="rm-example-text">{stage.example}</p>
            </div>
          </div>
        </div>

        {/* Detail Side */}
        <div className="rm-stage-detail">
          <h3 className="rm-detail-heading">Focus Areas</h3>
          <ul className="rm-focus-list">
            {stage.focusAreas.map((area) => (
              <li key={area} className="rm-focus-item">
                <CheckIcon className="rm-focus-icon" />
                <span>{area}</span>
              </li>
            ))}
          </ul>

          {/* Stage 3 — Tools subsection */}
          {stage.tools && (
            <div className="rm-tools-grid">
              <h4 className="rm-tools-heading">Tools for a Stronger Future</h4>
              <div className="rm-tools-cards">
                {stage.tools.map((tool) => (
                  <div key={tool.label} className="rm-tool-card">
                    <img src={tool.icon} alt="" aria-hidden="true" className="rm-tool-icon" />
                    <span className="rm-tool-label">{tool.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stage 4 — Milestones subsection */}
          {stage.milestones && (
            <div className="rm-milestones">
              <h4 className="rm-tools-heading">Example Milestones</h4>
              <p className="rm-milestone-disclaimer">
                These are examples, not requirements for every resident.
              </p>
              <div className="rm-milestone-grid">
                {stage.milestones.map((m) => (
                  <div key={m} className="rm-milestone-chip">{m}</div>
                ))}
              </div>
            </div>
          )}

          {/* Stage 5 — Closing statement */}
          {stage.closingStatement && (
            <blockquote className="rm-closing-quote">
              <p>{stage.closingStatement}</p>
            </blockquote>
          )}
        </div>
      </div>

      {/* Stage connector to next */}
      {index < ROADMAP_STAGES.length - 1 && (
        <div className="rm-stage-connector" aria-hidden="true">
          <div className="rm-connector-line" />
          <div className="rm-connector-arrow">↓</div>
        </div>
      )}
    </article>
  );
}

/* ─── 4. Support Grid ────────────────────────────────── */
function SupportGrid() {
  const ref = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".rm-support-card",
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.07,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 82%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="rm-support-section" ref={ref}>
      <div className="container">
        <div className="section-header section-header--center">
          <span className="section-eyebrow">ALONGSIDE EVERY STEP</span>
          <h2 className="section-title">Support Along the Way</h2>
          <p className="section-subtitle">
            Each resident's plan is different, but Faith Haven House can help connect men with
            practical support, spiritual encouragement, and resources that strengthen their next
            steps.
          </p>
        </div>

        <div className="rm-support-grid">
          {SUPPORT_ITEMS.map((item) => (
            <div key={item.label} className="rm-support-card">
              <img src={item.icon} alt="" aria-hidden="true" className="rm-support-icon" />
              <p className="rm-support-label">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 5. Progress Is Personal ────────────────────────── */
function ProgressPersonal() {
  const ref = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-personal-reveal]",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.14,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 82%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="rm-personal-section" ref={ref}>
      <div className="container">
        <div className="rm-personal-card" data-personal-reveal>
          <div className="rm-personal-inner">
            <span className="section-eyebrow">DIGNITY-CENTERED PROGRESS</span>
            <h2 className="rm-personal-title" data-personal-reveal>
              Every Journey Looks Different
            </h2>

            <p className="rm-personal-body" data-personal-reveal>
              No two residents begin in the same place. Some men may already have employment but
              need stable housing. Others may need documents, transportation, training, stronger
              financial habits, or a support system to move forward.
            </p>

            <p className="rm-personal-body" data-personal-reveal>
              The Faith Haven Roadmap provides structure without treating people like a number.
              Progress is measured through meaningful next steps, consistent effort,
              accountability, and a growing foundation for independence.
            </p>

            <div className="rm-oneaway-callout" data-personal-reveal>
              <div className="rm-oneaway-icon-wrap" aria-hidden="true">
                <img src="/assets/icon_hope.png" alt="" className="rm-oneaway-icon" />
              </div>
              <p className="rm-oneaway-text">
                Many people are only one injury, one job loss, one medical emergency, or one broken
                support system away from housing instability. Faith Haven House exists to help
                create a next step forward.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 6. CTA ─────────────────────────────────────────── */
function RoadmapCta() {
  const ref = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".rm-cta-panel",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.18,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 85%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="rm-cta-section" ref={ref}>
      <div className="container rm-cta-grid">
        {/* Left CTA */}
        <div className="rm-cta-panel rm-cta-panel--resident">
          <div className="rm-cta-icon-wrap">
            <img src="/assets/icon_hope.png" alt="" aria-hidden="true" className="rm-cta-icon" />
          </div>
          <h2 className="rm-cta-heading">Looking for a Next Step?</h2>
          <p className="rm-cta-body">
            Start with a confidential initial interest form. A Faith Haven House team member can
            follow up to discuss your situation and available next steps.
          </p>
          <Link href="/get-help" className="btn btn-primary rm-cta-btn">
            Start Your Next Step
          </Link>
        </div>

        {/* Right CTA */}
        <div className="rm-cta-panel rm-cta-panel--donor">
          <div className="rm-cta-icon-wrap">
            <img src="/assets/icon_restoration.png" alt="" aria-hidden="true" className="rm-cta-icon" />
          </div>
          <h2 className="rm-cta-heading">Help Fund the Roadmap</h2>
          <p className="rm-cta-body">
            Donations, volunteers, churches, and community partners help make this pathway
            possible for men working toward stability and independence.
          </p>
          <Link href="/donate" className="btn btn-outline-light rm-cta-btn">
            Support Faith Haven House
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Main Page Component ────────────────────────────── */
export default function RoadmapPage() {
  return (
    <div className="rm-page">
      <RoadmapHero />
      <RoadmapTimeline />

      <section className="rm-stages-section" aria-label="Five roadmap stages">
        {ROADMAP_STAGES.map((stage, i) => (
          <RoadmapStage key={stage.number} stage={stage} index={i} />
        ))}
      </section>

      <SupportGrid />
      <ProgressPersonal />
      <RoadmapCta />
    </div>
  );
}
