"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const TEAM_MEMBERS = [
  {
    id: "dareth-jeffers",
    name: "Dareth Renee Jeffers",
    role: "Founder & Visionary Leader",
    badge: "In Loving Memory",
    image: "/assets/dareth.jpg",
    quote: "Rebuilding lives, restoring hope, and walking beside men on their journey to stability.",
    bio: [
      "Dareth founded Faith Haven House from a deep desire to uplift men experiencing housing instability and to help create a clearer path toward stability, responsibility, and long-term independence.",
      "She understood that transformation often begins with a safe place, practical support, meaningful accountability, and someone willing to believe that a difficult season does not have to define a person’s future."
    ],
    highlightLink: {
      text: "Read Dareth's Full Memorial Legacy →",
      href: "/about/dareth-jeffers"
    }
  },
  {
    id: "marshall-robinson",
    name: "Marshall Robinson",
    role: "Community Operations & Leadership",
    badge: "Leadership Team",
    image: "/assets/marshall-robinson.JPG",
    quote: "Every individual deserves a sanctuary of dignity, mentorship, and a clear pathway forward.",
    bio: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vel hendrerit libero. Proin magna justo, auctor in ligula at, imperdiet tristique libero. Nullam convallis tellus at nunc auctor, sed pretium eros vehicula. Vivamus in lorem at diam viverra sodales. Suspendisse potenti. Integer finibus vulputate sapien, in ultrices velit imperdiet eget.",
      "Ut convallis, sem sit amet interdum consectetuer, odio augue aliquam leo, nec dapibus tortor nibh sed augue. Integer eu magna sit amet metus fermentum posuere. Morbi sit amet nulla. Sed id ligula quis est convallis tempor. Curabitur aliquet quam id dui. Cras dapibus. Vivamus elementum semper nisi.",
      "Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metust varius laoreet. Quisque rutrum. Aenean imperdiet."
    ]
  }
];

