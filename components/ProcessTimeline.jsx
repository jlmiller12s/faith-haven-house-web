"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useScrollReveal from "@/hooks/useScrollReveal";

const STEPS = [
  {
    num: "01",
    title: "Initial Inquiry & Eligibility Pre-Screen",
    desc: "A non-sensitive initial inquiry form evaluates basic eligibility, housing history, and immediate needs to determine placement readiness for unhoused men.",
  },
  {
    num: "02",
    title: "Safety, Warm Bed & Daily Meal Train",
    desc: "Residents receive immediate relief from the elements with secure lodging, clean living spaces, and nightly hot meal delivery supplied by community volunteers.",
  },
  {
    num: "03",
    title: "Daytime Monitor Presence & Rule SOP",
    desc: "Dedicated Daytime House Monitors maintain a structured, drug-free sanctuary, offering hospitality, boundary enforcement, and continuous staff presence.",
  },
  {
    num: "04",
    title: "Men's Mentorship & Life Skills Coaching",
    desc: "Weekly one-on-one mentorship pairs residents with experienced guides to work through financial literacy, resume creation, and personal accountability.",
  },
  {
    num: "05",
    title: "Transition to Permanent Independent Living",
    desc: "Graduates lock in employment, secure long-term lease housing via program partnerships, and step into self-sufficient homeownership.",
  },
];

export default function ProcessTimeline() {
  const containerRef = useRef(null);

  // Scroll reveal stagger for header and step cards
  useScrollReveal(containerRef, "[data-reveal]", { stagger: 0.12, y: 35, start: "top 88%" });

  // ScrollTrigger for step cards highlighting as they pass screen center
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const cards = containerRef.current?.querySelectorAll(".process-step-card");
    if (!cards?.length) return;

    const triggers = [];
    cards.forEach((card) => {
      triggers.push(
        ScrollTrigger.create({
          trigger: card,
          start: "top 75%",
          end: "bottom 25%",
          onEnter:     () => card.classList.add("active"),
          onLeave:     () => card.classList.remove("active"),
          onEnterBack: () => card.classList.add("active"),
          onLeaveBack: () => card.classList.remove("active"),
        })
      );
    });

    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <section className="process-section" id="get-help" ref={containerRef}>
      <div className="container">
        <div className="process-layout">
          <div className="process-pinned-col">
            <div data-reveal>
              <span className="section-eyebrow">End-to-End Recovery Flow</span>
              <h2 className="section-title" style={{ color: "var(--color-ivory)" }}>
                The 5-Stage Rebuilding Process
              </h2>
              <p className="section-subtitle" style={{ color: "rgba(248,246,241,0.65)", maxWidth: "480px" }}>
                From initial pre-screen intake to independent homeownership, every resident progresses
                through a structured, transparent timeline of care.
              </p>
            </div>
          </div>

          <div className="process-steps-col">
            {STEPS.map((step) => (
              <div className="process-step-card" key={step.num} data-reveal>
                <div className="process-step-header">
                  <span className="process-step-num">STAGE {step.num}</span>
                </div>
                <h3 className="process-step-title">{step.title}</h3>
                <p className="process-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
