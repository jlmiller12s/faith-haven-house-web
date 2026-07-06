"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const DONATE_URL =
  "https://www.zeffy.com/en-US/embed/donation-form/donate-to-make-a-difference-13369?modal=true";

export default function Hero() {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const title    = container.querySelector(".hero-title--light");
    const tagline  = container.querySelector(".hero-tagline--light");
    const actions  = container.querySelector(".hero-actions");
    const metrics  = container.querySelectorAll(".hero-metric-item");

    const els = [title, tagline, actions, ...metrics].filter(Boolean);

    gsap.fromTo(
      els,
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.2,
      }
    );
  }, []);

  return (
    <section className="hero-fullvideo" id="hero" ref={ref}>
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="hero-video-bg"
      >
        <source
          src="/assets/hero-video.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark Overlay for Text Legibility */}
      <div className="hero-video-overlay" />

      {/* Content Overlay */}
      <div className="hero-content-container">
        <h1 className="hero-title--light">
          <span className="hero-title-line">Every call answered. Every bed filled.</span>
          <span className="hero-title-line dimmed-light">A sanctuary to rebuild lives.</span>
        </h1>

        <p className="hero-tagline hero-tagline--light">
          Faith Haven House provides a supportive network, daily shelter, and life skills coaching to guide unhoused men from transition to independent homeownership.
        </p>

        <div className="hero-actions">
          <a
            href={DONATE_URL}
            className="btn btn-primary"
            target="_blank"
            rel="noopener"
          >
            Donate Today
          </a>
          <a href="#volunteer" className="btn btn-outline-light">
            Join As Volunteer →
          </a>
        </div>
      </div>

      {/* Quick Facility Metrics Bar at bottom of Hero */}
      <div className="hero-metrics-bar">
        <div className="hero-metric-item">
          <label>AVERAGE STAY TO HOUSING</label>
          <div className="val">36 Days</div>
          <p>Transition to permanent residence</p>
        </div>
        <div className="hero-metric-item">
          <label>SAFETY &amp; PRESENCE</label>
          <div className="val">100% Hospitality</div>
          <p>Supervised daytime monitor SOP</p>
        </div>
        <div className="hero-metric-item">
          <label>FACILITY LOCATION</label>
          <div className="val">Saint Peters, MO</div>
          <p>7338 Mexico Road · Meeting physical &amp; spiritual needs</p>
        </div>
      </div>
    </section>
  );
}
