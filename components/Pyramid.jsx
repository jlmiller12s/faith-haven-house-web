"use client";

import { useState, useRef } from "react";
import useScrollReveal from "@/hooks/useScrollReveal";

const TIERS = [
  { num: 3, name: "Safety & Shelter",  subtitle: "Level 3: Foundation" },
  { num: 2, name: "Support Network",   subtitle: "Level 2: The Core Network" },
  { num: 1, name: "Stable Living",     subtitle: "Level 1: Transition Peak" },
];

const CARDS = [
  {
    num: 3,
    subtitle: "Level 3: Foundation",
    title: "Safety, Food & Shelter",
    body: "Every recovery journey requires a secure foundation. We meet residents' immediate physical and spiritual needs by providing a warm bed, daily meal delivery via our partner networks, and a highly structured, drug-free shelter environment to ensure peace and restoration.",
    features: [
      { icon: "/assets/icon_restoration.png", alt: "Restoration Icon", text: "Nutritious Daily Meal Train" },
      { icon: "/assets/icon_hope.png",        alt: "Hope Icon",        text: "Secure, Welcoming Sanctuary" },
    ],
  },
  {
    num: 2,
    subtitle: "Level 2: The Core Network",
    title: "A Network of Support",
    body: "Residents do not walk the rebuilding path alone. We build a personalized web of care around each man — personal mentors, life skills coaching classes, and regular Daytime House Monitor presence to maintain order, listen, and offer spiritual encouragement.",
    features: [
      { icon: "/assets/icon_faith.png",         alt: "Faith Icon",         text: "One-on-One Men's Mentorship" },
      { icon: "/assets/icon_accountability.png", alt: "Accountability Icon", text: "Life Skills & Job Preparation" },
    ],
  },
  {
    num: 1,
    subtitle: "Level 1: Transition Peak",
    title: "Stable Living & Independence",
    body: "The peak of the Faith Haven House experience is independence. Once basic needs are established and local support resources are connected, residents work with mentors to transition into permanent housing, build a sustainable personal budget, and cultivate long-term self-sufficiency.",
    features: [
      { icon: "/assets/icon_homeownership.png", alt: "Homeownership Icon", text: "Permanent Housing Connections" },
      { icon: "/assets/icon_empowerment.png",   alt: "Empowerment Icon",   text: "Financial Independence & Jobs" },
    ],
  },
];

export default function Pyramid() {
  const [active, setActive] = useState(3);
  const ref = useRef(null);
  useScrollReveal(ref, "[data-reveal]", { stagger: 0.13, y: 28, start: "top 87%" });

  return (
    <section className="pyramid-section" id="pyramid" ref={ref}>
      <div className="container">
        <div className="section-header" data-reveal>
          <span className="section-eyebrow">Structured Transition</span>
          <h2 className="section-title">The Rebuilding Roadmap</h2>
          <p className="section-subtitle">
            Three interconnected layers of care take each resident from emergency shelter to self-sufficient homeownership.
          </p>
        </div>

        <div className="pyramid-layout">
          <div className="pyramid-visual">
            {TIERS.map((tier) => (
              <div
                key={tier.num}
                className={`pyramid-tier${active === tier.num ? " active" : ""}`}
                onClick={() => setActive(tier.num)}
                data-reveal
              >
                <span className="pyramid-tier-num">0{tier.num}</span>
                <span className="pyramid-tier-name">{tier.name}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--color-steel)" }}>
                  {tier.subtitle}
                </span>
              </div>
            ))}
          </div>

          <div className="pyramid-info-panel" data-reveal>
            {CARDS.map((card) => (
              <div
                key={card.num}
                className={`pyramid-card${active === card.num ? " active" : ""}`}
              >
                <span className="pyramid-card-subtitle">{card.subtitle}</span>
                <h3 className="pyramid-card-title">{card.title}</h3>
                <p className="pyramid-card-body">{card.body}</p>
                <div className="pyramid-features-list">
                  {card.features.map((f) => (
                    <div className="pyramid-feature-item" key={f.text}>
                      <img src={f.icon} alt={f.alt} />
                      <span>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
