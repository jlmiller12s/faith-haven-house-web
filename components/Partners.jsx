"use client";

import { useRef } from "react";
import useScrollReveal from "@/hooks/useScrollReveal";

const PARTNERS = [
  {
    name: "First Step Back Home",
    role: "Permanent Housing Transition Partner",
    desc: "Collaborating to transition Faith Haven House graduates directly into permanent lease housing.",
  },
  {
    name: "Veterans United Foundation",
    role: "Community Grant & Facility Sponsor",
    desc: "Providing vital financial support and community backing for facility improvements.",
  },
  {
    name: "St. Charles County Community Networks",
    role: "Local Faith & Civic Partners",
    desc: "Churches, local meal providers, and civic leaders uniting to support unhoused men.",
  },
];

export default function Partners() {
  const ref = useRef(null);
  useScrollReveal(ref, "[data-reveal]", { stagger: 0.12, y: 28 });

  return (
    <section className="partners-section" id="partners" ref={ref}>
      <div className="container">
        <div className="section-header" data-reveal>
          <span className="section-eyebrow">Collaborative Network</span>
          <h2 className="section-title">Our Partners</h2>
          <p className="section-subtitle">
            Restoration is impossible alone. We are proud to partner with leading organizations in St. Charles County.
          </p>
        </div>

        <div className="partners-grid">
          {PARTNERS.map((p) => (
            <div className="partner-card" key={p.name} data-reveal>
              <span className="partner-role">{p.role}</span>
              <h3>{p.name}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