export default function TeamPage() {
  const [viewMode, setViewMode] = useState("fan"); // "fan" or "grid"
  const [selectedMember, setSelectedMember] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const stageRef = useRef(null);
  const modalRef = useRef(null);
  const modalContentRef = useRef(null);

  // Compute Fan Deck placement parameters
  const total = TEAM_MEMBERS.length;
  const midIndex = (total - 1) / 2;

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Hero Entrance Reveal
      gsap.fromTo(
        ".team-hero-eyebrow, .team-hero-title, .team-hero-subtitle, .view-mode-toggle",
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.12,
          ease: "power3.out"
        }
      );

      // 2. GSAP Card Fan ScrollTrigger Spread Animation
      if (stageRef.current) {
        const cards = gsap.utils.toArray(".cf_card");

        // Set initial state: cards smoothly fan out into centered radial arc
        cards.forEach((card, i) => {
          const factor = i - midIndex;
          const targetRotation = factor * 8; // degrees fan spread
          const targetX = factor * 190; // horizontal spread px
          const targetY = Math.pow(Math.abs(factor), 1.6) * 5; // parabolic arc

          gsap.fromTo(
            card,
            {
              rotation: 0,
              x: 0,
              y: 20,
              transformOrigin: "50% 90%"
            },
            {
              rotation: targetRotation,
              x: targetX,
              y: targetY,
              duration: 1.1,
              stagger: 0.05,
              ease: "power3.out",
              scrollTrigger: {
                trigger: stageRef.current,
                start: "top 85%",
                toggleActions: "play none none reverse"
              }
            }
          );
        });
      }
    });

    return () => ctx.revert();
  }, [viewMode, midIndex]);

  // Handle Modal Open Animation with GSAP
  const handleOpenModal = (member) => {
    setSelectedMember(member);
    document.body.style.overflow = "hidden";
    if (typeof window !== "undefined" && window.lenis?.stop) {
      window.lenis.stop();
    }
  };

  useEffect(() => {
    if (selectedMember && modalRef.current && modalContentRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: "power2.out" }
      );

      gsap.fromTo(
        modalContentRef.current,
        { scale: 0.86, y: 40, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.45, ease: "back.out(1.2)" }
      );
    }
  }, [selectedMember]);

  // Modal Close Animation
  const handleCloseModal = () => {
    if (modalRef.current && modalContentRef.current) {
      gsap.to(modalContentRef.current, {
        scale: 0.92,
        y: 25,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in"
      });

      gsap.to(modalRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setSelectedMember(null);
          document.body.style.overflow = "";
          if (typeof window !== "undefined" && window.lenis?.start) {
            window.lenis.start();
          }
        }
      });
    } else {
      setSelectedMember(null);
      document.body.style.overflow = "";
      if (typeof window !== "undefined" && window.lenis?.start) {
        window.lenis.start();
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && selectedMember) {
        handleCloseModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMember]);

  return (
    <div className="team-page-wrapper">
      {/* Background Ambient Orbs */}
      <div className="team-bg-orb orb-1" aria-hidden="true" />
      <div className="team-bg-orb orb-2" aria-hidden="true" />

      <div className="container">
        {/* HERO SECTION */}
        <section className="team-hero-section">
          <span className="team-hero-eyebrow">FAITH HAVEN HOUSE LEADERSHIP</span>
          <h1 className="team-hero-title">Meet the Heart Behind Our Mission</h1>
          <p className="team-hero-subtitle">
            Our dedicated team and compassionate leaders walk alongside every resident at Faith Haven House,
            offering dignity, guidance, and support on the journey to stability.
          </p>

          {/* VIEW MODE TOGGLE (FAN DECK VS GRID) */}
          <div className="view-mode-toggle">
            <button
              className={`toggle-btn ${viewMode === "fan" ? "active" : ""}`}
              onClick={() => setViewMode("fan")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
              Interactive Card Fan Deck
            </button>
            <button
              className={`toggle-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              Grid View
            </button>
          </div>

          <div className="team-click-hint">
            <span className="hint-icon">✦</span>
            <span>
              {viewMode === "fan"
                ? "Hover over cards to fan inspect • Click any image to enlarge photo & bio"
                : "Click any card to enlarge employee photo & bio"}
            </span>
          </div>
        </section>

        {/* 1. FAN DECK VIEW (ANNANIMATE.COM/ANIMATIONS/CARD-FAN STYLE) */}
        {viewMode === "fan" && (
          <section className="team-fan-container" ref={stageRef}>
            <div className="cf_stage">
              <div className="cf_stack" data-ann-cf-stack="true">
                {TEAM_MEMBERS.map((member, index) => {
                  const factor = index - midIndex;
                  const isHovered = hoveredId === member.id;
                  const baseZ = Math.round(100 - Math.abs(factor) * 10);
                  const zIndex = isHovered ? 500 : baseZ;

                  return (
                    <div
                      key={member.id}
                      className={`cf_card ${isHovered ? "is-hovered" : ""}`}
                      style={{
                        zIndex,
                        willChange: "transform"
                      }}
                      onMouseEnter={() => setHoveredId(member.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => handleOpenModal(member)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleOpenModal(member);
                        }
                      }}
                      aria-label={`View ${member.name}'s bio and photo`}
                    >
                      <div className="cf_card_inner">
                        <div className="cf_card_media">
                          <img
                            src={member.image}
                            alt={member.name}
                            className="cf_card_img"
                            loading="lazy"
                          />
                          <div className="cf_card_overlay">
                            <span className="cf_expand_tag">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <polyline points="9 21 3 21 3 15"></polyline>
                                <line x1="21" y1="3" x2="14" y2="10"></line>
                                <line x1="3" y1="21" x2="10" y2="14"></line>
                              </svg>
                              Enlarge Photo &amp; Bio
                            </span>
                          </div>
                        </div>

                        <div className="cf_card_info">
                          <span className="cf_badge">{member.badge}</span>
                          <h3 className="cf_name">{member.name}</h3>
                          <p className="cf_role">{member.role}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 2. ALTERNATE GRID VIEW */}
        {viewMode === "grid" && (
          <section className="team-grid-section">
            <div className="team-grid">
              {TEAM_MEMBERS.map((member) => (
                <div
                  key={member.id}
                  className="team-card"
                  onClick={() => handleOpenModal(member)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleOpenModal(member);
                    }
                  }}
                  aria-label={`View ${member.name}'s bio and photo`}
                >
                  <div className="team-card-image-wrapper">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="team-card-img"
                      loading="lazy"
                    />
                    <div className="team-card-overlay">
                      <span className="expand-badge">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <polyline points="9 21 3 21 3 15"></polyline>
                          <line x1="21" y1="3" x2="14" y2="10"></line>
                          <line x1="3" y1="21" x2="10" y2="14"></line>
                        </svg>
                        Enlarge &amp; Read Bio
                      </span>
                    </div>
                  </div>

                  <div className="team-card-info">
                    <span className="team-card-badge">{member.badge}</span>
                    <h3 className="team-card-name">{member.name}</h3>
                    <p className="team-card-role">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CALL TO ACTION */}
        <section className="team-cta-section">
          <div className="team-cta-card">
            <div className="team-cta-content">
              <span className="team-cta-eyebrow">JOIN OUR COMMUNITY</span>
              <h2 className="team-cta-title">Interested in Partnering or Volunteering?</h2>
              <p className="team-cta-desc">
                Faith Haven House thrives through community mentors, sponsors, and supporters. Explore ways to get involved today.
              </p>
            </div>
            <div className="team-cta-actions">
              <Link href="/volunteer" className="btn btn-primary">
                Become a Volunteer →
              </Link>
              <Link href="/contact" className="btn btn-secondary">
                Get in Touch
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ENLARGED PHOTO & BIO MODAL */}
      {selectedMember && (
        <div
          className="team-modal-backdrop"
          ref={modalRef}
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-member-name"
        >
          <div
            className="team-modal-container"
            ref={modalContentRef}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="team-modal-close-btn"
              onClick={handleCloseModal}
              aria-label="Close Bio Modal"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="team-modal-grid">
              {/* Left Column: Enlarged High-Res Image */}
              <div className="team-modal-image-col">
                <div className="team-modal-img-frame">
                  <img
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    className="team-modal-img"
                  />
                  <div className="team-modal-img-caption">
                    <span className="caption-badge">{selectedMember.badge}</span>
                    <span className="caption-name">{selectedMember.name}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Details & Lorem Ipsum Bio Placeholder */}
              <div className="team-modal-details-col">
                <span className="team-modal-eyebrow">{selectedMember.badge}</span>
                <h2 id="modal-member-name" className="team-modal-title">
                  {selectedMember.name}
                </h2>
                <p className="team-modal-role">{selectedMember.role}</p>

                {/* Highlight Quote */}
                {selectedMember.quote && (
                  <blockquote className="team-modal-quote">
                    “{selectedMember.quote}”
                  </blockquote>
                )}

                {/* Lorem Ipsum Bio Paragraphs */}
                <div className="team-modal-bio">
                  <h4 className="bio-section-heading">Biography &amp; Overview</h4>
                  {selectedMember.bio.map((paragraph, idx) => (
                    <p key={idx} className="bio-paragraph">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Optional Highlight Link */}
                {selectedMember.highlightLink && (
                  <div className="team-modal-legacy-link">
                    <Link
                      href={selectedMember.highlightLink.href}
                      className="btn btn-primary"
                      onClick={handleCloseModal}
                    >
                      {selectedMember.highlightLink.text}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
