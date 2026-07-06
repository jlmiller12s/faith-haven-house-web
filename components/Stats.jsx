"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useScrollReveal from "@/hooks/useScrollReveal";

const STATS = [
  {
    target: 36,
    suffix: "",
    display: "36",
    label: "Days to Housing",
    desc: "The average time residents spend with us before securing employment and transitioning to permanent housing.",
  },
  {
    target: 100,
    suffix: "%",
    display: "100%",
    label: "Safety & Presence",
    desc: "Our dedicated Daytime House Monitors ensure continuous staff presence, maintaining rules and a hospitality-focused sanctuary.",
  },
  {
    target: 1,
    suffix: " Goal",
    display: "1 Goal",
    label: "Unified Transition",
    desc: "An individualized rebuilding process focused on guiding every resident to a self-sufficient, stable living environment.",
  },
];

export default function Stats() {
  const containerRef = useRef(null);

  // Staggered reveal for section header + cards
  useScrollReveal(containerRef, "[data-reveal]", { stagger: 0.15, y: 35, start: "top 88%" });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const container = containerRef.current;
    if (!container) return;

    const nums = container.querySelectorAll(".stat-num[data-target]");
    if (!nums.length) return;

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top 90%",
      once: true,
      onEnter: () => {
        nums.forEach((numEl) => {
          const targetVal = parseInt(numEl.getAttribute("data-target"), 10);
          const suffix    = numEl.getAttribute("data-suffix") || "";
          const counter   = { val: 0 };

          gsap.to(counter, {
            val: targetVal,
            duration: 1.8,
            ease: "power2.out",
            onUpdate: () => {
              numEl.textContent = Math.round(counter.val) + suffix;
            },
          });
        });
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <section className="stats-section" ref={containerRef}>
      <div className="container">
        <div className="section-header" data-reveal>
          <span className="section-eyebrow">Measurable Recovery</span>
          <h2 className="section-title">The Transition Metrics</h2>
        </div>
        <div className="stats-grid">
          {STATS.map((s) => (
            <div className="stat-card" key={s.label} data-reveal>
              <div className="stat-num" data-target={s.target} data-suffix={s.suffix}>
                {s.display}
              </div>
              <h3 className="stat-label">{s.label}</h3>
              <p className="stat-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
