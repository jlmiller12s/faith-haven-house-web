"use client";

import { useRef, useState } from "react";
import useScrollReveal from "@/hooks/useScrollReveal";

const PARTNERS = [
  {
    name: "First Step Back Home",
    role: "Permanent Housing Transition Partner",
    desc: "Collaborating to transition Faith Haven House graduates directly into permanent lease housing.",
    details: "Faith Haven House works with First Step Back Home to help residents move from transitional shelter toward stable, independent housing.",
  },
  {
    name: "Veterans United Foundation",
    role: "Community Grant & Facility Sponsor",
    desc: "Providing vital financial support and community backing for facility improvements.",
    details: "Foundation support helps strengthen the facility and the practical environment residents need while rebuilding stability.",
  },
  {
    name: "St. Charles County Community Networks",
    role: "Local Faith & Civic Partners",
    desc: "Churches, local meal providers, and civic leaders uniting to support unhoused men.",
    details: "This network contributes meals, volunteer time, referrals, mentoring, and community connections throughout each resident’s transition.",
  },
];

export default function Partners() {
  const [openPartner, setOpenPartner] = useState(null);
  const ref = useRef(null);
  useScrollReveal(ref, "[data-reveal]", { stagger: 0.12, y: 28 });
  const togglePartner = (name) => {
    setOpenPartner((current) => (current === name ? null : name));
  };

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
          {PARTNERS.map((p) => {
            const isOpen = openPartner === p.name;
            return (
              <button
                type="button"
                className={`partner-card partner-card-button${isOpen ? " open" : ""}`}
                key={p.name}
                data-reveal
                aria-expanded={isOpen}
                aria-controls={`partner-details-${p.name.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => togglePartner(p.name)}
              >
                <span className="partner-role">{p.role}</span>
                <span className="partner-card-heading">
                  <h3>{p.name}</h3>
                  <span className="partner-card-toggle" aria-hidden="true">{isOpen ? "−" : "+"}</span>
                </span>
                <p>{p.desc}</p>
                <span
                  id={`partner-details-${p.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="partner-card-details"
                  hidden={!isOpen}
                >
                  {p.details}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
